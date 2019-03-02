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
	console.log('index > moveImages()');
	fs.readFile(path, function (err, data) {
		console.log('index > moveImages() > fs.readFile > file, path, err: ', file, path, err);
			fs.writeFile(file, data, function (err) {
			if ( err ) {
				console.log('index > moveImages() > fs.readFile > fs.writeFile > file, path, data, err: ', file, path, data, err);
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
	console.log('index > uploadUserDocs()');
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

var getInterestAmount = function(invoice) { 
	console.log('index > getInterstAmount()');
	if (!invoice.platformCharges || invoice.platformCharges <=0) {
		return 0;
	}

	var charges = (invoice.daysToPayout * invoice.platformCharges * 100)/30;
	return (charges * invoice.amount)/100;
};

var processInvoiceDetails = function(invoice) {
	console.log('index > processInvoiceDetails()');
	invoice.invoiceAmount = !invoice.invoiceAmount ? 0 : invoice.invoiceAmount;
	invoice.firstPayment = (!invoice.saftyPercentage || invoice.saftyPercentage <= 0) ?
							invoice.invoiceAmount :
							(invoice.saftyPercentage/100 * invoice.invoiceAmount);
	invoice.charges = getInterstAmount(invoice);
	invoice.balancePayment =  invoice.invoiceAmount - (invoice.firstPayment + invoice.charges);

	invoice.daysToPayout = helper.getDatesDiff(invoice.payableDate);
};

var getInvoiceDates = function(invoiceHistory) {
	console.log('index > getInvoiceDates()');
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
        if (err) {
			console.log('index > authenticate() > passport.authenticate > err, user, info: ', err, user, info);
            return next(err);
        }
        if (!user) {
			console.log('index > authenticate() > passport.authenticate > err, user, info: ', err, user, info);
            return res.send({
				status: false,
				error: {
					message: info 
				}
			});
        }
        console.log("<== " + user.email + " Logged in [" +
                    new Date() + "] <==");

        req.logIn(user, function (err) {
            if (err) {
				console.log('index > authenticate() > passport.authenticate > req.logIn > user, err: ', user, err);
                return next(err);
            }
            return next();
        });
	})(req, res, next);
};

var getFullName = function(firstName, lastName) {
	console.log('index > getFullName()');
	return !firstName && !lastName ? 'Anonymous' : 
		firstName && lastName ? firstName + ' ' + lastName :
		firstName ? firstName : lastName;
};


var updateInvoiceBlockchain = async(function(invoiceId, state) {
	console.log('index > updateInvoiceBlockchain()');
    try {
	    var tx = await (web3Helper.setState(invoiceId, state));
	    return {
			status : true,
			tx : tx
		};
    } catch(e) {
    	console.log('index > updateInvoiceBlockchain() > invoiceId, state, smart contract error: ', invoiceId, state, e);
		return { status : false };
    }
});

var updateInvoice = function(query, update, cb) {
	console.log('index > updateInvoice()');
	var collection = db.getCollection('invoices');
	collection.updateOne(query, update, function(err, data) {
		if (err) {
			console.log('index > updateInvoice() > collection.updateOne > query, update, err, data: ', query, update, err, data);
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var updateUser = function(query, update, cb) {
	console.log('index > updateUser()');
	var collection = db.getCollection('users');
	collection.updateOne(query, update, function(err, data) {
		if (err) {
			console.log('index > updateUser() > collection.updateOne > query, update, err, data: ', query, update, err, data);
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getUsers = function(query, cb) {
	console.log('index > getUsers()');
	var collection = db.getCollection('users');
	collection.find(query).toArray(function(err, data) {
		if (err) {
			console.log('index > getUsers() > collection.find.toArray > query, err, data: ', query, err, data);
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getUserDetails = function(query, projection, cb) {
	console.log('index > getUserDetails()');
	var collection = db.getCollection('users');
	collection.findOne(query, projection, function(err, data) {
		if (err) {
			console.log('index > getUserDetails() > collection.findOne > query, projection, err, data: ', query, projection, err, data);
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getInvoices = function(query, cb) {
	console.log('index > getInvoices()');
	var collection = db.getCollection('invoices');
	collection.find(query).sort({'created' : -1}).toArray(function(err, data) {
		if (err) {
			console.log('index > getInvoices() > collection.find > query, err, data: ', query, err, data);
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
		if(err){
			console.log('index > signup API > collection.findOne > err, result:', err, result);
			return res.send({
				status : false,
				error : {
					message : 'Server error, please try again'
				}
			});
		}
		if (result) {
			console.log('index > signup API > collection.findOne > err, result:', err, result);
			return res.send({
				status : false,
				error : {
					message : 'Account with this email address already exists'
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
		delete input.check;
		bcrypt.hash(input.password, bcrypt.genSaltSync(8), null, function(err, hash) {
			if(err){
				console.log('index > signup API > collection.findOne > bcrypt.hash > err, hash:', err, hash);
				return res.send({
					status : false, 
					error : {
						message : 'Server error, please try again'
					}
				});
			}
			input.password = hash;
			mailer.emailVerificationMailer(input.email, input.accountStatus, req.get('host'), function(error, info){
				if(!error){
					collection.save(input, function (err, docs) {
						if (err) {
							console.log('index > signup API > ... > mailer.emailVerificationMailer > collection.save > err, docs.ops:', err, docs.ops);
							return res.send({
								status : false,
								error : {
									message : 'Server error, please try again'
								}
							});
						}
						return res.send({ 
							status : true,
							message : 'You have successfully signed up, please check your email for verification link.'
						});
					});
				} else {
					console.log('index > signup API > ... > mailer.emailVerificationMailer > error, info:', error, info);
					return res.send({
						status: false,
						error: {
							message: 'Server error, please try again'
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
		message : 'You are now logged in'
	});
});

//forgot password logic
router.get('/forgotPassword', function(req, res) {
	console.log('index > forgotPassword API > req.query: ', req.query);
	const email = req.query.email;
	const collection = db.getCollection('users');
	collection.findOne({email : email}, function(err, result) {
		if (err) {
			console.log('index > forgotPassword API > collection.findOne > err, result: ', err, result);
			return res.send({
				status : false,
				error : {
					message : 'Some error has occurred, please try again'
				}
			});
		}
		if (result==null) {
			return res.send({
				status : false,
				error : {
					message : 'Account does not exist'
				}
			});
		}
		var userHash = bcrypt.hashSync(result._id).split('/').join('');
		mailer.forgotPasswordMailer(email, userHash, req.get('host'), function(error, info){
				if(!error){
					collection.updateOne({email : email},{$set: {'reset': userHash}}, function(err, data){
						if (err) {
							console.log('index > forgotPassword API > collection.findOne > mailer.forgotPasswordMailer > collection.updateOne > err, data: ', err, data);
							return res.send({
								status : false, 
								error : {
									message : 'Server error, please try again'
								}
							});
						} else {
							return res.send({
								status : true,
								message: 'Please check your email for password reset link'
							});
						}
						
					});
				} else {
					console.log('index > forgotPassword API > collection.findOne > mailer.forgotPasswordMailer > error, info:', error, info);
					return res.send({
						status: false,
						error: {
							message: 'Server error, please try again'
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
		if(error){
			console.log('index > resetPassword API > collection.findOne > error, result:', error, result);
			return res.send({
				status : false,
				error : {
					message : 'Server error, please try again'
				}
			});
		}
		if (result.reset === '' && resetId !== ''){
			return res.send({
				status : false, 
				error : {
					message : 'This link is invalid, please request for a new reset link'
				}
			});
		}
		if(resetId == result.reset){
			bcrypt.hash(password, bcrypt.genSaltSync(8), null, function(err, hash) {
				if(err){
					console.log('index > resetPassword API > collection.findOne > bcrypt.hash > err, hash:', err, hash);
					return res.send({
						status : false, 
						error : {
							message : 'Server error, please try again'
						}
					});
				}
				collection.updateOne({'email': email}, {$set: {'password': hash, 'reset': ''}}, {upsert:false},
					function(err, docs){
						if (err) {
							console.log('index > resetPassword API > ... > bcrypt.hash > collection.updateOne > err, docs:', err, docs.ops);
							return res.send({
								status : false,
								error : {
									message : 'Server error, please try again'
								}
							});
						}
					}
				);
			});
			return res.send({
				status : true,
				message: 'Password has been changed successsfully'
			});
		}
		else{
			return res.send({
				status : false,
				error : {
					message : 'Your link is invalid'
				}
			});
		}
	});
});

router.post('/changePassword', function(req, res){
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				message: 'You are not logged in'
			}
		});
	} else {
		console.log('index > changePassword API > req.body:', req.body);
		const email = req.body.email;
		const oldPassword = req.body.oldPassword;
		const password = req.body.password;
		const collection = db.getCollection('users');
		collection.findOne({email : email}, function(error, result) {
			if(error){
				console.log('index > changePassword API > collection.findOne > error, result: ', error, result);
				return res.send({
					status : false,
					error : {
						message : 'Server error, please try again'
					}
				});
			}
			if(bcrypt.compareSync(oldPassword, result.password)){
				bcrypt.hash(password, bcrypt.genSaltSync(8), null, function(err, hash) {
					if(err){
						console.log('index > changePassword API > collection.findOne > bcrypt.hash > err, hash: ', err, hash);
						return res.send({
							status : false, 
							error : {
								message : 'Server error, please try again'
							}
						});
					}
					collection.updateOne({email: email}, {$set: {password: hash}}, function(err, docs){
						if (err) {
							console.log('index > changePassword API > ... > bcrypt.hash > collection.updateOne > err, docs: ', err, docs);
							return res.send({
								status : false,
								error : {
									message : 'Server error, please try again'
								}
							});
						}
						
					});
					return res.send({
						status : true,
						message: 'Your password has been changed successfully'
					});
				});
			}
			else{
				return res.send({
					status : false,
					error : {
						message : 'Please enter your current password correct'
					}
				});
			}
		});
	}
});

router.post('/verifyAccount', function(req, res){
	console.log('index > verifyAccount API > req.body:', req.body);
	const verifyHash = req.body.verifyId;
	const email = req.body.email;
	const collection = db.getCollection('users');
	collection.findOne({email : email}, function(error, result) {
		if(error){
			console.log('index > verifyAccount API > collection.findOne > error, result:', error, result);
			return res.send({
				status : false,
				error : {
					message : 'Server error, please try again'
				}
			});
		}
		if(result === null){
			return res.send({
				status : false,
				error : {
					message : 'Your link is invalid. Redirecting you to log in page'
				}
			});
		}
		if(result.accountStatus == 'verified'){
			return res.send({
				status : false,
				error : {
					message : 'You have already verified your account. Redirecting you to log in page'
				}
			});
		} else if(verifyHash == result.accountStatus){
				collection.updateOne(
					{'email': email}, {$set: {'accountStatus': 'verified'}}, {upsert:false},
					function(err, docs){
						if (err) {
							console.log('index > verifyAccount API > collection.findOne > collection.updateOne > err, docs:', err, docs);
							return res.send({
								status : false,
								error : {
									message : 'Server error, please try again'
								}
							});
						}
					}
				);
				return res.send({
					status : true,
					message : 'You have successfully verified your account. Redirecting you to log in page'});
		} else {
				return res.send({
					status : false,
					error : {
						message : 'Your link is invalid. Redirecting you to log in page'
					}
				});
		}
	});
});

router.get('/logout', function(req, res) {
	console.log('index > logout API');
	req.logout();
	res.clearCookie('connect.sid');
	// res.redirect('/');
	return res.send({ status : true });
});

router.get('/startApp', function(req, res) {
	console.log('index > startApp API');
	if (!req.isAuthenticated()) {
		console.log('index > startApp API > Not authenticated');
		return res.send({ 
			status : false,
			error: {
				message: 'You are not logged in'
			}
		});
	} else {
		console.log('index > startApp API > Authenticated > req.user.email: ', req.user.email);
		let name = req.user.firstName + ' ' + req.user.lastName;
		return res.send({
			status : true,
			data : {
				userType : req.user.type,
				name : name,
				email: req.user.email
			}
		});
	}
});

router.post('/createInvoice', imgUpload, async (function(req, res) {
	console.log('index > createInvoice API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				message: 'You are not logged in'
			}
		});
	} else { 
		// console.log('req.files', req.files);
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
		if (web3Conf && input.state == 'invoice_created') {
			try {
				//web3Helper.addInvoiceEvent(function(err, result) {});
				tx = await (web3Helper.addInvoice(input));
				input.createHash = tx;
			} catch(e) {
				console.log('index > createInvoice API > Smart contract error: ', e);
				return res.send({
					status : false,
					error : {
						message : 'Smart contract error'
					}
				});
			}
		}
		//upload files
		uploadUserDocs(input.invoiceId, req.files, function(filePaths) {
			for (var key in filePaths) {
				input[key] = !filePaths[key] ? (input[key] ? input[key] : '') :   filePaths[key];
			}
			collection.update({'invoiceId' : input.invoiceId}, input, {upsert : true}, function (err, docs) {
				if (err) {
					console.log('index > createInvoice API > uploadUserDocs > collection.update > err, docs: ',err, docs);
					return res.send({
						status : false,
						error : {
							message : 'Server error, please try again'
						}
					});
				}
				return res.send({
					status : true
				});
			});
		});
	}
}));

router.post('/approveInvoice', async (function(req, res) {
	console.log('index > approveInvoice API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				message: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let remark = req.body.remark;
		var tx;
		if (web3Conf) {
			try {
				tx = await (web3Helper.setState(invoiceId, 'invoice_accepted'));
			} catch(e) {
				console.log('index > approveInvoice API > smartcontract error: ', e);
				return res.send({
					status : false,
					error: {
						message : 'Smart contract error'
					}
				});
			}
		}
		let updateQuery = {$set : {state : 'invoice_accepted', buyerInvoiceRemark : remark}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > approveInvoice API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false, 
					error :{
						message: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : '',
					tx : tx
				}
			});
		});
	}
	
}));

router.get('/downloadInvoiceDocs', function(req, res) {
	console.log('index > downloadInvoiceDocs API > req.body, req.query:', req.body, req.query);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let filePath = req.query.docUrl;
		let fileName = req.body.name;
		res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
		res.setHeader('Content-type', 'application/octet-stream');
		res.download(filePath, fileName, function(err) {
			console.log('index > downloadInvoiceDocs API > res.download > err: ',err);
		});
	}
});

router.post('/rejectInvoice', async (function(req, res) {
	console.log('index > rejectInvoice API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let remark = req.body.remark;

		var tx;
		if (web3Conf) {
			try {
				tx = await (web3Helper.setState(invoiceId, 'invoice_rejected'));
			} catch(e) {
				console.log('index > rejectInvoice API > smartcontract error: ', e);
				return res.send({
					status : false,
					error : {
						msg : 'Smart contract error'
					}
				});
			}
		}

		let updateQuery = {$set : {state : 'invoice_rejected', buyerInvoiceRemark : remark}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > rejectInvoice API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}	
}));

router.post('/requestFactoring', async (function(req, res) {
	console.log('index > requestFactoring API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let amount = req.body.invoiceAmount;
		var tx;
		if (web3Conf) {
			try {
				tx = await (web3Helper.requestFactoring(invoiceId, 'ifactor_request', amount));
				//tx = await (web3Helper.setState(invoiceId, 'ifactor_request'));
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
				console.log('index > requestFactoring API > smartcontract error: ', e);
				return res.send({
					status : false,
					error: {
						msg: 'Smart contract error'
					}
				});
			}
		}

		let updateQuery = {$set : {state : 'ifactor_request'}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > requestFactoring API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.post('/factoringProposal', imgUpload2, async (function(req, res) {
	console.log('index > factoringProposal API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
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
			var postpayamount = await(web3Helper.getPostpayAmount(invoiceId));
			postpayamount = postpayamount.toNumber();
	    } catch(e) {
			console.log('index > factoringProposal API > smartcontract error: ', e);
			return res.send({
				status : false,
				error: {
					msg : 'Smart contract error'
				}
			});
	    }
	} else {
		charges = getInterestAmount(invoice);
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
				console.log('index > factoringProposal API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	});
	}
}));

router.post('/rejectFactoringRequest', async (function(req, res) {
	console.log('index > rejectFactoringRequest API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let remark = req.body.remark;

		var tx;
		if (web3Conf) {
			var scResult = await (updateInvoiceBlockchain(invoiceId, 'ifactor_rejected'));
			if (!scResult.status) {
				console.log('index > rejectFactoringRequest API > smartcontract error');
				return res.send({
					status : false,
					error: {
						msg : 'Smart contract error'
					}
				});
			} else {
				tx = scResult.tx;
				// console.log('rejectfactoring tx', tx);
			}
		}

		let updateQuery = {$set : {state : 'ifactor_rejected', rejectFactoringRemark : remark}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > rejectFactoringRequest API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.get('/getBalance', async (function(req, res) {
	console.log('index > getBalance API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else { 
		// if (!req.isAuthenticated()) {
		// 	return res.send({
		// 		status : true,
		// 		data : {
		// 			balance : 500000
		// 		}});
		// }
		var address = req.user.address;
		if (web3Conf) {
			try {
				result = await (web3Helper.getBalance(address));
				// console.log(result.toNumber());
				var bal = result.toNumber();
				return res.send({
					status : true,
					data : {
						balance : bal
					}
				});
			} catch(e) {
				console.log('index > getBalance API > smartcontract error: ', e);
				return res.send({
					status : false,
					error : {
						msg : 'Smart contract error'
					}
				});
			}
		} else {
			return res.send({
				status : true,
				data : {
					balance : 0
				}
			});
		}
	}
}));


router.post('/acceptFactoringProposal', async(function(req, res) {
	console.log('index > acceptFactoringProposal API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		var tx;
		if (web3Conf) {
			var scResult = await (updateInvoiceBlockchain(invoiceId, 'ifactor_proposal_accepted'));
			if (!scResult.status) {
				console.log('index > acceptFactoringProposal API > smartcontract error');
				return res.send({
					status : false,
					error: {
						msg : 'Smart contract error'
					}
				});
			} else {
				tx = scResult.tx;
			}
		}

		let remark = req.body.remark;
		let updateQuery = {$set : {state : 'ifactor_proposal_accepted', acceptProposalRemark : remark}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > acceptFactoringProposal API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.post('/rejectFactoringProposal', async(function(req, res) {
	console.log('index > rejectFactoringProposal API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;

		var tx;
		if (web3Conf) {
			var scResult = await (updateInvoiceBlockchain(invoiceId, 'ifactor_proposal_rejected'));
			if (!scResult.status) {
				console.log('index > rejectFactoringProposal API > smartcontract error');
				return res.send({
					status : false,
					error: {
						msg : 'Smart contract error'
					}
				});
			} else {
				tx = scResult.tx;
			}
		}

		let remark = req.body.remark;
		let updateQuery = {$set : {state : 'ifactor_proposal_rejected', rejectProposalRemark : remark}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > rejectFactoringProposal API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.post('/rateFinancer', function(req, res) {
	console.log('index > rateFinancer API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else { 
		let invoiceId = req.body.invoiceId;
		let updateQuery = {$set : {
				financerRatings : req.body.financerRatings,
				financerRatingRemark : req.body.financerRatingRemark
		}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > rateFinancer API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
});

router.post('/rateSupplier', function(req, res) {
	console.log('index > rateSupplier API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let updateQuery = {$set : {
				supplierRatings : req.body.supplierRatings,
				supplierRatingRemark : req.body.supplierRatingRemark
		}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > rateSupplier API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
});

router.post('/payInvoice', async (function(req, res) {
	console.log('index > payInvoice API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let updateObj = {state : 'invoice_paid'};
		let buyerAddress = req.body.buyerAddress;
		let supplierAddress = req.body.supplierAddress;
		let financerAddress = req.body.financerAddress;
		let invoiceAmount = req.body.invoiceAmount;
		var tx;
		if (web3Conf) {
			try {
				//tx = await(web3Helper.etherTransfer(buyerAddress));
				var postpayamount = invoiceAmount;
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
				console.log('index > payInvoice API > smartcontract error: ', e);
				return res.send({
					status : false,
					error :{
						msg: 'Smart contract error'
					}
				});
			}
		}

		let updateQuery = {$set : updateObj};
		updateInvoice({'invoiceId' : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > payInvoice API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.post('/buyTokens', function(req, res) {
	console.log('index > buyTokens API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		var address = req.body.address;
		var tokens = req.body.tokens;
		if (!address) {
			return res.send({
				status : false,
				error : {
					msg: 'Address not provided'
				}
			});
		}
		if (!tokens) {
			tokens = 100000;
		}

		try {
			var tx1 = await (web3Helper.buyTokens(address, tokens));
			return res.send({
				status : true,
				txHash : tx1
			});		
		} catch (e) {
			console.log('index > buyTokens API > smartcontract error: ', e);
			return res.send({
				status : false,
				error : {
					msg: 'Smart contract error'
				}
			});
		}
	}
});

router.post('/prepaySupplier', async(function(req, res) {
	console.log('index > prepaySupplier API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let buyerAddress = req.body.buyerAddress;
		let supplierAddress = req.body.supplierAddress;
		let financerAddress = req.body.financerAddress;
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
				tx1 = await (web3Helper.sendTokens(financerAddress, supplierAddress, prepayAmount));
				tx = await (web3Helper.prepayFactoring(invoiceId, prepayAmount));
			} catch(e) {
				console.log('index > prepaySupplier API > Blockchain error: ', e);
				return res.send({
					status : false,
					error : {
						msg: 'Blockchain error'
					}
				});
			}
		}

		let updateQuery = {$set : {state : 'ifactor_prepaid'}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > prepaySupplier API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.post('/postpaySupplier', async(function(req, res) {
	console.log('index > postpaySupplier API > req.body:', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		let buyerAddress = req.body.buyerAddress;
		let supplierAddress = req.body.supplierAddress;
		let financerAddress = req.body.financerAddress;
		var tx;
		if (web3Conf) {
			if (ENV == 'prod') {
				web3Helper.unlockSync(req.user.address, "");
			}
			try {
				//tx = await(web3Helper.etherTransfer(financerAddress));
				var postpayamount = await(web3Helper.getPostpayAmount(invoiceId));
				postpayamount = postpayamount.toNumber();
				tx1 = await (web3Helper.sendTokens(financerAddress, supplierAddress, postpayamount));
				tx = await (web3Helper.postpayFactoring(invoiceId, postpayamount));
			} catch(e) {
				console.log('index > postpaySupplier API > Blockchain error: ', e);
				return res.send({
					status : false,
					error : {
						msg: 'Blockchain error'
					}
				});
			}
		}

		let updateQuery = {$set : {state : 'completed'}};
		updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
			if (err) {
				console.log('index > postpaySupplier API > updateInvoice > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg: data
					}
				});
			}
			return res.send({
				status : true,
				data : {
					state : ''
				}
			});
		});
	}
}));

router.get('/getSupplierDashboard', function(req, res) {
	console.log('index > getSupplierDashboard API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		var email = req.user.email;
		var name = req.user.firstName + " " + req.user.lastName;
		getInvoices({supplierEmail : email}, function(err, data) {
			if (err) {
				console.log('index > getSupplierDashboard API > getInvoices > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg : data
					}
				});
			}
			return res.send({
				status : true,
				data : data,
				name: name
			})
		});
	}
});

router.get('/getBuyerDashboard', function(req, res) {
	console.log('index > getBuyerDashboard API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		var email = req.user.email;
		var name = req.user.firstName + " " + req.user.lastName;
		getInvoices({buyerEmail : email, state : {$ne : 'draft'}}, function(err, data) {
			if (err) {
				console.log('index > getBuyerDashboard API > getInvoices > err, data: ', err, data);
				return res.send({
					status : false,
					error: {
						msg : data
					}
				});
			}
			return res.send({
				status : true,
				data : data,
				name: name
			});
		});
	}
});

router.get('/getFinancerDashboard', function(req, res) {
	console.log('index > getFinancerDashboard API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		var email = req.user.email;
		var name = req.user.firstName + " " + req.user.lastName;
		let list = ['draft', 'invoice_created', 'invoice_rejected', 'invoice_accepted'];

		//get all invoices greater than 6;
		getInvoices({state : {$nin : list}}, function(err, data) {
			if (err) {
				console.log('index > getFinancerDashboard API > getInvoices > err, data: ', err, data);
				return res.send({
					status : false,
					error: {
						msg : data
					}
				});
			}
			return res.send({
				status : true,
				data : data,
				name: name
			});
		});
	}
});

router.get('/getInvoices', function(req, res) {
	console.log('index > getInvoices API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		getInvoices({}, function(err, data) {
			if (err) {
				console.log('index > getInvoices API > getInvoices > err, data: ', err, data);
				return res.send({
					status : false,
					error: {
						msg : data
					}
				})
			}
			return res.send({
				status : true,
				data : data
			})
		});
	}
});

router.post('/getBalance', async(function(req, res) {
	console.log('index > getBalance API > req.body: ', req.body);
	try{
		var balance = await (web3Helper.getBalance(req.body.address));
		balance = balance.toNumber();
		return res.send({
			status : true,
			addressBalance: balance
		});
	} catch (e){
		console.log('index > getBalance API > Blockchain error: ', e);
		return res.send({
			status : false,
			error: {
				msg: 'Blockchain error'
			}
		});
	}
}));

router.post('/getInvoiceDetails', async(function(req, res) {
	console.log('index > getInvoiceDetails API > req.body: ', req.body);
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		let invoiceId = req.body.invoiceId;
		if (web3Conf) {
			var balance = await (web3Helper.getBalance(req.user.address));
			balance = balance.toNumber();
		}
		getInvoices({'invoiceId' : invoiceId}, function(err, data) {
			if (err) {
				console.log('index > getInvoiceDetails API > getInvoices > err, data: ', err, data);
				return res.send({
					status : false,
					error: {
						msg : data
					}
				});
			}
			var invoiceHistory = dummyData.dummyTx;
			var invoice = data[0];
			//processInvoiceDetails(invoice);
			getUserDetails({email : invoice.supplierEmail}, {},async(function(err, userData) {
				if (err) {
					console.log('index > getInvoiceDetails API > getInvoices > getUserDetails > err, userData: ', err, userData);
					return res.send({
						status : false,
						error: {
							msg : data
						}
					});
				} else {
					invoice.supplierData = !err ? userData : {};
					if (web3Conf) {
						var allEvents = await (web3Helper.getAllEvents(invoiceId));
						helper.processEvents(allEvents, invoice);
						invoiceHistory = allEvents.filter(x => x.event == 'invoiceHistory');
						invoice.created = getInvoiceDates(invoiceHistory);
						var transferEvents = allEvents.filter(x => x.event == 'ifactorTransfer');
						var otherEvents = allEvents.filter(x => x.event != 'ifactorTransfer');
						return res.send({
							status : true,
							data : {
								invoice : invoice,
								invoiceHistory : invoiceHistory,
								transferEvents : transferEvents,
								otherEvents : otherEvents,
								balance : balance
							}
						});
						/*web3Helper.getInvoiceHistory(invoiceId, function(err, result) {
							if (!err) {
								invoiceHistory = result;
							}
							invoice.created = getInvoiceDates(invoiceHistory);
							return res.send({status : true, data : {invoice : invoice, invoiceHistory : invoiceHistory, balance : balance}});
						});*/
					} else {
						//console.log('invoiceHistory', invoiceHistory)
						return res.send({
							status : true,
							data : {
								invoice : invoice,
								invoiceHistory : dummyData.dummyInvoiceHistory,
								"transferEvents": dummyData.dummyTransferEvents,
								"otherEvents":dummyData.dummyOtherEvents,
								"balance":0
							}
						});
					}
				}
			}));
		});
	}
}));

router.get('/getUsers', function(req, res) {
	console.log('index > getUsers API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		getUsers({}, function(err, data) {
			if (err) {
				return res.send({
					status : false,
					error: {
						msg : data
					}
				})
			}
			return res.send({
				status : true,
				data : data
			})
		});
	}
});

router.get('/getBuyerList', function(req, res) {
	console.log('index > getBuyerList API');
	if (!req.isAuthenticated()) {
		return res.send({
			status : false,
			error: {
				msg: 'You are not logged in'
			}
		});
	} else {
		var collection = db.getCollection('users');
		var showFields = {email : 1, firstName : 1, address : 1};
		collection.find({type : 'Buyer'}, showFields).toArray(function(err, data) {
			if (err) {
				console.log('index > getBuyerList API > collection.find > err, data: ', err, data);
				return res.send({
					status : false,
					error : {
						msg : 'Server error, please try again'
					}
				});
			}
			return res.send({
				status : true,
				data : data
			});
		});
	}
});

router.get('/unlockCoinbase', function(req, res) {
	console.log('index > unlockCoinbase API');
	if (web3Conf) {
		var result = web3Helper.unlockCoinbase();
		return res.send({
			status : true,
			data: result
		});
	}
	return res.send({
		status : false,
		error: {
			msg: 'Not connected'
		}
	});
});

router.post('/getUserDetails', function(req, res){
	console.log('index > getUserDetails API > req.body: ', req.body);
	let email = req.body.email;
	getUserDetails({email: email}, {_id: false, firstName: true, lastName: true, email: true, address: true, contactNo: true}, function(err, data){
		if(err) {
			console.log('index > getUserDetails API > getUserDetails > err, data: ', err, data);
			return res.send({
				status : false,
				error : {
					msg: data
				}
			});
		} else if(data === null){
			return res.send({
				status : false,
				error: {
					msg : 'No data found for this email address'
				}
			});
		} else {
			return res.send({
				status : true,
				data : data
			});
		}
	});
});

router.post('/editUserDetails', function(req, res){
	console.log('index > editUserDetails API > req.body: ', req.body);
	let email = req.body.email;
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;
	let contactNo = req.body.contactNo;
	updateUser({email: email}, {$set : {firstName: firstName, lastName: lastName, contactNo: contactNo}}, function(err, data){
		if(err) {
			console.log('index > editUserDetails API > updateUser > err, data: ', err, data);
			return res.send({
				status : false,
				error : {
					msg: data
				}
			});
		} else {
			return res.send({
				status : true,
				data : data
			});
		}
	});
});

router.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

module.exports = router;