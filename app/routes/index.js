var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var helper = require('./helper');
var mailer = require('./mailer');
var dummyData = require('./dummyData');
var db = require('./../config/db');
var config = require('./../config/config');
var url = require('url');
var uniqid = require('uniqid');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var fs = require('fs');
var PATH = require('path');
var bcrypt = require('bcrypt-nodejs');

var web3Conf = false;
if (web3Conf) {
	var web3Helper = require('./web3Helper');
}

var multer  = require('multer')
var upload = multer({ dest: './public/tmp/'});
var imgUpload = upload.fields([
		{name : 'poDocs'},
		{name : 'invoiceDocs'},
		{name : 'grnDocs'},
		{name : 'ifactorProposalDocs'}
	]);      
//var ifact
var imgUpload2 = upload.fields([
		{name : 'ifactorProposalDocs'},
		{name : 'ifDocs'}
	]);
var moveImages = function (file, path, cb) {
	//path = PATH.join(__dirname, '../../' + path);
	console.log(file,path)
   fs.readFile(path, function (err, data) {
        fs.writeFile(file, data, function (err) {
         if ( err ) {
              response = {
                   message: 'Sorry, file couldn\'t be uploaded.',
                   filename: file,
                   oldFile : path
              };
              return cb(1, response);
         } else {
               response = {
                   message: 'File uploaded successfully',
                   filename: file,
                   oldFile : path
              };
              return cb(0, response);
          }
       });
   });
};

var uploadUserDocs = function(invoiceId, files, cb) {
    var filePaths = {};
    for (var key in files) {
        var dirName =  '../../public/uploads/invoices/' + invoiceId;
        dirName = PATH.join(__dirname, dirName);
        var newFile = dirName + '/' + Date.now() + '_' + files[key][0].originalname;
        //creates dynamic folder each for user
        if (!fs.existsSync(dirName)) {
            try {
              fs.mkdirSync(dirName);
            } catch(e) {
              if ( e.code != 'EEXIST' ) throw e;
            }
        }
        filePaths[key] = newFile;
        var oldFile = PATH.join(__dirname, '../../' + files[key][0].path)
        moveImages(newFile, oldFile, function(err, resp) {
            fs.unlink(resp.oldFile);
        });
    }
    return cb(filePaths);
};

var getInterstAmount = function(invoice) { 
	if (!invoice.platformCharges || invoice.platformCharges <=0) {
		return 0;
	}

	var charges = (invoice.daysToPayout * invoice.platformCharges * 100)/30;
	return (charges * invoice.amount)/100;
};

var processInvoiceDetails = function(invoice) {
	invoice.invoiceAmount = !invoice.invoiceAmount ? 0 : invoice.invoiceAmount;
	invoice.firstPayment = (!invoice.saftyPercentage || invoice.saftyPercentage <= 0) ?
							invoice.invoiceAmount :
							(invoice.saftyPercentage/100 * invoice.invoiceAmount);
	invoice.charges = getInterstAmount(invoice);
	invoice.balancePayment =  invoice.invoiceAmount - (invoice.firstPayment + invoice.charges);

	invoice.daysToPayout = helper.getDatesDiff(invoice.payableDate);
};

var getInvoiceDates = function(invoiceHistory) {
	var created = {};
	for (var i in invoiceHistory) {
		if (invoiceHistory[i] && invoiceHistory[i].args) {
			created[invoiceHistory[i].args.state] = invoiceHistory[i].args.created;
		}
	}
	return created;
}

var authenticate = function (req, res, next) {
	console.log('index > authenticate()');
    passport.authenticate('local', function (err, user, info) {
		console.log('index > authenticate() > passport.authenticate > err, user, info: ', err, user, info);
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.send({
				status: false,
				error: {
					msg: info 
				}
			});
        }
        console.log("<== " + user.email + " Logged in [" +
                    new Date() + "] <==");

        req.logIn(user, function (err) {
			console.log('index > authenticate() > passport.authenticate > req.logIn > err: ', err);
            if (err) {
                return next(err);
            }
            return next();
        });
	})(req, res, next);
};

var getFullName = function(firstName, lastName) {
	console.log('index > getFullName() > firstName, lastName: ', firstName, lastName);
	return !firstName && !lastName ? 'Anonymous' : 
		firstName && lastName ? firstName + ' ' + lastName :
		firstName ? firstName : lastName;
};


