var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var helper = require('./helper');
var db = require('./../config/db');
var config = require('./../config/config');
var url = require('url');
var uniqid = require('uniqid');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var fs = require('fs');
var PATH = require('path');
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

router.post('/signup', (function(req, res) {
	let input = req.body.input;
	var collection = db.getCollection('users');
	collection.findOne({email : input.email}, function(err, result) {
		if (result) {
			return res.send({status : false, error :
				{errorCode : 'AccountExists', msg : 'Account Already Exists'}});
		}

		if (web3Conf) {
			input.address = web3Helper.createAccount(input.password);
		} else {
			input.address = 'hgfyyjhgtyfj';
		}
		input.phrase = input.password;
		collection.save(input, function (err, docs) {
		    if (err) {
				return res.send({status : false, error : {
					errorCode : 'DBError', msg : 'DB Error'
				}});
		    }
			return res.send({status : true});
		});
	});
}));

var getFullName = function(firstName, lastName) {
	return !firstName && !lastName ? 'Anonymous' : 
		firstName && lastName ? firstName + ' ' + lastName :
		firstName ? firstName : lastName;
};

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

var updateInvoiceBlockchain = async(function(invoiceId, state) {
    try {
	    var tx = await (web3Helper.setState(invoiceId, state));
	    return {status : true, tx : tx};
    } catch(e) {
    	console.log('smart contract error : ', e);
		return {status : false};
    }
});

var updateInvoice = function(query, update, cb) {
	var collection = db.getCollection('invoices');
	collection.update(query, update, function(err, data) {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var updateUser = function(query, update, cb) {
	var collection = db.getCollection('users');
	collection.update(query, update, function(err, data) {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

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
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	console.log('getBalance')
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

var getUsers = function(query, cb) {
	var collection = db.getCollection('users');
	collection.find(query).toArray(function(err, data) {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getUserDetails = function(query, cb) {
	var collection = db.getCollection('users');
	collection.find(query).toArray(function(err, data) {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data[0]);
	});
};

var getInvoices = function(query, cb) {
	console.log('inside getInvoices');
	console.log('user')
	var collection = db.getCollection('invoices');
	collection.find(query).sort({'created' : -1}).toArray(function(err, data) {
		if (err) {
			console.log('err', err);
			return cb(true, err);
		}
		console.log('success');
		return cb(false, data);
	});
};

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


router.get('/getBalance', async(function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else { 
	if (!req.user || !web3Conf) {
		return {status : true, data : {balance : 0}};
	}
	if (web3Conf) {
		try {
		    var balance = await (web3Helper.getBalance(req.user.address));
		    balance = balance.toNumber();
			return {status : true, data : {balance : 0}};
		} catch(e) {
			return {status : false, error : 'blockchain error'};
		}
	}
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
		var invoiceHistory = helper.dummyTx;
		var invoice = data[0];
		//processInvoiceDetails(invoice);
		getUserDetails({email : invoice.supplierEmail}, async(function(err, userData) {
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
					invoiceHistory : helper.dummyInvoiceHistory,
					"transferEvents": helper.dummyTransferEvents,
					"otherEvents":helper.dummyOtherEvents, "balance":0}}
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

var authenticate = function (req, res, next) {
	console.log('inside authenticate');
	console.log(req.body);
    passport.authenticate('local', function (err, user, info) {
		console.log("in here 1");
    	console.log(err, user, info)
        if (err) {
        	console.log('err', err)
            return next(err);
        }
        if (!user) {
			console.log('!user, info:',info);
            return res.send({ success: false, message: info });
        }
        console.log('user', user);
        console.log('firstName', user['firstName']);
        console.log("<== " + user.email + " Logged in [" +
                    new Date() + "] <==");

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            req.auth = {};
            req.auth.user = user;
            req.auth.info = info;
            return next();
        });
	})(req, res, next);
	console.log("in here 2");
};

router.post('/login', authenticate, async (function(req, res) {
	var [email, password] = [req.body.email, req.body.password];
	var collection = db.getCollection('users');	
	collection.find({email : email, password : password}).toArray(function(err, data) {
		if (err || !data.length) {
			return res.send({status : false})
		}

		var address = req.user.address;
		var userType = req.user.type;
		return res.send({status : 'success', data : {userType : data[0].type}});
	});
}));

//forgot password logic
router.post('/forgot-password', (function(req, res) {
	let input = req.body.input;
	var collection = db.getCollection('users');
	collection.findOne({email : input.email}, function(err, result) {
		if (result) {
			return res.send({status : false, error :
				{errorCode : 'AccountExistsforgotpassword', msg : data[0].type}});
		}

		if (web3Conf) {
			input.address = web3Helper.createAccount(input.password);
		} else {
			input.address = 'hgfyyjhgtyfj';
		}
		input.phrase = input.password;
		collection.save(input, function (err, docs) {
		    if (err) {
				return res.send({status : false, error : {
					errorCode : 'DBError', msg : 'DB Error'
				}});
		    }
			return res.send({status : true});
		});
	});
}));

router.get('/startApp', function(req, res) {
	if (!req.isAuthenticated()) {
		console.log('startApp api: if');
		return res.send({status : false});
	} else {
		console.log('startApp api: else');
		return res.send({status : true, data : {userType : req.user.type}});
	}
});

router.get('/logout', function(req, res) {
	req.logout();
	res.clearCookie('connect.sid');
	res.redirect('/');
	console.log('logout aaya: ', req.isAuthenticated());
	// return res.send({status : true});
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

router.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

module.exports = router;