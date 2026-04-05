import { env } from "cloudflare:workers"
import { httpServerHandler } from "cloudflare:node";
import express from "express";
import cors from "cors";
import { Strategy as LocalStrategy } from 'passport-local'
import crypto from "node:crypto"
import { Buffer } from "node:buffer"
import { ROUTES} from "../src/constants"
import passport from 'passport'
import session from 'express-session'

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

function toPublicUser(row) {
  if (!row) return null;
  return {
    user_id: row.user_id,
    role_id: row.role_id,
    role: row.role,
    name: row.name,
    email: row.email,
  };
}

function verifyPasswordAgainstRow(row, password) {
  return new Promise((resolve, reject) => {
    if (!row || password === undefined || password === null) return resolve(false);
    const pwd = String(password);
    crypto.pbkdf2(pwd, Buffer.from(row.salt), 310000, 32, 'sha256', (err, hashedPassword) => {
      if (err) return reject(err);
      try {
        resolve(crypto.timingSafeEqual(Buffer.from(row.hashedPassword), hashedPassword));
      } catch {
        resolve(false);
      }
    });
  });
}

function KVStore(options) {
  this.client = options.client;
}

KVStore.prototype.__proto__ = session.Store.prototype;

KVStore.prototype.get = async function(sid, callback) {
  console.log("KVStore.get:", sid);
  try {
    const data = await this.client.get(`sess:${sid}`);
    console.log("KVStore.get result:", data);
    callback(null, data ? JSON.parse(data) : null);
  } catch(err) {
    console.log("KVStore.get error:", err);
    callback(err);
  }
};

KVStore.prototype.set = async function(sid, session, callback) {
  console.log("KVStore.set:", sid, JSON.stringify(session));
  try {
    const ttl = session.cookie.maxAge ? Math.floor(session.cookie.maxAge / 1000) : 86400;
    await this.client.put(`sess:${sid}`, JSON.stringify(session), { expirationTtl: ttl });
    console.log("KVStore.set success");
    callback(null);
  } catch(err) {
    console.log("KVStore.set error:", err);
    callback(err);
  }
};

KVStore.prototype.destroy = async function(sid, callback) {
  console.log("KVStore.destroy:", sid);
  try {
    await this.client.delete(`sess:${sid}`);
    callback(null);
  } catch(err) {
    console.log("KVStore.destroy error:", err);
    callback(err);
  }
};

app.use((req, res, next) => {
  session({
    store: new KVStore({client: env.SESSION_STORE}),
    secret: 'pink puffle elephant toaster',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    },
  })(req, res, next);
});
app.use(passport.session());
app.use(passport.initialize());


passport.serializeUser((user, done) => {
  done(null, user.user_id);
})


passport.deserializeUser(async (id, done) => {
  const user = await env.DB.prepare("select * from user where user_id = ?")
    .bind(id)
    .first();
  console.log("deserializing id:", id, "found user:", user);
  done(null, user);
})

passport.use(new LocalStrategy(
{usernameField: 'email'},
  function verify(email, password, cb)
{
  env.DB.prepare("select * from user where email = ?")
    .bind(email)
    .first()
    .then((row) => {
      if(!row) {console.log("Incorrect email or password."); return cb(null, false, { message: 'Incorrect email or password.' });}

      crypto.pbkdf2(password, Buffer.from(row.salt), 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if(!crypto.timingSafeEqual(Buffer.from(row.hashedPassword), hashedPassword)) {
          return cb(null, false, { message: 'Incorrect email or password.' });
        }

        return cb(null, row);

      })
    })
    .catch((err) =>
    {
      console.log("Error here");
      return cb(err);
    });
}));

app.post('/login/password', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) {return next(err);}
    if(!user) {
      return res.status(401).json({message: info?.message || 'Incorrect email or password.'});
    }
    req.login(user, (err) => {
      if(err) {return next(err);}
      req.session.save((err) => {
        if(err) {return next(err);}
        res.end(JSON.stringify({redirect: ROUTES.DASHBOARD}));
      });
    });
  })(req, res, next);
});

app.post('/signup/password', function(req, res, next) {
  const roleRaw = req.body.role;
  let roleId = 0;
  if (roleRaw === 1 || roleRaw === '1') {
    roleId = 1;
  } else if (roleRaw === 0 || roleRaw === '0' || roleRaw === undefined || roleRaw === null || roleRaw === '') {
    roleId = 0;
  } else {
    return res.status(400).json({ message: 'Invalid account type.' });
  }

  const salt = crypto.randomBytes(16);

  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
    if (err) { return next(err); }

    try {
      await env.DB.prepare(
        "insert into user(role_id, name, email, hashedPassword, salt, role) values (?, ?, ?, ?, ?, ?)"
      )
        .bind(roleId, req.body.name, req.body.email, hashedPassword, salt, roleId)
        .run();

      const user = await env.DB.prepare(
        "select * from user where email = ?"
      )
        .bind(req.body.email)
        .first();

      req.login(user, function(err) {
        console.log("req.login called, err:", err);
        if (err) { return next(err); }
        req.session.save(function(err) {
          console.log("set-cookie header:", res.getHeader('Set-Cookie'));
           console.log("session saved, err:", err);
          if(err) { return next(err); }
          const payload = JSON.stringify({ redirect: ROUTES.DASHBOARD});
          console.log("sending payload:", JSON.stringify(payload)); 
          res.setHeader('Content-Type', 'application/json');
          res.end(payload);
        });
      });
    } catch(err) {
      return next(err);
    }
  });
});

