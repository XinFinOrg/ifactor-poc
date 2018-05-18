const contract = require('truffle-contract');
const Web3 = require('web3');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('promise');
var invoiceJson = require('../../deployer/build/contracts/Ifactor.json');

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    var provider = new Web3.providers.HttpProvider("http://localhost:8545");
    web3 = new Web3(provider);
}
var provider = new Web3.providers.HttpProvider("http://localhost:8545");

    if (web3 && web3.isConnected()) {
        console.log('web3 is Connected')
    } else {
        console.log('web3 is not Connected')
    }

var createAccount = function(phrase) {
    return web3.personal.newAccount();
}


var getAccounts = function() {
    console.log(web3.eth.accounts);
    return web3.eth.accounts;
};


var unlock = function (address, phrase) {
    return new Promise((resolve, reject) => {
        web3.personal.unlockAccount(address, phrase, function (error, result) {
            if (!error) {
                resolve(address);
            } else {
                reject(err);
            }
        });
    })
}

var unlockSync = function(address, phrase) {
    return web3.personal.unlockAccount(address, phrase);
};

var etherTransfer = function(addressTo, value=1) {
    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({
            to: addressTo,
            value: web3.toWei(value, "ether"),
            from: web3.eth.coinbase
        }, function (err, success) {
            if (!err) {
                resolve('success');
            } else {
                console.log('etherTransfer', err)
                reject(err);
            }
        });
    })
}

var getEthBalance = function(address) {
    return web3.eth.getBalance(address);
}

var selectContractInstance = (contractBuild) => {
  return new Promise(res => {
    const myContract = contract(contractBuild);
    myContract.setProvider(provider);
    myContract
      .deployed()
      .then(instance => res(instance));
  })
};

var getInstance = function(data) {
    const mycontract = web3.eth.contract(data.abi);
    var instance = mycontract.at(data.networks[web3.version.network].address);
    return instance;
}

var contractInstance = getInstance(invoiceJson);

var addInvoice = async (function(invoice) {
    var mm = await (contractInstance.addInvoice(
        invoice.invoiceId, invoice.invoiceNo, 'invoice_created', invoice.invoiceAmount,
        invoice.supplierAddress, invoice.buyerAddress, Date.now(),
        {from: web3.eth.accounts[1], gas:300000}
    ));
    return mm;
});

var factoringProposal = async (function(invoice) {
    console.log('invoice', invoice)
    var mm = await (contractInstance.addFactoring(
        invoice.invoiceId,
        invoice.financerAddress,
        parseInt(invoice.platformCharges),
        parseInt(invoice.saftyPercentage),
        parseInt(invoice.invoiceAmount),
        Date.now(),
        {from: web3.eth.accounts[1], gas:300000}
    ));
    return mm;
});

var prepayFactoring = async (function(invoiceId, amount) {
    var mm = await (contractInstance.prepayFactoring(invoiceId, amount, Date.now(),
          {from: web3.eth.accounts[1], gas:100000}));
    return mm;
});

var payInvoice = async (function(invoiceId, amount) {
    var mm = await (contractInstance.payInvoice(invoiceId, amount, Date.now(),
          {from: web3.eth.accounts[1], gas:100000}));
    return mm;
});

var postpayFactoring = async (function(invoiceId, amount) {
    var mm = await (contractInstance.postpayFactoring(invoiceId, amount, Date.now(),
          {from: web3.eth.accounts[1], gas:100000}));
    return mm;
});

var getState = async (function(invoiceId) {
    var mm = await (contractInstance.getState.call(invoiceId));
    return mm;
});

var setState = async (function(invoiceId, state) {
    var mm = await (contractInstance.setState(invoiceId, state, Date.now(),
          {from: web3.eth.accounts[1], gas:100000}));
    return mm;
});

var requestFactoring = async (function(invoiceId, state, amount) {
    console.log(invoiceId, state, amount)
    var mm = await (contractInstance.requestFactoring(invoiceId, state, parseInt(amount), Date.now(),
          {from: web3.eth.accounts[1], gas:100000}));
    return mm;
});

var buyTokens = async (function(address, amount) {
    amount = !amount ? 10000 : amount;
    var mm = await (contractInstance.buyTokens(address, amount,
          {from: web3.eth.accounts[1], gas:100000}));
    return mm;
});

var getAmount = async (function(invoiceId){
    var mm = await (contractInstance.getAmount.call(invoiceId));
    return mm;
});

var getPostpayAmount = async (function(invoiceId){
    var mm = await (contractInstance.getPostpayAmount.call(invoiceId));
    return mm;
});

var getPrepayAmount = async (function(invoiceId){
    var mm = await (contractInstance.getPrepayAmount.call(invoiceId));
    return mm;
});

var getAddresses = async (function(invoiceId){
    var mm = await (contractInstance.getAddresses(invoiceId));
    return mm;
});

var getFinancer = async (function(invoiceId){
    var mm = await (contractInstance.getFinancer(invoiceId));
    return mm;
});

var getSupplier = async (function(invoiceId){
    console.log('invoiceId', invoiceId)
    var mm = await (contractInstance.getSupplier(invoiceId));
    return mm;
});

var getBuyer = async (function(invoiceId){
    var mm = await (contractInstance.getBuyer(invoiceId));
    return mm;
});

var getProps = async (function(invoiceId){
    var mm = await (contractInstance.getProps(invoiceId));
    return mm;
});

