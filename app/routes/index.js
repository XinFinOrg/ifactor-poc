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
		{name : 'grnDocs'}
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
	let input = req.body.input;
	input.supplierEmail = req.user.email;
	input.supplierName = getFullName(req.user.firstName, req.user.lastName);
	input.supplierAddress = req.user.address;
	input.state = 'invoice_created';
	input.invoiceId = uniqid();
	input.invoiceNo = input.invoiceNo;
	input.invoiceAmount = parseInt(input.invoiceAmount);
	input.created = Date.now();
	var collection = db.getCollection('invoices');
	var tx;
	if (web3Conf) {
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
	uploadUserDocs(input.invoiceId, req.files, function(filePaths) {
		for (var key in filePaths) {
			input[key] = !filePaths[key] ? (input[key] ? input[key] : '') :   filePaths[key];
		}
		collection.save(input, function (err, docs) {
		    if (err) {
				return res.send({status : false, error : {
					errorCode : 'DBError', msg : 'DB Error'
				}});
		    }
			return res.send({status : true, tx : tx});
		});
	});
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
}));

router.get('/downloadInvoiceDocs', function(req, res) {
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
});

router.post('/rejectInvoice', async (function(req, res) {
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
}));

router.post('/requestFactoring', async (function(req, res) {
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
}));

router.post('/factoringProposal', async (function(req, res) {
	let input = req.body.input;
	let invoiceId = req.body.invoiceId;
	var invoice = {
		invoiceId : invoiceId,
		financerAddress : req.user.address,
		platformCharges : parseInt(input.platformCharges),
		saftyPercentage : parseInt(input.saftyPercentage)
	};

	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.factoringProposal(invoice));
		    console.log('ifactor_proposed', tx);
	    } catch(e) {
	    	console.log(e)
			return res.send({status : false, message : 'smart contract error'});
	    }
	}

	let updateQuery = {$set : {
			state : 'ifactor_proposed',
			financerAddress : req.user.address,
			financerEmail : req.user.email,
			platformCharges : input.platformCharges,
			saftyPercentage : input.saftyPercentage,
			acceptFactoringRemark : input.remark
		}
	};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}));

router.post('/rejectFactoringRequest', async (function(req, res) {
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
}));

router.get('/getBalance', async (function(req, res) {
	console.log('getBalance')
	if (!req.isAuthenticated()) {
		return res.send({status : true, data : {balance : 0}});
	}
	var address = req.user.address;
	if (web3Conf) {
		try {
		    result = await (web3Helper.getBalance(address));
		    console.log(result.toNumber());
			return res.send({status : true, data : {balance : result.toNumber()}});
		} catch(e) {
			return res.send({status : true, data : {balance : 0}});
	    }
	} else {
		return res.send({status : true, data : {balance : 0}});
	}
}));


router.post('/acceptFactoringProposal', async(function(req, res) {
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
}));

router.post('/rejectFactoringProposal', async(function(req, res) {
	console.log('inside rejectFactoringProposal');
	let input = req.body.invoiceId;

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
}));

router.post('/payInvoice', async (function(req, res) {
	let invoiceId = req.body.invoiceId;
	let updateQuery = {$set : {state : 'invoice_paid'}};
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
				web3Helper.unlockSync(req.user.address, req.user.password);
			}
		    var tx1 = await (web3Helper.sendTokens(buyerAddress, financerAddress, parseInt(postpayamount)));
		    tx = await (web3Helper.payInvoice(invoiceId, invoiceAmount));
	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, error : 'blockchain error'});
	    }
	}

	updateInvoice({'invoiceId' : invoiceId}, updateQuery, function(err, data) {
		if (err) {
			return res.send({status : false, error : err});
		}
		return res.send({status : true, data : {state : ''}});
	});
}));

router.post('/prepaySupplier', async(function(req, res) {
	//'invoiceId' : new ObjectID(invoiceId)}
	let invoiceId = req.body.invoiceId;
	let buyerAddress = req.body.buyerAddress;
	let supplierAddress = req.body.supplierAddress;
	let financerAddress = req.body.financerAddress;
	console.log('address', supplierAddress, buyerAddress, financerAddress);
	var tx, tx1;
	if (web3Conf) {
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
}));

router.post('/postpaySupplier', async(function(req, res) {
	let invoiceId = req.body.invoiceId;
	let buyerAddress = req.body.buyerAddress;
	let supplierAddress = req.body.supplierAddress;
	let financerAddress = req.body.financerAddress;
	console.log(supplierAddress, buyerAddress, financerAddress);
	var tx;
	if (web3Conf) {
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
	console.log(req.isAuthenticated());
	console.log(req.user);
	console.log(req.session);
	var email = req.user.email;
	//email = 'vinod@z.com';
	getInvoices({supplierEmail : email}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data})
	});
});