var updateInvoiceBlockchain = async(function(invoiceId, state) {
	console.log('index > updateInvoiceBlockchain() > invoiceId, state: ', invoiceId, state);
    try {
	    var tx = await (web3Helper.setState(invoiceId, state));
	    return {status : true, tx : tx};
    } catch(e) {
    	console.log('index > updateInvoiceBlockchain() > smart contract error: ', e);
		return {status : false};
    }
});

var updateInvoice = function(query, update, cb) {
	console.log('index > updateInvoice() > query, update: ', query, update);
	var collection = db.getCollection('invoices');
	collection.updateOne(query, update, function(err, data) {
		console.log('index > updateInvoice() > collection.updateOne > err, data: ', err, data);
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var updateUser = function(query, update, cb) {
	console.log('index > updateUser() > query, update: ', query, update);
	var collection = db.getCollection('users');
	collection.updateOne(query, update, function(err, data) {
		console.log('index > updateUser() > collection.updateOne > err, data: ', err, data);
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getUsers = function(query, cb) {
	console.log('index > getUsers() > query: ', query);
	var collection = db.getCollection('users');
	collection.find(query).toArray(function(err, data) {
		console.log('index > updateUser() > collection.find.toArray > err, data: ', err, data);
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getUserDetails = function(query, projection, cb) {
	console.log('index > getUserDetails() > query, projection: ', query, projection);
	var collection = db.getCollection('users');
	collection.findOne(query, projection, function(err, data) {
		console.log('index > getUserDetails() > collection.findOne > err, data: ', err, data);
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getInvoices = function(query, cb) {
	console.log('index > getInvoices() > query: ', query);
	var collection = db.getCollection('invoices');
	collection.find(query).sort({'created' : -1}).toArray(function(err, data) {
		console.log('index > getInvoices() > collection.find > err, data: ', err, data);
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

router.post('/signup', (function(req, res) {
	console.log('index > signup API > req.body: ', req.body);
	let input = req.body.input;
	var collection = db.getCollection('users');
	collection.findOne({email : input.email}, function(err, result) {
		console.log('index > signup API > collection.findOne > err, result:', err, result);
		if(err){
			return res.send({
				status : false,
				error : {
					msg : 'Server error, please try again'
				}
			});
		}
		if (result) {
			return res.send({
				status : false,
				error : {
					msg : 'Account with this email address already exists'
				}
			});
		}

		if (web3Conf) {
			input.address = web3Helper.createAccount(input.password);
		} else {
			input.address = 'local';
		}
		input.phrase = input.password;
		input.accountStatus = bcrypt.hashSync(input.email).split('/').join('A');
		delete input.confirmPassword;
		bcrypt.hash(input.password, bcrypt.genSaltSync(8), null, function(err, hash) {
			console.log('index > signup API > collection.findOne > bcrypt.hash > err, hash:', err, hash);
			if(err){
				return res.send({
					status : false, 
					error : {
						msg : 'Server error, please try again'
					}
				});
			}
			input.password = hash;
			mailer.emailVerificationMailer(input.email, input.accountStatus, req.get('host'), function(error, info){
				console.log('index > signup API > ... > mailer.emailVerificationMailer > err, hash:', error, info);
				if(!error){
					collection.save(input, function (err, docs) {
						console.log('index > signup API > ... > collection.save > err, docs.ops:', err, docs.ops);
						if (err) {
							return res.send({
								status : false,
								error : {
									msg : 'Server error, please try again'
								}
							});
						}
						return res.send({ 
							status : true,
							msg : 'You have successfully signed up, please check your email for verification link.'
						});
					});
				} else {
					return res.send({
						status: false,
						error: {
							msg: 'Server error, please try again'
						}
					});
				}
			});
				
			
		});
	});
}));

router.post('/login', authenticate, function(req, res) {
	console.log('index > login API');
	return res.send({
		status : true,
		msg : 'You are now logged in'
	});
});

//forgot password logic
router.get('/forgotPassword', function(req, res) {
	console.log('index > forgotPassword API > req.query: ', req.query);
	const email = req.query.email;
	const collection = db.getCollection('users');
	collection.findOne({email : email}, function(err, result) {
		console.log('index > forgotPassword API > collection.findOne > err, result: ', err, result);
		if (err) {
			return res.send({
				status : false,
				error : {
					msg : 'Some error has occurred, please try again'
				}
			});
		}
		if (result==null) {
			return res.send({
				status : false,
				error : {
					msg : 'Account does not exist'
				}
			});
		}
		var userHash = bcrypt.hashSync(result._id).split('/').join('');
		mailer.forgotPasswordMailer(email, userHash, req.get('host'), function(error, info){
			console.log('index > forgotPassword API > collection.findOne > mailer.forgotPasswordMailer > error, info:', error, info);
				if(!error){
					collection.updateOne({email : email},{$set: {'reset': userHash}}, function(err, data){
						console.log('index > forgotPassword API > collection.findOne > mailer.forgotPasswordMailer > collection.updateOne > err, data: ', err, data);
						if (err) {
							return res.send({
								status : false, 
								error : {
									msg : 'Server error, please try again'
								}
							});
						} else {
							return res.send({
								status : true,
								msg: 'Please check your email for password reset link'
							});
						}
						
					});
				} else {
					return res.send({
						status: false,
						error: {
							msg: 'Server error, please try again'
						}
					});
				}
		});
	});
});

router.post('/resetPassword', function(req, res){
	console.log('index > resetPassword API > req.body:', req.body);
	const resetId = req.body.resetId;
	const email = req.body.email;
	const password = req.body.newPassword;
	const collection = db.getCollection('users');
	collection.findOne({email : email}, function(error, result) {
		console.log('index > resetPassword API > collection.findOne > error, result:', error, result);
		if(error){
			return res.send({
				status : false,
				error : {
					msg : 'Server error, please try again'
				}
			});
		}
		if (result.reset === '' && resetId !== ''){
			return res.send({
				status : false, 
				error : {
					msg : 'You have already used this link'
				}
			});
		}
		if(resetId == result.reset){
			bcrypt.hash(password, bcrypt.genSaltSync(8), null, function(err, hash) {
				console.log('index > resetPassword API > collection.findOne > bcrypt.hash > err, hash:', err, hash);
				if(err){
					return res.send({
						status : false, 
						error : {
							msg : 'Server error, please try again'
						}
					});
				}
				collection.updateOne({'email': email}, {$set: {'password': hash, 'reset': ''}}, {upsert:false},
					function(err, docs){
						console.log('index > resetPassword API > ... > bcrypt.hash > collection.updateOne > err, docs:', err, docs.ops);
						if (err) {
							return res.send({
								status : false,
								error : {
									msg : 'Server error, please try again'
								}
							});
						}
					}
				);
			});
			return res.send({
				status : true,
				msg: 'Password has been changed successsfully'
			});
		}
		else{
			return res.send({
				status : false,
				error : {
					msg : 'Your link is invalid'
				}
			});
		}
	});
});

router.post('/changePassword', function(req, res){
	console.log('index > changePassword API > req.body:', req.body);
	const email = req.body.email;
	const oldPassword = req.body.oldPassword;
	const password = req.body.password;
	const collection = db.getCollection('users');
	collection.findOne({email : email}, function(error, result) {
		console.log('index > changePassword API > collection.findOne > error, result: ', error, result);
		if(error){
			return res.send({
				status : false,
				error : {
					msg : 'Server error, please try again'
				}
			});
		}
		if(bcrypt.compareSync(oldPassword, result.password)){
			bcrypt.hash(password, bcrypt.genSaltSync(8), null, function(err, hash) {
				console.log('index > changePassword API > collection.findOne > bcrypt.hash > err, hash: ', err, hash);
				if(err){
					return res.send({
						status : false, 
						error : {
							msg : 'Server error, please try again'
						}
					});
				}
				collection.updateOne({email: email}, {$set: {password: hash}}, function(err, docs){
						console.log('index > changePassword API > ... > bcrypt.hash > collection.updateOne > err, docs: ', err, docs);
						if (err) {
							console.log(err);
							return res.send({
								status : false,
								error : {
									msg : 'DB Error'
								}
							});
						}
					}
				);
				return res.send({
					status : true,
					msg: 'Your password has been changed successfully'
				});
			});
		}
		else{
			return res.send({
				status : false,
				error : {
					msg : 'Please enter your current password correct'
				}
			});
		}
	});
});

router.post('/verifyAccount', function(req, res){
	console.log('verifyAccount API > req.body:', req.body);
	const verifyHash = req.body.verifyId;
	const email = req.body.email;
	const collection = db.getCollection('users');
	collection.findOne({email : email}, function(error, result) {
		console.log('verifyAccount API > result: ', result);
		if(result === null){
			return res.send({status : false, error : {
				errorCode : 'DBError', msg : 'DB Error'}});
		}
		if(result.accountStatus == 'verified'){
			console.log('verifyAccount API > already verified');
			return res.send({status : false, error : {
				errorCode : 'AccountAlreadyVerified', msg : 'Your account has already been verified. Redirecting you to log in page'}});
		} else if(verifyHash == result.accountStatus){
				console.log('verifyAccount API > verified');
				collection.updateOne(
					{'email': email}, {$set: {'accountStatus': 'verified'}}, {upsert:false},
					function(err, docs){
						if (err) {
							console.log('verifyAccount API > verified DB Error:', err);
							return res.send({status : false, error : {
								errorCode : 'DBError', msg : 'DB Error'
							}});
						}
					}
				);
				return res.send({status : true,  msg : 'Your account has been successfully verified. Redirecting you to log in page'});
		} else {
				console.log('verifyAccount API > invalid link');
				return res.send({status : false, error : {
					errorCode : 'VerifyIDError', msg : 'Your link is invalid. Redirecting you to log in page'}});
		}
	});
});

router.get('/logout', function(req, res) {
	req.logout();
	res.clearCookie('connect.sid');
	// res.redirect('/');
	return res.send({status : true});
});

router.get('/startApp', function(req, res) {
	if (!req.isAuthenticated()) {
		console.log('startApp API > Not authenticated');
		return res.send({status : false});
	} else {
		console.log('startApp API > Authenticated > req.user: ', req.user);
		let name = req.user.firstName + ' ' + req.user.lastName;
		return res.send({status : true, data : {userType : req.user.type, name : name, email: req.user.email}});
	}
});

router.post('/createInvoice', imgUpload, async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
		console.log('req.files', req.files);
	let input = req.body.input;
	input.supplierEmail = req.user.email;
	input.supplierName = getFullName(req.user.firstName, req.user.lastName);
	input.supplierAddress = req.user.address;
	input.state = input.state;
	if (input.invoiceId) {
		delete input._id;
	}
	input.invoiceId = input.invoiceId || uniqid();
	input.invoiceNo = input.invoiceNo;
	input.invoiceAmount = parseInt(input.invoiceAmount);
	input.created = Date.now();
	var collection = db.getCollection('invoices');
	var tx;
	console.log('state', input.state);
	if (web3Conf && input.state == 'invoice_created') {
	    try {
			//web3Helper.addInvoiceEvent(function(err, result) {});
		    tx = await (web3Helper.addInvoice(input));
		    input.createHash = tx;
	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, message : e});
	    }
	}
    //upload files
    console.log('input.invoiceId', input.invoiceId);
	uploadUserDocs(input.invoiceId, req.files, function(filePaths) {
		for (var key in filePaths) {
			input[key] = !filePaths[key] ? (input[key] ? input[key] : '') :   filePaths[key];
		}
		collection.update({'invoiceId' : input.invoiceId}, input, {upsert : true}, function (err, docs) {
		    if (err) {
		    	console.log(err);
				return res.send({status : false, error : {
					errorCode : 'DBError', msg : 'DB Error'
				}});
		    }
			return res.send({status : true, tx : tx});
		});
	});
	}
}));

router.post('/approveInvoice', async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
		console.log('inside approveInvoice');
	let invoiceId = req.body.invoiceId;
	let remark = req.body.remark;

	console.log('invoiceId', invoiceId)
	console.log('remark', remark)
	//input.buyerId = ""; //add buyer id
	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.setState(invoiceId, 'invoice_accepted'));
		    console.log('tx', tx);
	    } catch(e) {
	    	console.log(e)
			return res.send({status : false, message : 'smart contract error'});
	    }
	}
	let updateQuery = {$set : {state : 'invoice_accepted', buyerInvoiceRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		console.log('update', err, data);
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : '', tx : tx}});
	});
	}
	
}));

router.get('/downloadInvoiceDocs', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
		let filePath = req.query.docUrl;
	console.log('filePath', filePath);
	let fileName = req.body.name;
	//let fileName = 'abcd';
	//var mime = require('mime');
	//var mimetype = mime.lookup(file);
	res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
 
	//res.set('Content-type', mime.lookup(filePath));
	res.setHeader('Content-type', 'application/octet-stream');
	res.download(filePath, fileName, function(err) {
		console.log(err);
	});
	}
});

