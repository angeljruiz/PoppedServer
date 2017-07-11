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
    db.selectUser(req.query.userid, (data) => {
        users = data;
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

app.get('/user', selectUser, (req, res) => {
    res.render('user', users);
});

app.get('/game', (req, res) => {
   res.render('pathfinder');
});

app.get('/delete/:userid', (req, res) => {
    db.deleteUser(req.params.userid, ()=> {
        res.redirect('/list');
    });
});
