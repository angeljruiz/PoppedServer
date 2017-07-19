/**
 * Created by angel on 7/13/17.
 */

var LocalStrategy = require('passport-local').Strategy;
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
            if(err) {
                console.log('error');
                return done(err);
            }
            if(user){
                return done(null, false);
            }
            var newUser = new User();
            newUser.localUsername = username;
            newUser.generateHash(password);
            newUser.save(() => {
                console.log('user created');
            });
        });
    }));
    passport.use('login', new LocalStrategy( { passReqToCallback: true }, (req, username, password, done) => {
        User.findOne(username, false, (err, user) => {
            if(err)
                return done(err);
            if(!user)
                return done(null, false);
            if(!user.validPassword(password)) {
                return done(null, false);
            }
            return done(null, user);
        });

    }));
};