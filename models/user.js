var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var db = require('../scripts/database.js');
var sync = require('async');

class User {
    constructor(input, fn) {
      this.localUsername = 0;
      this.localEmail = 0;
      this.localPassword = 0;
      this.localId = -1;
      this.profilePicture = 0;
      this.messages = [];
      if (input) {
        if (input.localUsername) {
          this.localUsername = input.localUsername;
        } else if (input.localEmail) {
          this.localEmail = input.localEmail;
        } else if (input.localId) {
          this.localId = input.localId;
        }
        return User.findOne(this, this.messages, fn);
      }
    }
    static findOne(id, messages, fn) {
        let user = new User();
        db.selectUser(id, (error, data) => {
            if(error)
                return fn(error);
            if(data) {
                user.localUsername = data.username;
                user.localPassword = data.password;
                user.localId = data.id;
                if(data.pp) {
                    user.profilePicture = data.pp;
                } else {
                    user.loadPicture('../media/df.png', () => {
                        if(messages)
                            user.loadMessages( () => {
                                return fn(false, user);
                            });
                        else
                            return fn(false, user);
                    });
                }
            } else {
                return fn(false, false);
            }
        });
    }
    pageify(req) {
      if (req.isAuthenticated())
        this.loggedIn = true;
      if (req.query.id === req.user.localId)
        this.owner = true;
      else
        this.owner = false;
      return this;
    }
    loadPicture(pic, fn) {
        fs.readFile(pic, (err, data) => {
            if(err)
                return fn(err);
            this.profilePicture = data;
            if(fn)
                fn();
        });
    }
    loadMessages(fn) {
        db.loadMessages(this.localId, (data) => {
            this.messages = data;
            if(fn)
                return fn();
        });
    }
    saveMessage(message, fn) {
        db.saveMessage(this.localId, message, fn);
    }
    generateHash(password) {
        this.localPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }
    validPassword(password) {
        return bcrypt.compareSync(password, this.localPassword);
    }
    save(fn) {
        db.createUser(this.localUsername, this.localEmail, this.localPassword, fn);
    }

}

module.exports = User;
