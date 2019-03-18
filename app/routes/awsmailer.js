var mailer = require('nodemailer');
require('dotenv').config();
// var sesTransport = require('nodemailer-ses-transport');
var smtpPassword = require('aws-smtp-credentials');
var transporter = mailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'infactor.xinfin@gmail.com',
		pass: '..abcdefg..'
	}
    });

var smtpTransporter = mailer.createTransport({
    port: 465,
    host: 'email-smtp.us-east-1.amazonaws.com',
    secure: true,
    auth: {
        user: process.env.AWS_ACCESS_KEY_ID,
        pass: process.env.AWS_SECRET_ACCESS_KEY,
    },
    debug: true
});
console.log(process.env);
    // smtpTransporter.sendMail(mailOptions, callback);

var emailVerificationMailer = function(email, verifyHash, host, cb){
    var link = "http://" + host + "/login?email="+email+"&verifyId="+verifyHash;
    console.log(link);
    var mailOptions = {
        from: 'anil@xinfin.org',
        to: email,
        subject: 'Account verification link for your InFactor account',
        text: 'Please click on the following link to verify your account:'+link
    };

    smtpTransporter.sendMail(mailOptions, function(error, info){
			console.log('mailer > emailVerificationMailer() > error, info :', error, info);
			if (!error) {
				console.log('Email sent: ' + info.response);
			}
			return cb(error, info);
		});
        
}

var forgotPasswordMailer = function(email, userHash, host, cb){
	
	// var link = "http://" + host + "/resetPassword?email="+email+"&resetId="+userHash;
	var link = "http://" + host + "/reset-password?email="+email+"&resetId="+userHash;

	
	console.log(link);
	var mailOptions = {
		from: 'InFactor',
		to: email,
		subject: 'Reset password link for your InFactor account',
		html: 'Here is the link to reset your password:<br>'+link
	};

	smtpTransporter.sendMail(mailOptions, function(error, info){
		console.log('mailer > forgotPasswordMailer() > error, info :', error, info);
			if (!error) {
				console.log('Email sent: ' + info.response);
			}
			return cb(error, info);
		});
}

module.exports = {
    emailVerificationMailer: emailVerificationMailer,
    forgotPasswordMailer: forgotPasswordMailer
}