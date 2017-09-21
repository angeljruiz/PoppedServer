"use strict";

var db = require('pg');
var config = { user: 'postgres', database: 'Reach', password: 'MaMadas321', host: '127.0.0.1', port: 5432, max: 10, idleTimeoutMillis: 30000 };
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
    selectUser(user, fn) {
        let temp = (err, res) => {
            if(err) {
                return fn(err);
            }
            if(res.rows.length > 0)
                return fn(false, { username: res.rows[0].username, password: res.rows[0].password, id: res.rows[0].id, pp: res.rows[0].pp });
            else
                return fn(false, false);
        };
        if (user.localId !== -1) {
          pool.query('SELECT * FROM users WHERE id = ($1)', [user.localId], temp);
        } else if (user.localUsername !== 0) {
          pool.query('SELECT * FROM users WHERE username = ($1)', [user.localUsername], temp);
        } else if (user.localEmail !== 0) {
          pool.query('SELECT * FROM users WHERE email = ($1)', [user.localEmail], temp);
        }

    }
    loadPassword(id) {
      return new Promise( (resolve, reject) => {
        pool.query('SELECT password FROM users WHERE id = ($1)', [id], (err, res) => {
          if (err)
            return reject(err);
          resolve(res.rows[0].password);
        });
      });
    }
    deleteUser(id, fn) {
        pool.query('DELETE FROM users WHERE id = ($1)', [id], (err, res) => {
            if(err)
                return fn(err);

            return fn(true);
        });
    }
    createUser(username, email, password, fn) {
        if(username  === '' || password === '' || email === '') {
            return res.send('bad username or pass');
        }
        pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password], function(err) {
            if(err) {
                return console.error('error running query', err);
            }
            if (fn)
              fn();
        });
    }
    loadMessages(oid, fn) {
        this.messages = [];
        pool.query('SELECT * FROM messages WHERE oid = ($1) ORDER BY id DESC', [oid], (err, res) => {
            if(err)
                return console.error('error running query', err);
            for(let i=0;i<res.rows.length;i++)
                this.messages.push({ id: res.rows[i].id, text: res.rows[i].message });
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
    createart(title, desc, media, thumbnail, data, fn) {
      if (title && desc && media && thumbnail) {
        pool.query('INSERT INTO articles (title, description, media, thumbnail, data) VALUES ($1, $2, $3, $4, $5)', [title, desc, media, thumbnail, data], (err, res) => {
            if(err)
                return console.error('error running query', err);
            if (fn)
              fn();
        });
      }
    }
    listarticles(fn) {
      let articles = [];
      pool.query('SELECT * FROM articles', (err, res) => {
          if(err)
              return console.error('error running query', err);
          for (let i=0; i<res.rows.length; i++) {
            articles.push({ title: res.rows[i].title, desc: res.rows[i].description, thumbnail: new Buffer(res.rows[i].thumbnail).toString('base64'), id: res.rows[i].id });
          }
          return fn(articles);
      });
    }
    loadArticleImages(input, fn) {
      let ret = (err, res) => {
        if (!res)
          return;
        if (fn) {
          if (input.thumbnail)
            fn(res.rows[0].thumbnail);
          else
            fn(res.rows[0].media);
        }
      }
      if (input.media)
        pool.query('SELECT media FROM articles WHERE id = ($1)', [input.id], ret);
      else
        pool.query('SELECT thumbnail FROM articles WHERE id = ($1)', [input.id], ret);
    }
    loadArticle(id, fn) {
      let data = 0;
      pool.query('SELECT title, data, description FROM articles WHERE id = ($1)', [id], (err, res) => {
        if(err)
            return console.error('error running query', err);
          if (fn && res.rows)
            fn({title: res.rows[0].title, body: res.rows[0].data, description: res.rows[0].description});
          else
            fn();
      })
    }
}

module.exports = new Database;
module.exports.pool = pool;