router.post('/rejectInvoice', async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
		let invoiceId = req.body.invoiceId;
	let remark = req.body.remark;

	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.setState(invoiceId, 'invoice_rejected'));
		    console.log('tx', tx);
	    } catch(e) {
	    	console.log(e)
			return res.send({status : false, message : 'smart contract error'});
	    }
	}

	let updateQuery = {$set : {state : 'invoice_rejected', buyerInvoiceRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
	 }	
}));

router.post('/requestFactoring', async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
		let invoiceId = req.body.invoiceId;
	let amount = req.body.invoiceAmount;
	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.requestFactoring(invoiceId, 'ifactor_request', amount));
		    //tx = await (web3Helper.setState(invoiceId, 'ifactor_request'));
		    console.log('tx', tx);

				/*var postpayamount = await(web3Helper.getPostpayAmount(invoiceId));
				console.log('postpayamount', postpayamount.toNumber());
				var mm = await(web3Helper.getPrepayAmount(invoiceId));
				console.log('getPrepayAmount', mm.toNumber());
				var mm = await(web3Helper.getSupplier(invoiceId));
				console.log('getAddresses', mm);
				var mm = await(web3Helper.getInvoiceAmount(invoiceId));
				console.log('getInvoiceAmount', mm.toNumber());*/
				//web3Helper.getBalance(address)
	    } catch(e) {
	    	console.log(e)
			return res.send({status : false, message : 'smart contract error'});
	    }
	}

	let updateQuery = {$set : {state : 'ifactor_request'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
	 }
}));

