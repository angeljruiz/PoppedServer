/**
 * Created by angel on 7/13/17.
 */

var LocalStrategy = require('passport-local').Strategy, FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user.js');


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.localId);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne(id, false, (err, user) => {
            done(err, user);
        });
    });

    passport.use('signup', new LocalStrategy( { passReqToCallback: true }, (req, username, password, done) => {
        User.findOne(username, false, (err, user) => {
            if(err)
                return done(err);
            if(user) {
                req.res.flash('taken', 'Username already taken');
                return done(null, false);
              }
            var newUser = new User();
            newUser.localUsername = username;
            newUser.generateHash(password);
            newUser.save(() => {
                console.log('user created');
                return done(null, newUser);
            });
        });
    }));
    passport.use('login', new LocalStrategy( { passReqToCallback: true }, (req, username, password, done) => {
        User.findOne(username, false, (err, user) => {
            if(err)
                return done(err);
            if(!user || !user.validPassword(password)) {
                req.res.flash('incorrect', 'Invalid username or password');
                return done(null, false);
            }

            return done(null, user);
        });

    }));
    passport.use(new FacebookStrategy({
      clientID: 24609491488258,
      clientSecret: '9b7058872c03ea29ce1009f12738b6f8',
      callbackURL: "http://107.194.225.131/auth/facebook/return"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne(profile, false, function(err, user) {
        if (err) { return done(err); }
        done(null, user);
      });
    }
));
};