var getInvoiceAmount = async (function(invoiceId){
    var mm = await (contractInstance.getInvoiceAmount.call(invoiceId));
    return mm;
});

var getBalance = async (function(address){
    var mm = await (contractInstance.getBalance.call(address));
    return mm;
});

var sendTokens = async(function(acc1, acc2, value) {
    if (ENV == 'dev') {
        value = 50;
    }
    if (!parseInt(value)) {
        value = 0;
    }
    var mm = await (contractInstance.transfer(acc2, value, 
          {from : acc1, gas:100000}));
    return mm;
});


const Promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );


var processEventBigNumbers = function(allEvents) {
    var event, obj;
    for (var i in allEvents) {
        event = allEvents[i];
        obj = event.args;
        for(var key in obj) {
            if(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == 'object') {
                obj[key] = obj[key].toNumber();
            }
        }
    }
};

var getAllEvents = async(function(invoiceId) {
    let eventInstance, events;
    let allEvents = []; 
    let f1 = {
            from: web3.eth.coinbase,
            gas: 70000000
        };
    let f2 = {
            fromBlock: 0,
            toBlock: 'latest'
        };

    eventInstance = contractInstance.invoiceHistory(f1, f2);
    events = await (Promisify(cb => eventInstance.get(cb)));
    allEvents = allEvents.concat(events);
    eventInstance = contractInstance.factoringRequest(f1, f2);
    events = await (Promisify(cb => eventInstance.get(cb)));
    allEvents = allEvents.concat(events);
    eventInstance = contractInstance.factoringProposal(f1, f2);
    events = await (Promisify(cb => eventInstance.get(cb)));
    allEvents = allEvents.concat(events);
    eventInstance = contractInstance.ifactorTransfer(f1, f2);
    events = await (Promisify(cb => eventInstance.get(cb)));
    allEvents = allEvents.concat(events);
    allEvents = allEvents.filter(tx => tx.args && tx.args.invoiceId == invoiceId);
    //handle bignumbers
    processEventBigNumbers(allEvents);
    //sort events by timeline
    allEvents.sort(function(x, y){
        return x.args.created - y.args.created;
    })
    console.log('allEvents', allEvents)
    return allEvents;
});

var getInvoiceHistory = function(invoiceId, cb) {
    var allEvents = contractInstance.invoiceHistory({
            from: web3.eth.coinbase,
            gas: 70000000
        },{
            fromBlock: 0,
            toBlock: 'latest'
        }
    );

    allEvents.get(function(err,result) {
    if(!err) {
        var result = result.filter(tx => tx.args && tx.args.invoiceId == invoiceId);
        return cb(false, result);
    }
        return cb(true);
    });
};

var getTransferEvents = function(invoiceId, cb) {
    var allEvents = contractInstance.Transfer({
            from: web3.eth.coinbase,
            gas: 70000000
        },{
            fromBlock: 0,
            toBlock: 'latest'
        }
    );

    allEvents.get(function(err,result) {
    if(!err) {
        //var result = result.filter(tx => tx.args && tx.args.invoiceId == invoiceId);
        console.log('getTransferEvents', JSON.stringify(result, null, 4));
        return cb(false, result);
    }
        return cb(true);
    });
};

var addInvoiceEvent = function(invoiceId, cb) {
    return contractInstance.createInvoice({}).get(function(err, res) {
        if(!err) {
            var result = result.filter(tx => tx.args && tx.args._invoice_id == invoiceId);
            return cb(false, result);
        }
        return cb(true);
    })
};

var getAllEvents2 = function(invoiceId, cb) {
    web3.eth.filter({
      from: 1,
      to: 'latest'
    }).get(function (err, result) {
        console.log('allEventsrrr', JSON.stringify(result, null, 4));
    })




    contractInstance.allEvents({}).get((e, res) => console.log('allEvents', JSON.stringify(res, null, 4)));

    var allEvents = contractInstance.allEvents({
            from: web3.eth.coinbase,
            gas: 70000000
        },{
            fromBlock: 0,
            toBlock: 'latest'
        }
    );

    allEvents.get(function(err,result) {
    if(!err) {
        console.log('allEvents2', JSON.stringify(result, null, 4));
        //var result = result.filter(tx => tx.args && tx.args.invoiceId == invoiceId);
        return cb(false, result);
    }
        return cb(true);
    });
};

module.exports = {
    createAccount : createAccount,
    unlock : unlock,
    unlockSync : unlockSync,
    etherTransfer : etherTransfer,
    getEthBalance : getEthBalance,
    addInvoice : addInvoice,
    factoringProposal : factoringProposal,
    prepayFactoring : prepayFactoring,
    payInvoice : payInvoice,
    postpayFactoring : postpayFactoring,
    getState : getState,
    setState : setState,
    buyTokens : buyTokens,
    getAmount : getAmount,
    getInvoiceHistory : getInvoiceHistory,
    getAllEvents : getAllEvents,
    getTransferEvents : getTransferEvents,
    getPostpayAmount : getPostpayAmount,
    getPrepayAmount : getPrepayAmount,
    getAddresses : getAddresses,
    getInvoiceAmount : getInvoiceAmount,
    getBalance : getBalance,
    sendTokens : sendTokens,
    getSupplier : getSupplier,
    getBuyer : getBuyer,
    getFinancer : getFinancer,
    addInvoiceEvent : addInvoiceEvent,
    getProps : getProps,
    getEthBalance : getEthBalance,
    requestFactoring : requestFactoring,
    getAccounts : getAccounts
};