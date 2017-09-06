var path = require('path');
var fs = require('fs');
var multer = require('multer');
var mailer = require('nodemailer');
var crypto = require('crypto');
var upload = multer({ dest: 'uploads/' });
var User = require('../models/user.js');

function isLoggedOn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.flash('notLogged', 'Please sign in')
    res.redirect('/');
}

function validateInfo(req, res, next) {
  if (req.body.username === '' || req.body.password === '' || req.body.email === '') {
    req.res.flash('incorrect', 'Invalid username, email, or password');
    if (req.originalUrl === '/login')
      return res.redirect('/');
    else
      return res.redirect('/signup');
  }
  return next();
}

module.exports = (app, db, passport) => {
  app.get('/', (req, res) => {
    if(req.isAuthenticated()) {
      new User({ localId: req.user.localId, messages: true }, (err, user) => {
        user.loggedIn = true;
        user.owner = true;
        res.render('user', user);
      });
    } else {
      res.render('login', { dev: req.connection.remoteAddress === '::1'? true : false});
    }
  });

  app.get('/list', (req, res) => {
    db.loadUsers( users => {
      res.render('list', { users: users, loggedIn: req.isAuthenticated() });
    });
  });

  app.post('/login', validateInfo, passport.authenticate('login', { session: true, successRedirect : '/', failureRedirect : '/' }));

  app.post('/new', validateInfo, passport.authenticate('signup', { session: true, failureRedirect: '/signup' }), (req, res) => {
    new User({ localUsername: req.user.localUsername }, (err, user) => {
      req.login(user, function(err) {
        if (err)
          console.log(err);
        res.redirect('/');
      });
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

  app.post('/createart', upload.fields([{ name: 'media', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (req, res) => {
    let media, thumbnail = 0;
    if (req.isAuthenticated() && req.user.localUsername === 'angel') {
      fs.readFile(req.files.media[0].path, (err, data) => {
        if (err) {
          console.log('error');
          return;
        }
        media = data;

        fs.readFile(req.files.thumbnail[0].path, (err, data2) => {
          if (err) {
            console.log('error');
            return;
          }
          thumbnail = data2;

          db.createart(req.body.title, req.body.description, media, thumbnail, req.body.data, () => {
            fs.unlink(req.files.media[0].path);
            fs.unlink(req.files.thumbnail[0].path);
          });
        });
      });
    }
    res.redirect('/creator')
  });

  app.get('/articlelist', (req, res) => {
    db.listarticles( articles => {
      res.render('articlelist', {articles: articles});
    });
  });

  app.get('/user', isLoggedOn, (req, res) => {
      new User({ localId: req.query.id, messages: true }, (err, user) => {
        if(err)
          return console.log(err);
        res.render('user', user.pageify(req));
      });
  });

  app.get('/photo/:id', isLoggedOn, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../media/df.png'));
  });

  app.get('/about', (req, res) => {
      res.render('about', { loggedIn: req.isAuthenticated() });
  });

  app.get('/logout', (req, res) => {
     req.logout();
     res.redirect('/');
  });

  app.get('/game', (req, res) => {
     res.render('pathfinder', { loggedIn: req.isAuthenticated() });
  });

  app.get('/delete/:id', (req, res) => {
      db.deleteUser(req.params.id, ()=> {
          res.redirect('/list');
      });
  });

  app.get('/getUsers', (req, res) => {
    db.loadUsers( users => {
      let temp = JSON.stringify(users);
      res.send(temp);
    });
  });

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/return', passport.authenticate('facebook', { successRedirect: '/',
                                        failureRedirect: '/login' }));

  // app.get('/getMessages', loadMessages, (req, res) => {
  //     res.send(JSON.stringify(users.messages));
  // });

  app.post('/saveMessage', (req, res) => {
      if(req.isAuthenticated()) {
        req.user.loggedIn = true;
        req.user.owner = true;
        req.user.saveMessage(req.body.message, () => {
          req.user.loadMessages( () => {
            res.render('user', req.user);
          });
        });
      }
  });

};
