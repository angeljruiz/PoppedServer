"use strict";

var express = require('express');
var bp = require('body-parser');
var db = require('./scripts/database.js');
var app = express();

app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(express.static(__dirname));
app.set('view engine', 'pug');
app.set('views', './views');
//app.locals.pretty = true;

var dev = true;
var users = [];
var messages = [];

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
    db.selectUser(req.query.id || req.body.id, (data) => {
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


app.listen(80, () => {
    console.log('listening on 3000');
});

app.route('/').get((req, res) => {
   res.render('login');
});

app.post('/new', createUser, (req, res) => {
    res.redirect('/list');
});

app.get('/list', loadUsers, (req, res) => {
    res.render('list', { users: users });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/user', selectUser, loadMessages, (req, res) => {
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