router.post('/factoringProposal', imgUpload2, async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
	let input = req.body.input;
	let invoiceId = req.body.invoiceId;
	var invoice = {
		invoiceId : invoiceId,
		invoiceAmount : parseInt(input.invoiceAmount) || 0,
		financerAddress : req.user.address,
		platformCharges : parseInt(input.platformCharges) || 0,
		saftyPercentage : parseInt(input.saftyPercentage) || 0,
		payableDate : input.payableDate
	};

	var tx;
	var firstPayment, postpayamount, charges, chargesPer, balancePaymentPer;
	firstPayment = invoice.invoiceAmount * invoice.saftyPercentage/100;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.factoringProposal(invoice));
			charges = await(web3Helper.getInterestAmount(invoiceId));
			charges = charges.toNumber()/100;
			console.log('charges', charges)
			var postpayamount = await(web3Helper.getPostpayAmount(invoiceId));
			postpayamount = postpayamount.toNumber();
			console.log('postpayamount', postpayamount)
	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, message : 'smart contract error'});
	    }
	} else {
		charges = getInterstAmount(invoice);
		postpayamount =  invoice.invoiceAmount - (invoice.firstPayment + charges);
	}

	uploadUserDocs(invoice.invoiceId, req.files, function(filePaths) {
		for (var key in filePaths) {
			input[key] = !filePaths[key] ? (input[key] ? input[key] : '') :   filePaths[key];
		}

		let updateQuery = {$set : {
				state : 'ifactor_proposed',
				financerAddress : req.user.address,
				financerEmail : req.user.email,
				platformCharges : input.platformCharges,
				saftyPercentage : input.saftyPercentage,
				acceptFactoringRemark : input.remark,
				firstPayment : firstPayment,
				charges : charges,
				chargesPer : charges/input.invoiceAmount * 100,
				balancePayment : postpayamount,
				balancePaymentPer : postpayamount/input.invoiceAmount * 100,
				ifactorProposalDocs : input.ifactorProposalDocs
			}
		};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				return res.send({status : false, error : err});
			}
			return res.send({status : true, data : {state : ''}});
		});
	});
	}
}));

