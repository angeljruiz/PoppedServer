/**
 * Created by angel on 7/13/17.
 */

var LocalStrategy = require('passport-local').Strategy;
var Userc = require('../models/user.js');
var User = new Userc;


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findOne(id, (err, user) => {
            done(err, user);
        });
    });
    
    passport.use('signup', new LocalStrategy( { passReqToCallback: true }, (req, username, password, done) => {
        User.findOne(username, (err, user) => {
            if(err) {
                console.log('error');
                return done(err);
            }
            if(user.localId != -1){
                console.log(user);
                return done(null, false);
            }
            var newUser = new Userc;
            newUser.localUsername = username;
            newUser.generateHash(password);
            newUser.save(() => {
                console.log('user created');
            })
        });
    }));
    passport.use('login', new LocalStrategy( { passReqToCallback: true }, (req, username, password, done) => {
        User.findOne(username, (err, user) => {
            if(!user.validPassword(password)) {
                return done(null, false);
            }
            return done(null, user);
        });

    }));

};