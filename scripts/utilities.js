var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var path = require('path');
var fs = require('fs');
var mw = require('./middleware.js');
var User = require('../models/user.js');

module.exports = (app, db, passport) => {

  app.use( (req, res, next) => {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
  });

  app.get('/photo/:id', mw.isLoggedOn, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../media/df.png'));
  });

  app.post('/upload', upload.any(), (req, res) => {
    if (req.isAuthenticated() && req.user.localUsername === 'angel') {
      fs.readFile(req.files[0].path, (err, data) => {
        if (err)
          return console.error('error reading file', err);
        db.uploadMedia(req.files[0].originalname, data, () => {
          fs.unlink(req.files[0].path);
        });
      });
    }
  });

  app.get('/media/:id', (req, res) => {
    db.loadMedia(req.params.id, (err, data) => {
      if (err)
        return console.error('error retrieving file', err);
      res.write(data, 'binary');
      res.end(null, 'binary');
    });
  });

  app.post('/createart', (req, res) => {
    console.log(req.body);
    if (req.isAuthenticated() && req.user.localUsername === 'angel') {
      db.createart(req.body.title, req.body.description, req.body.thumbnail, req.body.data);
    }
    res.redirect('/creator')
  });

  app.get('/article/media/:id', (req, res) => {
    db.loadArticleImages({ id: req.params.id, media: true }, media => {
      res.write(media, 'binary');
      res.end(null, 'binary');
    });
  });

  app.get('/article/thumbnail/:id', (req, res) => {
    db.loadArticleImages({ id: req.params.id, thumbnail: true }, media => {
      res.write(media, 'binary');
      res.end(null, 'binary');
    });
  });

  app.get('/article/:id/thumbnail.png', (req, res) => {
    db.loadArticleImages({ id: req.params.id, thumbnail: true }, media => {
      res.write(media, 'binary');
      res.end(null, 'binary');
    });
  });

  app.post('/new', mw.validateInfo, passport.authenticate('signup', { session: true, failureRedirect: '/signup' }), (req, res) => {
    new User({ localUsername: req.user.localUsername }, (err, user) => {
      req.login(user, function(err) {
        if (err)
          console.log(err);
        res.redirect('/');
      });
    });
  });

  app.get('/delete/:id', (req, res) => {
      db.deleteUser(req.params.id, ()=> {
          res.redirect('/list');
      });
  });

  app.post('/login', mw.validateInfo, passport.authenticate('login', { session: true, successRedirect : '/', failureRedirect : '/login' }));

  app.get('/logout', (req, res) => {
     req.logout();
     req.user = 0;
     setTimeout(() => {
       res.redirect('/');
     }, 1000);
  });

  app.post('/saveMessage', (req, res) => {
      if(req.isAuthenticated()) {
        req.user.loggedIn = true;
        req.user.owner = true;
        req.user.saveMessage(req.body.message, () => {
          res.redirect('/');
        });
      }
  });

  app.get('/getUsers', (req, res) => {
    db.loadUsers( users => {
      let temp = JSON.stringify(users);
      res.send(temp);
    });
  });

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/return', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

}