router.post('/rejectFactoringRequest', async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	console.log('inside rejectFactoringRequest');
	let invoiceId = req.body.invoiceId;
	let remark = req.body.remark;

	var tx;
	if (web3Conf) {
		var scResult = await (updateInvoiceBlockchain(invoiceId, 'ifactor_rejected'));
		if (!scResult.status) {
			return res.send({status : false, msg : 'smart contract error'});
		} else {
			tx = scResult.tx;
			console.log('rejectfactoring tx', tx);
		}
	}

	let updateQuery = {$set : {state : 'ifactor_rejected', rejectFactoringRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
}));

router.get('/getBalance', async (function(req, res) {
	console.log('getBalance API > start');
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
		if (!req.isAuthenticated()) {
			return res.send({status : true, data : {balance : 500000}});
		}
		var address = req.user.address;
		if (web3Conf) {
			try {
				result = await (web3Helper.getBalance(address));
				console.log(result.toNumber());
				var bal = result.toNumber();
				return res.send({status : true, data : {balance : bal}});
			} catch(e) {
				return res.send({status : true, data : {balance : 0}});
			}
		} else {
			return res.send({status : true, data : {balance : 0}});
		}
	}
}));


router.post('/acceptFactoringProposal', async(function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	console.log('acceptFactoringProposal');
	let invoiceId = req.body.invoiceId;
	var tx;
	if (web3Conf) {
		var scResult = await (updateInvoiceBlockchain(invoiceId, 'ifactor_proposal_accepted'));
		if (!scResult.status) {
			return res.send({status : false, msg : 'smart contract error'});
		} else {
			tx = scResult.tx;
			console.log('tx', tx);
		}
	}

	let remark = req.body.remark;
	let updateQuery = {$set : {state : 'ifactor_proposal_accepted', acceptProposalRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
}));

router.post('/rejectFactoringProposal', async(function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	console.log('inside rejectFactoringProposal');
	let invoiceId = req.body.invoiceId;

	var tx;
	if (web3Conf) {
		var scResult = await (updateInvoiceBlockchain(invoiceId, 'ifactor_proposal_rejected'));
		if (!scResult.status) {
			return res.send({status : false, msg : 'smart contract error'});
		} else {
			tx = scResult.tx;
			console.log('tx', tx);
		}
	}

	let remark = req.body.remark;
	let updateQuery = {$set : {state : 'ifactor_proposal_rejected', rejectProposalRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
}));

router.post('/rateFinancer', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	let invoiceId = req.body.invoiceId;
	let updateQuery = {$set : {
			financerRatings : req.body.financerRatings,
			financerRatingRemark : req.body.financerRatingRemark
	}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
});

router.post('/rateSupplier', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	let invoiceId = req.body.invoiceId;
	let updateQuery = {$set : {
			supplierRatings : req.body.supplierRatings,
			supplierRatingRemark : req.body.supplierRatingRemark
	}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
});

router.post('/payInvoice', async (function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	let invoiceId = req.body.invoiceId;
	let updateObj = {state : 'invoice_paid'};
	let buyerAddress = req.body.buyerAddress;
	let supplierAddress = req.body.supplierAddress;
	let financerAddress = req.body.financerAddress;
	let invoiceAmount = req.body.invoiceAmount;
	console.log(supplierAddress, buyerAddress, financerAddress);
	var tx;
	if (web3Conf) {
	    try {
	    	//tx = await(web3Helper.etherTransfer(buyerAddress));
			var postpayamount = invoiceAmount;
			console.log('getPrepayAmount', postpayamount);
			if (ENV == 'prod') {
				//web3Helper.unlockSync(req.user.address, req.user.password);
				web3Helper.unlockSync(req.user.address, "");
			}
			//buyerAddress = req.user.address;
		    var tx1 = await (web3Helper.sendTokens(buyerAddress, financerAddress, parseInt(postpayamount)));
		    tx = await (web3Helper.payInvoice(invoiceId, invoiceAmount));

			var proposalEvent = await (web3Helper.getProposalAcceptedEvent(invoiceId));
			var proposalDate = proposalEvent[0].args.created;
		    var daysToPayout = helper.getDatesDiff(new Date(), proposalDate);
		    web3Helper.setPayoutDays(invoiceId, daysToPayout);

			var interestAmount = await(web3Helper.getInterestAmount(invoiceId));
			interestAmount = interestAmount.toNumber();
			var postpayamount = await(web3Helper.getPostpayAmount(invoiceId));
			postpayamount = postpayamount.toNumber();
			updateObj.charges = interestAmount/100;
			updateObj.chargesPer = updateObj.charges/invoiceAmount * 100;
			updateObj.balancePayment = postpayamount;
			updateObj.balancePaymentPer = postpayamount/invoiceAmount * 100;

	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, error : 'blockchain error'});
	    }
	}

	let updateQuery = {$set : updateObj};
	updateInvoice({'invoiceId' : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
}));

router.post('/buyTokens', function(req, res) {
	if (!req.isAuthenticated()) {
		console.log('buyTokens API > req.isAuthenticated(): false, req.user:', req.user);
		return res.send({status : false});
	} else { 
	var address = req.body.address;
	var tokens = req.body.tokens;
	if (!address) {
		return res.send({status : false, error : 'address not provided'});
	}
	if (!tokens) {
		tokens = 100000;
	}

	try {
		var tx1 = await (web3Helper.buyTokens(address, tokens));
		return res.send({status : true, txHash : tx1});		
	} catch (e) {
		console.log('buyTokens API > error:', e);
		return res.send({status : false, error : 'blockchain error'});
	}
}
});

router.post('/prepaySupplier', async(function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	//'invoiceId' : new ObjectID(invoiceId)}
	let invoiceId = req.body.invoiceId;
	let buyerAddress = req.body.buyerAddress;
	let supplierAddress = req.body.supplierAddress;
	let financerAddress = req.body.financerAddress;
	console.log('address', supplierAddress, buyerAddress, financerAddress);
	var tx, tx1;
	if (web3Conf) {
		if (ENV == 'prod') {
			web3Helper.unlockSync(req.user.address, "");
		}
	    try {
		    /*tx1 = await (web3Helper.buyTokens(financerAddress));
		    tx1 = await (web3Helper.buyTokens(supplierAddress));
		    tx1 = await (web3Helper.buyTokens(buyerAddress));
		    tx1 = await (web3Helper.getBalance(financerAddress));*/
		    //console.log('financerAddress', tx1.toNumber())

			var prepayAmount = await(web3Helper.getPrepayAmount(invoiceId));
			prepayAmount = prepayAmount.toNumber();
			console.log('getPrepayAmount', prepayAmount);
		    tx1 = await (web3Helper.sendTokens(financerAddress, supplierAddress, prepayAmount));
		    console.log('sendTokens', tx1);
		    tx = await (web3Helper.prepayFactoring(invoiceId, prepayAmount));
	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, error : 'blockchain error'});
	    }
	}

	let updateQuery = {$set : {state : 'ifactor_prepaid'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
}));

