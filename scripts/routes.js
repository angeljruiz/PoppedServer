var mailer = require('nodemailer');
var crypto = require('crypto');
var pager = require('../scripts/pager.js');
var User = require('../models/user.js');
var mw = require('./middleware.js');

module.exports = (app, db, passport) => {

  app.use((req, res, next) => {
    pager.update(req);
    next();
  });

  app.get('/', (req, res) => {
    if(req.isAuthenticated()) {
      new User({ localId: req.user.localId, messages: true }, (err, user) => {
        user.loggedIn = true;
        user.owner = true;
        res.render('user', user);
      });
    } else {
      res.redirect('/login');
    }
  });

  app.get('/list', (req, res) => {
    db.loadUsers( users => {
      res.render('list', { users: users, loggedIn: req.isAuthenticated() });
    });
  });

  // app.post('/forgot', (req, res, next) => {
  //   async.waterfall([
  //     done => {
  //       crypto.randomBytes(20, (err, buf) => {
  //         let token = buf.toString('hex');
  //         done(err, token);
  //       });
  //     },
  //     (token, done) {
  //       User.findone()
  //     }
  //   ])
  // })

  app.get('/articlelist', (req, res) => {
    db.listarticles( articles => {
      res.render('articlelist', {articles: articles, loggedIn: req.isAuthenticated()});
    });
  });

  app.get('/article/:id', (req, res) => {
    db.loadArticle(req.params.id, data => {
      if (data)
        res.render('article', { title: data.title, body: data.body, id: req.params.id, loggedIn: req.isAuthenticated(), description: data.description, pager: pager });
      else
        res.redirect('/articlelist');
    })
  });

  app.get('/user', mw.isLoggedOn, (req, res) => {
    new User({ localId: req.query.id, messages: true }, (err, user) => {
      if(err)
        return console.log(err);
      res.render('user', user.pageify(req));
    });
  });

  // app.get('/getMessages', loadMessages, (req, res) => {
  //     res.send(JSON.stringify(users.messages));
  // });

};
