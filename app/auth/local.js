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
        User.findOne({ email: email}, function(err, user) {
            if (err) {
                return done(err, false, 4);
            }
            if (!user) {
                return done(null, false, 2);
            }
            if (!user.validPassword(password)) {
                return done(null, false, 3);
            }
            return done(null, user, 1);
        });
    }
    ));
};

module.exports = auth;
