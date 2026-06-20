const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const app = express();

passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/dashboard'));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Bot Dashboard</title><style>body{font-family:sans-serif;background:#2f3136;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;}a{color:#5865F2;font-size:1.2rem;padding:12px 24px;border:2px solid #5865F2;border-radius:8px;text-decoration:none;}a:hover{background:#5865F2;color:#fff;}</style></head><body><a href="/auth/discord">Login with Discord</a></body></html>`);
});

app.get('/dashboard', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.send(`<!DOCTYPE html><html><head><title>Dashboard</title><style>body{font-family:sans-serif;background:#2f3136;color:#fff;padding:2rem;}</style></head><body><h1>Welcome, ${req.user.username}!</h1><p>Dashboard coming soon...</p><a href="/auth/logout" style="color:#ff4444">Logout</a></body></html>`);
});

app.get('/auth/logout', (req, res) => { req.logout(() => res.redirect('/')); });

const port = process.env.DASHBOARD_PORT || 3000;
app.listen(port, () => console.log(`Dashboard running at http://localhost:${port}`));
