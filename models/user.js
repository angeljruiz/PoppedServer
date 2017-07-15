var bcrypt = require('bcrypt-nodejs');
var db = require('../scripts/database.js');

class User {
    constructor() {
        this.localUsername = 0;
        this.localPassword = 0;
        this.localId = -1;
        this.messages = [];
    }
    static findOne(id, fn) {
        db.selectUser(id, (error, data) => {
            let user = new User();
            if(data) {
                user.localUsername = data.username;
                user.localPassword = data.password;
                user.localId = data.id;
            }
            fn(error, user);
        });
    }
    loadMessages(fn) {
        db.loadMessages(this.localId, (data) => {
            this.messages = data;
            fn(); 
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