var mongoose = require('mongoose');
//var crypto = require('crypto');

var userSchema = mongoose.Schema({
	firstName : String,
	lastName : String,
    email : String,
    password : String,
    type : String,
    address : String
});

userSchema.methods.validPassword = function (pwd) {
    return (this.password === pwd);
};

module.exports = mongoose.model('user', userSchema);
