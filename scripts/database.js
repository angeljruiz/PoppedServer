"use strict";

var db = require('pg');
var config = { user: 'postgres', database: 'FirstDB', password: 'mamadaS123', host: 'localhost', port: 5432, max: 10, idleTimeoutMillis: 30000 };
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
        pool.query('SELECT * FROM "Users"', (err, res) => {
            if(err)
                return console.error('error running query', err);
            for(let i=0;i<res.rows.length;i++)
                this.users.push({ name: res.rows[i].username, userid: res.rows[i].userid });
            fn(this.users);
        });
    }
    selectUser(id, fn) {
        pool.query('SELECT * FROM "Users" WHERE userid = ($1)', [id], (err, rez) => {
            if(err)
                return console.error('error running query', err);
            fn({ username: rez.rows[0].username, password: rez.rows[0].password, userid: rez.rows[0].userid });
        });
    }
    deleteUser(id, fn) {
        pool.query('DELETE FROM "Users" WHERE userid = ($1)', [id], (err, res) => {
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
        pool.query('INSERT INTO "Users" VALUES ($1, $2)', [username, password], function(err) {
            if(err) {
                return console.error('error running query', err);
            }
            fn()
        });
    }
}

module.exports = new Database;
