"use strict";

var express = require('express');
var session = require('express-session');
var bp = require('body-parser');
var passport = require('passport');
var morgan = require('morgan');
var db = require('./scripts/database.js');
var User = require('./models/user.js');
var app = express();
var pgSession = require('connect-pg-simple')(session);

require('./scripts/passport.js')(passport);

app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(express.static(__dirname));
app.use(morgan('dev'));
app.use(session({
  store: new pgSession({
    pool : db.pool,                // Connection pool 
  }),
  secret: 'KijPimTw77',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days 
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');
app.set('views', './views');
//app.locals.pretty = true;

var dev = true;
var users = [];


function dlog(mesg) {
    if (dev)
        console.log(mesg);
}
function loadUsers(req, rez, next) {
    db.loadUsers( (data) => {
        users = data;
        next();
    });
}

function loadMessages(req, res, next) {
    db.loadMessages(req.query.id || req.body.id || req.user.localId, (data) => {
        users.messages = data;
        next();
    });
}

function isLoggedOn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


app.listen(80, () => {
    console.log('listening on 3000');
});

app.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    User.findOne(req.user.localId, (err, user) => {
      user.loggedIn = true;
      user.loadMessages( () => {
        return res.render('user', user);
      });
    });
  } else {
    res.render('login');
  }
});

app.get('/signup', (req, res) => {
   res.render('signup');
});

app.post('/login', passport.authenticate('login', { session: true, successRedirect : '/list', failureRedirect : '/' }));

app.post('/new', passport.authenticate('signup', { session: true, successRedirect:  '/list', failureRedirect: '/signup' }));

app.get('/logout', (req, res) => {
   req.logout();
   res.redirect('/');
});

app.get('/list', loadUsers, (req, res) => {
    res.render('list', { users: users, loggedIn: req.isAuthenticated() });
});

app.get('/about', (req, res) => {
    res.render('about', { loggedIn: req.isAuthenticated() });
});

app.get('/user', isLoggedOn, (req, res) => {
    User.findOne(req.query.id, (err, user) => {
      user.loggedIn = req.isAuthenticated();
      user.loadMessages( () => {
        res.render('user', user);
      });
    });
});

app.get('/game', (req, res) => {
   res.render('pathfinder', { loggedIn: req.isAuthenticated() });
});

app.get('/delete/:id', (req, res) => {
    db.deleteUser(req.params.id, ()=> {
        res.redirect('/list');
    });
});

app.get('/getUsers', loadUsers, (req, res) => {
    let temp = JSON.stringify(users);
    res.send(temp);
});

app.get('/getMessages', loadMessages, (req, res) => {
    res.send(JSON.stringify(users.messages));
});

app.post('/saveMessage', (req, res) => {
    if(req.isAuthenticated()) {
      req.user.loggedIn = true;
      req.user.saveMessage(req.body.message, () => {
        req.user.loadMessages( () => {
          res.render('user', req.user);
        });
      });
    }
});
