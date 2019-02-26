var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');

var User = require('../models/User');

var auth = module.exports;

auth.init = function () {
    console.log("inside auth.init");
    passport.serializeUser(function(user, done) {
            done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            if(!err) done(null, user);
            else done(err, null);
        })
    });
};

auth.use = function() {
    passport.use(new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password'
    },
    function(email, password, done) {
        console.log('local.js > auth.use() > passport.use');
        User.findOne({ email: email}, function(err, user) {
            console.log('err: ',err,'user:', user);
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Account not found.' });
            }
            if (user.accountStatus !== 'verified') {
                return done(null, false, { message: 'Account not yet verified.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
    ));
};

module.exports = auth;
