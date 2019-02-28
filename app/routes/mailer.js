var mailer = require('nodemailer');
var transporter = mailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'infactor.xinfin@gmail.com',
		pass: '..abcdefg..'
	}
    });

var emailVerificationMailer = function(email, verifyHash, host, cb){
    var link = "http://" + host + "/login?email="+email+"&verifyId="+verifyHash;
    console.log(link);
    var mailOptions = {
        from: 'InFactor',
        to: email,
        subject: 'Account verification link for your InFactor account',
        text: 'Please click on the following link to verify your account:'+link
    };

    transporter.sendMail(mailOptions, function(error, info){
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

	transporter.sendMail(mailOptions, function(error, info){
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