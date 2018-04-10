var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var helper = require('./helper');
//const LocalStrategy = require('passport-local').Strategy;
var db = require('./../config/db');
var url = require('url');
//var web3Helper = require('./web3Helper');
var uniqid = require('uniqid');

router.post('/signup', function(req, res) {
	let input = req.body.input;
	var collection = db.getCollection('users');
	collection.findOne({email : input.email}, function(err, result) {
		if (result) {
			return res.send({status : false, error : 
				{errorCode : 'AccountExists', msg : 'Account Already Exists'}});
		}
		//create blockchain account
		/*var address = web3Helper.createAccount(input.password);
		if (!address) {
			return res.send({status : false, error : 
				{errorCode : 'InternalError', msg : 'Internal Error'}});
		}
		input.address = address;*/
		input.address = 'abcdefg';
		input.phrase = input.password;
		console.log('address', address);
		collection.save(input, function (err, docs) {
		    if (err) {
				return res.send({status : false, error : {
					errorCode : 'DBError', msg : 'DB Error'
				}});
		    }
			return res.send({status : true});
		});
	});
});

router.get('/createInvoice', function(req, res) {
	let input = req.body.input;
	input.email = 'vinod@z.com';
	input.invoiceState = helper.invoiceStateMap[input.invoiceState];
	input.invoiceId = uniqid.uniqid();
	console.log('uniqid', input.invoiceId);
	//input.owners = [];
	//input.owners.push('112344'); //add supplierID
	var collection = db.getCollection('invoices');
	collection.save(input, function (err, docs) {
	    if (err) {
			return res.send({status : false, error : {
				errorCode : 'DBError', msg : 'DB Error'
			}});
	    }
		return res.send({status : true});
	});
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

router.post('/approveInvoice', function(req, res) {
	let input = req.body.invoiceId;
	input.buyerId = ""; //add buyer id
	let updateQuery = {$set : {state : 'invoice_accpted', buyerId : '123456'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/rejectInvoice', function(req, res) {
	let input = req.body.invoiceId;
	input.buyerId = ""; //add buyer id
	let updateQuery = {$set : {state : 'invoice_rejected', buyerId : '123456'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/requestFactoring', function(req, res) {
	let input = req.body.invoiceId;
	let updateQuery = {$set : {state : 'ifactor_request'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/factoringProposal', function(req, res) {
	let input = req.body.input;
	/*input :
		invoiceId : invoiceId
		platformCharges : '',
		saftyPercentage : '',
		acceptFactoringRemark : ''
	*/

	let updateQuery = {$set : {
			state : 'ifactor_proposed',
			financerAddress : req.body.address,
			financerEmail : req.body.email,
			platformCharges : input.platformCharges,
			saftyPercentage : input.saftyPercentage,
			acceptFactoringRemark : input.acceptFactoringRemark
		}
	};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/rejectFactoringRequest', function(req, res) {
	let invoiceId = req.body.invoiceId;
	let remark = req.body.remark;
	let updateQuery = {$set : {state : 'ifactor_rejected', rejectFactoringRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/acceptFactoringProposal', function(req, res) {
	let invoiceId = req.body.invoiceId;
	let remark = req.body.remark;
	let updateQuery = {$set : {state : 'ifactor_proposal_accpted', acceptProposalRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/rejectFactoringProposal', function(req, res) {
	let input = req.body.invoiceId;
	let remark = req.body.remark;
	let updateQuery = {$set : {state : 'ifactor_proposal_rejected', rejectProposalRemark : remark}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/payInvoice', function(req, res) {
	let input = req.body.invoiceId;
	let updateQuery = {$set : {state : 'invoice_paid'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/prepaySupplier', function(req, res) {
	let input = req.body.invoiceId;
	let updateQuery = {$set : {state : 'ifactor_prepaid'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/postpaySupplier', function(req, res) {
	let input = req.body.invoiceId;
	let updateQuery = {$set : {state : 'completed'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

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

	// var email = req.query.email;
	var email = 'vinod@z.com';
	getInvoices({email : email}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data})
	});
});

router.get('/getBuyerDashboard', function(req, res) {
	var email = req.query.email;
	getInvoices({email : email, state : {$ne : 'draft'}}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data});
		}
		return res.send({status : true, data : data});
	});
});

router.get('/getFinancerDashboard', function(req, res) {
	var email = req.query.email;
	//get all invoices greater than 6;
	getInvoices({email : email, stateNo : {$gt : 5}}, function(err, data) {
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

router.get('/getInvoiceDetails', function(req, res) {
	let invoiceId = req.query.invoiceId;
	getInvoices({'_id' : new ObjectID(invoiceId)}, function(err, data) {
		if (err) {
			return res.send({status : false, msg : data})
		}
		return res.send({status : true, data : data})
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
    passport.authenticate('local', function (err, user, info) {
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
			res.cookie('user', JSON.stringify(user), { maxAge: 2592000000 });
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
		return res.send({status : 'success', data : {type : data.type}});
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