router.get('/getBuyerDashboard', function(req, res) {
	var email = req.user.email;
	getInvoices({buyerEmail : email, state : {$ne : 'draft'}}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data});
	});
});

router.get('/getFinancerDashboard', function(req, res) {
	var email = req.user.email;
	let list = ['draft', 'invoice_created', 'invoice_rejected', 'invoice_accepted'];

	//get all invoices greater than 6;
	getInvoices({state : {$nin : list}}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data});
	});
});

router.get('/getInvoices', function(req, res) {
	getInvoices({}, function(err, data) {
		if (err) {
			console.log(err)
			return res.send({status : false, msg : data})
		}
		return res.send({status : true, data : data})
	});
});


var getDatesDiff = function(date) {
	var date1 = new Date(date);
	var date2 = new Date();
    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
            (1000 * 3600 * 24))/365);
    return (diff*360).toFixed(0);
};


var processInvoiceDetails = function(invoice) {
	invoice.invoiceAmount = !invoice.invoiceAmount ? 0 : invoice.invoiceAmount;
	invoice.firstPayment = (!invoice.saftyPercentage || invoice.saftyPercentage <= 0) ?
							invoice.invoiceAmount :
							(invoice.saftyPercentage/100 * invoice.invoiceAmount);
	invoice.charges = (!invoice.platformCharges || invoice.platformCharges <=0) ? 0 :
							(invoice.platformCharges/100 * invoice.invoiceAmount);
	invoice.balancePayment =  invoice.invoiceAmount - (invoice.firstPayment + invoice.charges);

	invoice.daysToPayout = getDatesDiff(invoice.payableDate);
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
}));

router.post('/getInvoiceDetails', async(function(req, res) {
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
		processInvoiceDetails(invoice);

		getUserDetails({email : invoice.supplierEmail}, async(function(err, userData) {
			invoice.supplierData = !err ? userData : {};
			if (web3Conf) {
				var allEvents = await (web3Helper.getAllEvents(invoiceId));
	        	//console.log(allEvents)
				helper.processEvents(allEvents);
				invoiceHistory = allEvents.filter(x => x.event == 'invoiceHistory');
				invoice.created = getInvoiceDates(invoiceHistory);
				var tarnsferEvents = allEvents.filter(x => x.event == 'ifactorTransfer');
				var otherEvents = allEvents.filter(x => x.event != 'ifactorTransfer');
				console.log(tarnsferEvents);
				return res.send({status : true, data : {
					invoice : invoice, invoiceHistory : invoiceHistory,
					tarnsferEvents : tarnsferEvents, otherEvents : otherEvents,
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
				console.log('invoiceHistory', invoiceHistory)
				return res.send({status : true, data : {invoice : invoice, invoiceHistory : invoiceHistory}});
			}
		}));
	});
}));

router.get('/getUsers', function(req, res) {
	getUsers({}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data})
		}
		return res.send({status : true, data : data})
	});
});

var autheticate = function (req, res, next) {
	console.log('inside authenticate');
	console.log(req.user);
    passport.authenticate('local', function (err, user, info) {
    	console.log(err, user, info)
        if (err) {
        	console.log('err', err)
            return next(err);
        }
        if (!user) {
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
};

router.post('/login', autheticate, async (function(req, res) {
	var [email, password] = [req.body.email, req.body.password];
	var collection = db.getCollection('users');	
	collection.find({email : email, password : password}).toArray(function(err, data) {
		if (err || !data.length) {
			return res.send({status : false})
		}

		var address = req.user.address;
		var userType = req.user.type;
		if (web3Conf && ENV == 'dev') {
			var accounts = web3Helper.getAccounts();
			var accAddress = '';
			accAddress = (userType == 'Supplier') ? accounts[9] :
					(userType == 'Buyer' ) ? accounts[8] : accounts[7];
			if (address != accAddress) {
				updateUser({email : req.user.email}, {$set : {address : accAddress}}, async (function(err, data) {
					console.log('address updated, new Address : ', accAddress);
					try {
				    	var tx1 = await(web3Helper.etherTransfer(accAddress));
					    var tx2 = await (web3Helper.buyTokens(accAddress));
					} catch(e) {
						console.log('blockchain error', e);
					}
				}));
			}
		}
		return res.send({status : 'success', data : {userType : data[0].type}});
	});
}));

router.get('/startApp', function(req, res) {
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
		return res.send({status : true, data : {userType : req.user.type}});
	}
});

router.get('/getBuyerList', function(req, res) {
	var collection = db.getCollection('users');
	var showFields = {email : 1, firstName : 1, address : 1};
	collection.find({type : 'Buyer'}, showFields).toArray(function(err, data) {
		if (err) {
			return res.send({status : false});
		}
		console.log(data);
		return res.send({status : true, data : data});
	});
});


router.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

module.exports = router;