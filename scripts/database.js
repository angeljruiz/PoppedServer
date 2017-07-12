"use strict";

var db = require('pg');
var config = { user: 'postgres', database: 'Reach', password: 'mamadaS123', host: 'localhost', port: 5432, max: 10, idleTimeoutMillis: 30000 };
var pool = new db.Pool(config);

pool.on('error', function (err) {
    console.error('idle client error', err.message, err.stack);
});

module.exports.connect = function (callback) {
    return pool.connect(callback);
};

class Database {
    constructor() {
        this.users = [];
    }
    loadUsers(fn) {
        this.users = [];
        pool.query('SELECT * FROM users', (err, res) => {
            if(err)
                return console.error('error running query', err);
            for(let i=0;i<res.rows.length;i++)
                this.users.push({ name: res.rows[i].username, id: res.rows[i].id });
            fn(this.users);
        });
    }
    selectUser(id, fn) {
        pool.query('SELECT * FROM users WHERE id = ($1)', [id], (err, rez) => {
            if(err)
                return console.error('error running query', err);
            fn({ username: rez.rows[0].username, password: rez.rows[0].password, id: rez.rows[0].id });
        });
    }
    deleteUser(id, fn) {
        pool.query('DELETE FROM users WHERE id = ($1)', [id], (err, res) => {
            if(err)
                fn(false);

            fn(true);
        });
    }
    createUser(username, password, fn) {
        if(username  == '' || password == '') {
            dlog('invalid pass or user');
            return res.send('bad username or pass');
        }
        pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password], function(err) {
            if(err) {
                return console.error('error running query', err);
            }
            fn()
        });
    }
    loadMessages(oid, fn) {
        let messages = []
        pool.query('SELECT (id, message) FROM messages WHERE oid = ($1)', [oid], (err, res) => {
            if(err)
                return console.error('error running query', err);
            for(let i=0;i<res.rows.length;i++)
                messages.push({ id: res.rows[i].id, message: res.rows[i].message });
            fn(messages);
        });
    }
    saveMessge(oid, message, fn) {
        console.log(oid);
        console.log(message);
        pool.query('INSERT INTO messages (message, oid) VALUES ($1, $2)', [message, oid], (err, res) => {
            if(err)
                return console.error('error running query', err);
            fn();
        });
    }
}

module.exports = new Database;