router.post('/postpaySupplier', async(function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	let invoiceId = req.body.invoiceId;
	let buyerAddress = req.body.buyerAddress;
	let supplierAddress = req.body.supplierAddress;
	let financerAddress = req.body.financerAddress;
	console.log(supplierAddress, buyerAddress, financerAddress);
	var tx;
	if (web3Conf) {
		if (ENV == 'prod') {
			web3Helper.unlockSync(req.user.address, "");
		}
	    try {
	    	//tx = await(web3Helper.etherTransfer(financerAddress));
			var postpayamount = await(web3Helper.getPostpayAmount(invoiceId));
			postpayamount = postpayamount.toNumber();
			console.log('getPrepayAmount', postpayamount);
		    tx1 = await (web3Helper.sendTokens(financerAddress, supplierAddress, postpayamount));
		    tx = await (web3Helper.postpayFactoring(invoiceId, postpayamount));
		    console.log('tx', tx);
	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, error : 'blockchain error'});
	    }
	}

	let updateQuery = {$set : {state : 'completed'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}
}));

router.get('/getSupplierDashboard', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	// console.log('getSupplierDashboard API: ',req.isAuthenticated());
	// console.log('getSupplierDashboard API: ',req.user);
	// console.log('getSupplierDashboard API: ',req.session);
	var email = req.user.email;
	var name = req.user.firstName + " " + req.user.lastName;
	//email = 'vinod@z.com';
	getInvoices({supplierEmail : email}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data, name: name})
	});
}
});