app.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if(err) { return next(err); }
    req.session.destroy(function(err) {
      if(err) { return next(err); }
      res.json({ redirect: ROUTES.LOGIN});
    });
  });
});

app.get('/login/me', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  console.log("session:", req.session);
  console.log("isAuthenticated:", req.isAuthenticated());
  console.log("user:", req.user);
  if(req.isAuthenticated()) {
    res.json({ user: toPublicUser(req.user) });
  } else {
    res.status(401).json({ user: null});
  }
});

app.patch('/api/account/profile', async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not logged in' });
  try {
    const name = String(req.body.name ?? '').trim();
    const email = String(req.body.email ?? '').trim().toLowerCase();
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }
    const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!simpleEmail.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    const other = await env.DB.prepare(
      'SELECT user_id FROM user WHERE lower(email) = ? AND user_id != ?'
    ).bind(email, req.user.user_id).first();
    if (other) {
      return res.status(409).json({ message: 'That email is already in use.' });
    }
    await env.DB.prepare(
      'UPDATE user SET name = ?, email = ? WHERE user_id = ?'
    ).bind(name, email, req.user.user_id).run();
    const updated = await env.DB.prepare('SELECT * FROM user WHERE user_id = ?').bind(req.user.user_id).first();
    req.login(updated, (err) => {
      if (err) return next(err);
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        res.json({ user: toPublicUser(updated) });
      });
    });
  } catch (e) {
    next(e);
  }
});

app.patch('/api/account/password', (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not logged in' });
  const newPwd = String(req.body.newPassword ?? '');
  if (newPwd.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }
  const userId = req.user.user_id;
  env.DB.prepare('SELECT * FROM user WHERE user_id = ?').bind(userId).first()
    .then((row) => verifyPasswordAgainstRow(row, req.body.currentPassword))
    .then((ok) => {
      if (!ok) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
      const salt = crypto.randomBytes(16);
      crypto.pbkdf2(newPwd, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
        if (err) return next(err);
        try {
          await env.DB.prepare(
            'UPDATE user SET hashedPassword = ?, salt = ? WHERE user_id = ?'
          ).bind(hashedPassword, salt, userId).run();
          const updated = await env.DB.prepare('SELECT * FROM user WHERE user_id = ?').bind(userId).first();
          req.login(updated, (e) => {
            if (e) return next(e);
            req.session.save((se) => {
              if (se) return next(se);
              res.json({ ok: true });
            });
          });
        } catch (e) {
          next(e);
        }
      });
    })
    .catch(next);
});

app.post('/api/account/delete', async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not logged in' });
  const userId = req.user.user_id;
  try {
    const row = await env.DB.prepare('SELECT * FROM user WHERE user_id = ?').bind(userId).first();
    const ok = await verifyPasswordAgainstRow(row, req.body.currentPassword);
    if (!ok) {
      return res.status(401).json({ message: 'Password is incorrect.' });
    }
    const profCourses = await env.DB.prepare('SELECT course_id FROM course WHERE prof_id = ?').bind(userId).all();
    const courses = profCourses.results || [];
    for (const c of courses) {
      const cid = c.course_id;
      await env.DB.prepare('DELETE FROM student_assignment WHERE course_id = ?').bind(cid).run();
      await env.DB.prepare('DELETE FROM assignment WHERE course_id = ?').bind(cid).run();
      await env.DB.prepare('DELETE FROM student_course WHERE course_id = ?').bind(cid).run();
      await env.DB.prepare('DELETE FROM course WHERE course_id = ?').bind(cid).run();
    }
    await env.DB.prepare('DELETE FROM student_assignment WHERE user_id = ?').bind(userId).run();
    await env.DB.prepare('DELETE FROM student_course WHERE user_id = ?').bind(userId).run();
    await env.DB.prepare('DELETE FROM user WHERE user_id = ?').bind(userId).run();
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((e) => {
        if (e) return next(e);
        res.json({ redirect: ROUTES.LOGIN });
      });
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api", (req, res) =>{
  res.json({ message: "Express.js running on Cloudflare Workers! "});
});


