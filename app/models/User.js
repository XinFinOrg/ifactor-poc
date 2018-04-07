var mongoose = require('mongoose');
//var crypto = require('crypto');

var userSchema = mongoose.Schema({
    username : String,
    password : String,
});

userSchema.methods.validPassword = function (pwd) {
    return (this.password === pwd);
};

module.exports = mongoose.model('users', userSchema);
