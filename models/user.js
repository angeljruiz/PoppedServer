var bcrypt = require('bcrypt-nodejs');
var db = require('../scripts/database.js');

class User {
    constructor() {
        this.localUsername = 0;
        this.localPassword = 0;
        this.localId = -1;
    }
    generateHash(password) {
        this.localPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }
    validPassword(password) {
        return bcrypt.compareSync(password, this.localPassword);
    }
    findOne(id, fn) {
        db.selectUser(id, (error, data) => {
            if(data) {
                this.localUsername = data.username;
                this.localPassword = data.password;
                this.localId = data.id;
            }
            fn(error, this);
        });
    }
    save(fn) {
        db.createUser(this.localUsername, this.localPassword, fn);
    }
    
}

module.exports = User;