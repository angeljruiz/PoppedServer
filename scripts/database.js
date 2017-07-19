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
        this.messages = [];
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
        let temp = (err, res) => { 
            if(err) {
                return fn(err);
            }
            if(res.rows.length > 0)
                return fn(false, { username: res.rows[0].username, password: res.rows[0].password, id: res.rows[0].id, pp: res.rows[0].pp });
            else
                return fn(false, false);
        };
        
        if(!isNaN(id)) {
            pool.query('SELECT * FROM users WHERE id = ($1)', [id], temp);
        } else {
            pool.query('SELECT * FROM users WHERE username = ($1)', [id], temp);
        }
        
    }
    deleteUser(id, fn) {
        pool.query('DELETE FROM users WHERE id = ($1)', [id], (err, res) => {
            if(err)
                return fn(err);

            return fn(true);
        });
    }
    createUser(username, password, fn) {
        if(username  === '' || password === '') {
            return res.send('bad username or pass');
        }
        pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password], function(err) {
            if(err) {
                return console.error('error running query', err);
            }
            fn();
        });
    }
    loadMessages(oid, fn) {
        this.messages = [];
        pool.query('SELECT * FROM messages WHERE oid = ($1) ORDER BY id DESC', [oid], (err, res) => {
            if(err)
                return console.error('error running query', err);
            for(let i=0;i<res.rows.length;i++)
                this.messages.push({ id: res.rows[i].id, messages: res.rows[i].message });
            return fn(this.messages);
        });
    }
    saveMessage(oid, message, fn) {
        pool.query('INSERT INTO messages (message, oid) VALUES ($1, $2)', [message, oid], (err, res) => {
            if(err)
                return console.error('error running query', err);
            fn();
        });
    }
}

module.exports = new Database();
module.exports.pool = pool;

