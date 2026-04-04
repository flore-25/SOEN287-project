import { env } from "cloudflare:workers"
import { httpServerHandler } from "cloudflare:node";
import express from "express";
import cors from "cors";
import { Strategy as LocalStrategy } from 'passport-local'
import crypto from "node:crypto"
import { ROUTES} from "../src/constants"
import passport from 'passport'
import session from 'express-session'

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

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
  const salt = crypto.randomBytes(16);

  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
    if (err) { return next(err); }

    try {
      await env.DB.prepare(
        "insert into user(role_id, name, email, hashedPassword, salt, role) values (0, ?, ?, ?, ?, 0)"
      )
        .bind(req.body.name, req.body.email, hashedPassword, salt)
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
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null});
  }
});

app.get("/api", (req, res) =>{
  res.json({ message: "Express.js running on Cloudflare Workers! "});
});


app.use((req,res) => {
  console.log("Unmatched route: ", req.method, req.url);
  res.status(404).json({ error: "Not found", path: req.url});
});

app.listen(8787);
export default httpServerHandler({ port: 8787});

