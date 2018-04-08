var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var helper = require('./helper');
//const LocalStrategy = require('passport-local').Strategy;
var db = require('./../config/db');
var url = require('url');

router.post('/signup', function(req, res) {
	let input = req.body;
	var collection = db.getCollection('users');
	collection.findOne({email : input.email}, function(err, result) {
		if (result) {
			return res.send({status : false, error : 
				{errorCode : 'AccountExists', msg : 'Account Already Exists'}});			
		}
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

router.post('/createInvoice', function(req, res) {
	let input = req.body.input;
	input.email = 'vinod@z.com';
	input.invoiceState = helper.invoiceStateMap[input.invoiceState];

	input.owners = [];
	input.owners.push('112344'); //add supplierID
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
	var collection = db.getCollection('users');
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
	let input = req.body.invoiceId;
	let updateQuery = {$set : {state : 'ifactor_proposed', factorDetails : {}}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/acceptFactoring', function(req, res) {
	let input = req.body.invoiceId;
	let financerId = '12345';
	let updateQuery = {$set : {state : 'ifactor_proposal_accpted'}};
	updateInvoice({invoiceId : invoiceId}, updateQuery, function() {
		if (err) {
			return cb(true, err);
		}
		return cb(false, data);
	});
});

router.post('/rejectFactoring', function(req, res) {
	let input = req.body.invoiceId;
	let updateQuery = {$set : {state : 'ifactor_proposal_rejected'}};
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

router.post('/login', function(req, res) {
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

var autheticate = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.send({ success: false, message: info });
        }
        console.log("<== " + user.email + " Logged in [" +
                    new Date() + "] <==");

        /*req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            req.auth = {};
            req.auth.user = user;
            req.auth.info = info;
            return next();
        });*/
    })(req, res, next);
};

router.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

module.exports = router;
