var mailer = require('nodemailer');
var transporter = mailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'infactor.xinfin@gmail.com',
		pass: '..abcdefg..'
	}
    });

var emailVerificationMailer = function(email, verifyHash, host){
    var link = "http://" + host + "/login?email="+email+"&verifyId="+verifyHash;
    console.log(link);
    var mailOptions = {
        from: 'InFactor',
        to: email,
        subject: 'Account verification link for your InFactor account',
        text: 'Please click on the following link to verify your account:'+link
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
        return;
}

var forgotPasswordMailer = function(email, userHash, host){
	
	// var link = "http://" + host + "/resetPassword?email="+email+"&resetId="+userHash;
	var link = "http://" + host + "/reset-password?email="+email+"&resetId="+userHash;

	
	console.log(link);
	var mailOptions = {
		from: 'InFactor',
		to: email,
		subject: 'Reset password link for your InFactor account',
		html: '<button>abc</button>Here is the link to reset your password:'+link
	};

	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  });
	  return;
}

module.exports = {
    emailVerificationMailer: emailVerificationMailer,
    forgotPasswordMailer: forgotPasswordMailer
}