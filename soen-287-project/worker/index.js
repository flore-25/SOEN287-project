import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";
import express from "express";
import cors from "cors";
import { Strategy as LocalStrategy } from 'passport-local'
import crypto from "node:crypto"
import { LOGIN, ROUTES} from "../src/constants"
import passport from 'passport'
import session from 'express-session'
import path from 'node:path'

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());


app.use(session({
  secret: 'secret passphrase',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.session());
app.use(passport.initialize());


passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email });
})


passport.deserializeUser(async (id, done) => {
  done(null, user);
})

passport.use(new LocalStrategy(function verify(email, password, cb)
{
  env.DB.prepare("select * from user where email = ?")
    .bind(email)
    .first()
    .run()
    .then((row) => {
      if(!row) {console.log("Incorrect email or password."); return cb(null, false, { message: 'Incorrect email or password.' });}

      crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if(!crypto.timingSafeEqual(row.hashedPassword, hashedPassword)) {
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

app.options('/login/password', function (req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.end();
});

app.post('/login/password', 
  passport.authenticate('local', { failureRedirect: "/login", failureMessage: true}),
  function(req, res) {
    res.redirect(ROUTES.DASHBOARD);
  
});

app.get("/login", (req, res) =>{
  res.status(400).json({
    message: 'Incorrect email or password! Please try again.',
    code: "INVALID_CREDENTIALS"
  });
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

app.use((req,res) => {
  console.log("Unmatched route: ", req.method, req.url);
  res.status(404).json({ error: "Not found", path: req.url});
});

const server = createServer(app);
export default httpServerHandler(server);