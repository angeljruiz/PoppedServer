"use strict";

var express = require('express');
var session = require('express-session');
var bp = require('body-parser');
var passport = require('passport')
var morgan = require('morgan');
var db = require('./scripts/database.js');
var User = require('./models/user.js');
var app = express();

require('./scripts/passport.js')(passport);

app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(express.static(__dirname));
app.use(morgan('dev'));
app.use(session({ secret: 'MaMadassssKij2', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');
app.set('views', './views');
//app.locals.pretty = true;

var dev = true;
var users = [];
var messages = [];
var test = User;
//test.username = 'ji';
//console.log(test.validPassword(0));

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

function createUser(req, res, next) {
    db.createUser(req.body.username, req.body.password, () => {
        next();
    });
}

function selectUser(req, res, next) {
    db.selectUser(req.query.id || req.body.id, (err, data) => {
        users = data;
        next();
    });
}

function loadMessages(req, res, next) {
    db.loadMessages(req.query.id || req.body.id, (data) => {
        users.messages = data;
        next();
    });
}
function saveMessage(req, res, next) {
    db.saveMessge(req.body.id, req.body.message, () => {
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

app.route('/').get((req, res) => {
   res.render('login');
});

app.route('/signup').get((req, res) => {
   res.render('signup');
});

app.post('/login', passport.authenticate('login', { session: true, successRedirect : '/list', failureRedirect : '/' }));

app.post('/new', passport.authenticate('signup', { session: true, successRedirect:  '/list', failureRedirect: '/signup' }));

app.get('/logout', (req, res) => {
   req.logout();
   res.redirect('/');
});

app.get('/list', loadUsers, (req, res) => {
    res.render('list', { users: users });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/user', isLoggedOn, selectUser, loadMessages, (req, res) => {
    res.render('user', users);
});

app.get('/game', (req, res) => {
   res.render('pathfinder');
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

app.post('/saveMessage', selectUser, saveMessage, loadMessages, (req, res) => {
    res.render('user', users);
})