app.get("/api/courses", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });

  try {
    const userId = req.user.user_id;
    const rows = await env.DB.prepare(`
      SELECT c.course_id, c.course_code
      FROM student_course sc
      JOIN course c ON c.course_id = sc.course_id
      WHERE sc.user_id = ?
    `).bind(userId).all();

    res.json(rows.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get courses" });
  }
});

// GET all deadlines for the logged in student
app.get("/api/deadlines", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
 
  try {
    const userId = req.user.user_id;
    const rows = await env.DB.prepare(`
      SELECT 
        a.assignment_id,
        a.assn_desc as title,
        c.course_code as course,
        a.due_date,
        a.weight as marks,
        sa.comp_status,
        cs.status_desc as status
      FROM assignment a
      JOIN student_course sc ON sc.course_id = a.course_id
      JOIN course c ON c.course_id = a.course_id
      LEFT JOIN student_assignment sa ON sa.assignment_id = a.assignment_id 
        AND sa.user_id = ? AND sa.course_id = a.course_id
      LEFT JOIN completion_status cs ON cs.comp_status = sa.comp_status
      WHERE sc.user_id = ?
      ORDER BY a.due_date ASC
    `).bind(userId, userId).all();
 
    res.json(rows.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get deadlines" });
  }
});
 
// POST add a new deadline
app.post("/api/deadlines", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
 
  try {
    const { course_id, assn_desc, assn_type, due_date, weight } = req.body;
 
    // insert into assignment table
    await env.DB.prepare(`
      INSERT INTO assignment (course_id, assn_desc, assn_type, due_date, weight)
      VALUES (?, ?, ?, ?, ?)
    `).bind(course_id, assn_desc, assn_type, due_date, weight).run();
 
    res.status(201).json({ message: "Deadline added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add deadline" });
  }
});
 
// PUT mark a deadline as complete
app.put("/api/deadlines/:assignmentId/complete", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
 
  try {
    const userId = req.user.user_id;
    const { assignmentId } = req.params;
    const { course_id } = req.body;
 
    // check if student_assignment row exists
    const existing = await env.DB.prepare(`
      SELECT * FROM student_assignment 
      WHERE user_id = ? AND assignment_id = ? AND course_id = ?
    `).bind(userId, assignmentId, course_id).first();
 
    if (existing) {
      // update existing row to completed (comp_status = 0)
      await env.DB.prepare(`
        UPDATE student_assignment 
        SET comp_status = 0
        WHERE user_id = ? AND assignment_id = ? AND course_id = ?
      `).bind(userId, assignmentId, course_id).run();
    } else {
      // insert new row as completed
      await env.DB.prepare(`
        INSERT INTO student_assignment (user_id, course_id, assignment_id, grade, comp_status)
        VALUES (?, ?, ?, 0, 0)
      `).bind(userId, course_id, assignmentId).run();
    }
 
    res.json({ message: "Marked as complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark complete" });
  }
});
 
// DELETE a deadline
app.delete("/api/deadlines/:assignmentId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
 
  try {
    const { assignmentId } = req.params;
    const { course_id } = req.body;
 
    await env.DB.prepare(`
      DELETE FROM assignment WHERE assignment_id = ? AND course_id = ?
    `).bind(assignmentId, course_id).run();
 
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete deadline" });
  }
});

// GET all grades for the logged in student grouped by course
app.get("/api/grades", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
 
  try {
    const userId = req.user.user_id;
    const rows = await env.DB.prepare(`
      SELECT 
        c.course_code as course,
        a.assn_desc as name,
        sa.grade,
        a.weight
      FROM student_assignment sa
      JOIN assignment a ON a.assignment_id = sa.assignment_id AND a.course_id = sa.course_id
      JOIN course c ON c.course_id = sa.course_id
      WHERE sa.user_id = ?
      ORDER BY c.course_code, a.due_date ASC
    `).bind(userId).all();
 
    res.json(rows.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get grades" });
  }
});
 
// GET course averages for the logged in student
app.get("/api/averages", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
 
  try {
    const userId = req.user.user_id;
    const rows = await env.DB.prepare(`
      SELECT 
        c.course_code as course,
        sc.average
      FROM student_course sc
      JOIN course c ON c.course_id = sc.course_id
      WHERE sc.user_id = ?
    `).bind(userId).all();
 
    res.json(rows.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get averages" });
  }
});

app.get("/api/admin/averages", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });

  try {
    const rows = await env.DB.prepare(`
      SELECT 
        c.course_code as course,
        AVG(sc.average) as average
      FROM student_course sc
      JOIN course c ON c.course_id = sc.course_id
      GROUP BY c.course_id, c.course_code
    `).all();

    res.json(rows.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get admin averages" });
  }
});

app.use((req,res) => {
  console.log("Unmatched route: ", req.method, req.url);
  res.status(404).json({ error: "Not found", path: req.url});
});

app.listen(8787);
export default httpServerHandler({ port: 8787});

