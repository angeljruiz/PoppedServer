var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var path = require('path');
var fs = require('fs');
var mw = require('./middleware.js');

module.exports = (app, db, passport) => {

  app.get('/photo/:id', mw.isLoggedOn, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../media/df.png'));
  });

  app.post('/createart', upload.fields([{ name: 'media', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (req, res) => {
    let media, thumbnail = 0;
    if (req.isAuthenticated() && req.user.localUsername === 'angel') {
      fs.readFile(req.files.media[0].path, (err, data) => {
        if (err) {
          console.log('error');
          return;

        }
        media = data

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
     res.redirect('/');
  });

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

  app.get('/getUsers', (req, res) => {
    db.loadUsers( users => {
      let temp = JSON.stringify(users);
      res.send(temp);
    });
  });

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/return', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

}
