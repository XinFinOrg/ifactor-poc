var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var passport = require('passport');
var helper = require('./helper');
var mailer = require('./mailer');
var db = require('./../config/db');
var config = require('./../config/config');
var url = require('url');
var uniqid = require('uniqid');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var axios = require('axios');
var OAuthClient = require('intuit-oauth');
require('dotenv').config();

var oauthClient = null;

var web3Conf = false;
if (web3Conf) {
	var web3Helper = require('./web3Helper');
}

var getFullName = function(firstName, lastName) {
	console.log('index > getFullName()');
	return !firstName && !lastName ? 'Anonymous' : 
		firstName && lastName ? firstName + ' ' + lastName :
		firstName ? firstName : lastName;
};

router.post('/setupQuickbook', function(req, res) {
	console.log("start : quickbook");
	if (!req.isAuthenticated()) {
		return res.send({status : false});
	} else {
	    oauthClient = new OAuthClient({
	        clientId : process.env.clientId,
	        clientSecret : process.env.clientSecret,
	        environment : process.env.environment,
	        redirectUri : process.env.redirectUri
	    });
	    var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
	    return res.send({status : true, authUrl : authUri});
	}
});

router.get('/connectBook', async(function(req, res) {
    var companyID = oauthClient.getToken().realmId;
    var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;

	var collection = db.getCollection("erp-sync");
	var result, lastUpdate;
    try {
		result = await (collection.findOne({source : 'quickbook'}));
		if (result) {
			lastUpdate = result.lastUpdate;
		} else {
			lastUpdate = "2010-01-01";
		}
    } catch(e) {
    	lastUpdate = "2010-01-01";
    	console.log('error', e);
    }

    oauthClient.createToken(req.url)
       .then(async (function(authResponse) {
			//var authToken = oauthClient.getToken().getToken();
             oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
		     oauthClient.makeApiCall({url: url + 'v3/company/' + companyID +'/cdc?entities=Invoice, Customer&changedSince=' + lastUpdate})
		        .then(async (function(authResponse1){
		            // var ar = JSON.stringify(authResponse1.getJson());
		            authResponse1 = authResponse1.getJson();
		            var changedSince = authResponse1.time;
					var invoices = authResponse1.CDCResponse[0].QueryResponse[0].Invoice;
					var customers = authResponse1.CDCResponse[0].QueryResponse[1].Customer;
					var customersObj = helper.arrayToObject(customers, 'Id');

					var inputs = [];
					for (var i in invoices) {
						var invoice = invoices[i];
						var customer = customersObj[invoice.CustomerRef['value']];
						if (!invoice.BillEmail || !invoice.BillEmail.Address) {
							var bill = {
								Address : customer.PrimaryEmailAddr ? customer.PrimaryEmailAddr.Address : false
							};
							invoice.BillEmail = bill;
						}

						//create invoice object
						var input = helper.prepareQbkInvoice(invoice);
						input.supplierEmail = req.user.email;
						input.supplierName = getFullName(req.user.firstName, req.user.lastName);
						input.supplierAddress = req.user.address;
						input.invoiceId = uniqid();
						input.created = Date.now();

						var tx;
						/*if (web3Conf && input.state == 'invoice_created') {
							try {
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
						}*/

						inputs.push({
							updateOne: {
							filter: {invoiceId : input.invoiceId, source : 'quickbook'},
							update: {"$setOnInsert" : input},
							upsert:true}
						});
					}

					if (!inputs.length) {
						return res.send({
							status : false,
							msg : "No invoices to sync"
						});
					}

					var collection = db.getCollection('invoices');
					try {
						result = await (collection.bulkWrite(inputs, {ordered:false}));
						collection = db.getCollection('erp-sync');
						var today = changedSince || helper.formatDate(new Date());
						result = await (collection.update({source : 'quickbook'}, {$set : {lastUpdate : today}}, {upsert : true}));
						return res.send({status : true, authResponse: authResponse1})
					} catch(e) {
						console.log('insert invoices error', e);
						return res.send({status : false})
					}
		        }))
		        .catch(function(e) {
		            console.error('authResponse1', e);
		        });
         }))
        .catch(function(e) {
             console.error(e);
         });
}));

module.exports = router;