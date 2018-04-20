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
        invoice.supplierAddress, invoice.buyerAddress,{from: web3.eth.accounts[1], gas:300000})
    );
    return mm;
});

var factoringProposal = async (function(invoice) {
    var mm = await (contractInstance.addFactoring(
        invoice.invoiceId,
        invoice.financerAddress,
        invoice.platformCharges,
        invoice.saftyPercentage,
        Date.now(),
        {from: web3.eth.accounts[1], gas:300000}
    ));
    return mm;
});

var prepayFactoring = async (function(invoiceId) {
    var mm = await (contractInstance.prepayFactoring(invoiceId, Date.now(),
          {from: web3.eth.accounts[1], gas:100000}).catch((e)=> {
            throw e;
          }));
    return mm;
});

var payInvoice = async (function(invoiceId) {
    var mm = await (contractInstance.payInvoice(invoiceId, Date.now(),
          {from: web3.eth.accounts[1], gas:100000}).catch((e)=> {
            throw e;
          }));
    return mm;
});

var postpayFactoring = async (function(invoiceId) {
    var mm = await (contractInstance.postpayFactoring(invoiceId, Date.now(),
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

var buyTokens = async (function(address) {
    var mm = await (contractInstance.buyTokens(address,
          {from: web3.eth.accounts[1], gas:100000}).catch((e)=> {
            throw e;
          }));
    return mm;
});

var getAmount = async (function(invoiceId){
    var mm = await (contractInstance.getAmount.call(invoiceId));
    return mm;
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

/*var getInstance = async (function() {
    contractInstance = await (selectContractInstance(invoiceJson));
});
getInstance();*/

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
    getInvoiceHistory : getInvoiceHistory
};