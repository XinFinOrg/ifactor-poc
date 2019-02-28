var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	firstName : String,
	lastName : String,
    email : String,
    password : String,
    type : String,
    address : String,
    accountStatus: String

});

userSchema.methods.validPassword = function (pwd) {
    return bcrypt.compareSync(pwd, this.password);
};


module.exports = mongoose.model('user', userSchema);