router.get('/getBuyerDashboard', function(req, res) {
	// console.log("req.isAuthenticated(): ", req.isAuthenticated());
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
	var email = req.user.email;
	var name = req.user.firstName + " " + req.user.lastName;
	getInvoices({buyerEmail : email, state : {$ne : 'draft'}}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data, name: name});
	});
	}
});

router.get('/getFinancerDashboard', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	var email = req.user.email;
	var name = req.user.firstName + " " + req.user.lastName;
	let list = ['draft', 'invoice_created', 'invoice_rejected', 'invoice_accepted'];

	//get all invoices greater than 6;
	getInvoices({state : {$nin : list}}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data, name: name});
	});
}
});

router.get('/getInvoices', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	getInvoices({}, function(err, data) {
		if (err) {
			console.log(err)
			return res.send({status : false, msg : data})
		}
		return res.send({status : true, data : data})
	});
}
});

router.post('/getBalance', async(function(req, res) {
	try{
		console.log('getBalance API > start');
		var balance = await (web3Helper.getBalance(req.body.address));
		balance = balance.toNumber();
		console.log('getBalance API > address balance:', balance);
		return res.send({status : true, addressBalance: balance});
	} catch (e){
		console.log('getBalance API > error: ', e);
		return res.send({status : true});
	}
}));

