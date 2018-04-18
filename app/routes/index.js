var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var helper = require('./helper');
var db = require('./../config/db');
var url = require('url');
var uniqid = require('uniqid');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var web3Conf = false;
if (web3Conf) {
	var web3Helper = require('./web3Helper');	
}

router.post('/signup', (function(req, res) {
	console.log('inside signup');
	let input = req.body.input;
	console.log('signup input', input);
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

router.post('/createInvoice', async (function(req, res) {
	let input = req.body.input;
	input.supplierEmail = req.user.email;
	input.supplierName = req.user.firstName + ' ' + req.user.lastName;
	input.supplierAddress = req.user.address;
	input.state = 'invoice_created';
	input.invoiceId = uniqid();
	input.invoiceNo = parseInt(input.invoiceNo);
	input.invoiceAmount = parseInt(input.invoiceAmount);
	input.created = Date.now();
	//console.log('uniqid', input.invoiceId);
	//input.owners = [];
	//input.owners.push('112344'); //add supplierID
	var collection = db.getCollection('invoices');
	console.log(input);
	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.addInvoice(input));
		    input.createHash = tx;
	    } catch(e) {
	    	console.log(e);
			return res.send({status : false, message : e});
	    }
	}
	collection.save(input, function (err, docs) {
	    if (err) {
			return res.send({status : false, error : {
				errorCode : 'DBError', msg : 'DB Error'
			}});
	    }
		return res.send({status : true, tx : tx});
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
	/*query = {invoiceNo : 12345}
	update = {$set : {state : 'approved'}}*/
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

	var tx;
	if (web3Conf) {	
	    try {
		    tx = await (web3Helper.setState(invoiceId, 'ifactor_request'));
		    console.log('tx', tx);
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
		return res.send({status : true, data : {state : '', tx : tx}});
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

	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.payInvoice(invoiceId));
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

	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.prepayFactoring(invoiceId));
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

	var tx;
	if (web3Conf) {
	    try {
		    tx = await (web3Helper.postpayFactoring(invoiceId));
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
	collection.find().toArray(function(err, data) {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
};

var getInvoices = function(query, cb) {
	console.log('inside getInvoices');
	console.log('user')
	var collection = db.getCollection('invoices');
	collection.find(query).toArray(function(err, data) {
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

var getPrepayAmount = function(invoice) {
	return (!invoice.saftyPercentage || invoice.saftyPercentage <= 0) ?
							invoice.invoiceAmount :
							(invoice.saftyPercentage/100 * invoice.invoiceAmount);
};

var getCharges = function() {
	return (!invoice.platformCharges || invoice.platformCharges <=0) ? 0 :
							(invoice.platformCharges/100 * invoice.invoiceAmount);
}

var getPostpayAmount = function(invoice) {
	return  invoice.invoiceAmount - getPrepayAmount(invoice) + getCharges(invoice);
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

router.post('/getInvoiceDetails', function(req, res) {
	console.log('get invoice details');
	let invoiceId = req.body.invoiceId;
	//'invoiceId' : new ObjectID(invoiceId)}
	getInvoices({'invoiceId' : invoiceId}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		var invoice = data[0];
		processInvoiceDetails(invoice);
		return res.send({status : true, data : invoice});
	});
});

router.get('/getUsers', function(req, res) {
	getUsers({}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data})
		}
		return res.send({status : true, data : data})
	});
});


/*router.post('/login', function(req, res) {
    passport.authenticate('local', {
        failureRedirect: '/error';
    }),
    function(req, res) {
        res.redirect('/');

    }
});*/

var autheticate = function (req, res, next) {
	console.log('inside authenticate');
	console.log(req.user);
	/*if (req.isAuthenticated()) {
		return next();
	}*/
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

router.post('/login', autheticate, function(req, res) {
	console.log('inside login');
	console.log('user info', req.user)

	var [email, password] = [req.body.email, req.body.password];
	var collection = db.getCollection('users');
	collection.find({email : email, password : password}).toArray(function(err, data) {
		if (err || !data.length) {
			return res.send({status : false})
		}
		console.log(JSON.stringify(data, null, 4));
		return res.send({status : 'success', data : {userType : data[0].type}});
	});
	// return res.send({status : 'success'});
});

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
