require('dotenv').config();
const express = require('express');
const passport = require('passport');
const util = require('util');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const GitHubStrategy = require('passport-github2').Strategy;
const partials = require('express-partials');

let GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
let GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser((obj, done) => {
    done(null, obj);
})

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  }, 
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));


const app = express();
app.set('views',__dirname + '/views' )
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});



app.get('/login',(req , res)=>{
    res.render('login',{user: req.user});
})
app.get('/auth/github',
    passport.authenticate('github', { scope: [ 'user:email' ]}),
    function(req , res){
        // this function will not be called
    });

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req ,res){
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}