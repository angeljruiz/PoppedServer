var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var db = require('../scripts/database.js');

class User {
    constructor() {
        this.localUsername = 0;
        this.localPassword = 0;
        this.localId = -1;
        this.profilePicture = 0;
        this.messages = [];
    }
    static findOne(id, messages, fn) {
        db.selectUser(id, (error, data) => {
            let user = new User();
            if(error)
                return fn(error);
            if(data) {
                user.localUsername = data.username;
                user.localPassword = data.password;
                user.localId = data.id;
                if(data.pp) {
                    user.profilePicture = data.pp;
                } else {
                    user.loadPicture('./media/df.png', () => {
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
        db.createUser(this.localUsername, this.localPassword, fn);
    }
    
}

module.exports = User;