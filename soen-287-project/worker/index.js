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

app.use((req,res) => {
  console.log("Unmatched route: ", req.method, req.url);
  res.status(404).json({ error: "Not found", path: req.url});
});

const server = createServer(app);
export default httpServerHandler(server);