router.post('/getInvoiceDetails', async(function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
	let invoiceId = req.body.invoiceId;
	//'invoiceId' : new ObjectID(invoiceId)}
	if (web3Conf) {
	    var balance = await (web3Helper.getBalance(req.user.address));
	    balance = balance.toNumber();
	}

	getInvoices({'invoiceId' : invoiceId}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		var invoiceHistory = dummyData.dummyTx;
		var invoice = data[0];
		//processInvoiceDetails(invoice);
		getUserDetails({email : invoice.supplierEmail}, {},async(function(err, userData) {
			invoice.supplierData = !err ? userData : {};
			if (web3Conf) {
				var allEvents = await (web3Helper.getAllEvents(invoiceId));
	        	//console.log(allEvents)
				helper.processEvents(allEvents, invoice);
				invoiceHistory = allEvents.filter(x => x.event == 'invoiceHistory');
				invoice.created = getInvoiceDates(invoiceHistory);
				var transferEvents = allEvents.filter(x => x.event == 'ifactorTransfer');
				var otherEvents = allEvents.filter(x => x.event != 'ifactorTransfer');
				//console.log(tarnsferEvents);
				return res.send({status : true, data : {
					invoice : invoice, invoiceHistory : invoiceHistory,
					transferEvents : transferEvents, otherEvents : otherEvents,
					balance : balance
				}});
				/*web3Helper.getInvoiceHistory(invoiceId, function(err, result) {
					if (!err) {
						invoiceHistory = result;
					}
					invoice.created = getInvoiceDates(invoiceHistory);
					return res.send({status : true, data : {invoice : invoice, invoiceHistory : invoiceHistory, balance : balance}});
				});*/
			} else {
				//console.log('invoiceHistory', invoiceHistory)
				return res.send(
					{status : true, data : {invoice : invoice,
					invoiceHistory : dummyData.dummyInvoiceHistory,
					"transferEvents": dummyData.dummyTransferEvents,
					"otherEvents":dummyData.dummyOtherEvents, "balance":0}}
				);
			}
		}));
	});
}
}));

router.get('/getUsers', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	getUsers({}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data})
		}
		return res.send({status : true, data : data})
	});
}
});

router.get('/getBuyerList', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	var collection = db.getCollection('users');
	var showFields = {email : 1, firstName : 1, address : 1};
	collection.find({type : 'Buyer'}, showFields).toArray(function(err, data) {
		if (err) {
			return res.send({status : false});
		}
		console.log(data);
		return res.send({status : true, data : data});
	});
}
});

router.get('/unlockCoinbase', function(req, res) {
	if (web3Conf) {
		var result = web3Helper.unlockCoinbase();
		console.log('unlockCoinbase', result);
		return res.send({status : result});
	}
});

router.post('/getUserDetails', function(req, res){
	console.log('getUserDetails API > start', req.body);
	let email = req.body.email;
	getUserDetails({email: email}, {_id: false, firstName: true, lastName: true, email: true, address: true, contactNo: true}, function(err, data){
		console.log(err,data);
		if(err) {
			return res.send({status : false, error : err});
		} else if(data === null){
			return res.send({status : false, msg : 'No data found for this email address'});
		} else {
			return res.send({status : true, data : data});
		}
	});
});

router.post('/editUserDetails', function(req, res){
	console.log('editUserDetails API > start', req.body);
	let email = req.body.email;
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;
	let contactNo = req.body.contactNo;
	updateUser({email: email}, {$set : {firstName: firstName, lastName: lastName, contactNo: contactNo}}, function(err, data){
		console.log(err,data);
		if(err) {
			return res.send({status : false, error : err});
		} else {
			return res.send({status : true, data : data});
		}
	});
});

router.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

module.exports = router;