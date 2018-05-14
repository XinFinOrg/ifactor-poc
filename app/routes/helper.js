var invoiceStateMap = {
    draft : 1,
    Invoice_created : 2,
    Invoice_rejected : 3,
    invoice_accepted : 4,
    ifactor_request : 5,
    ifactor_rejected : 6,
    ifactor_proposed : 7,
    ifactor_proposal_accpted : 9,
    ifactor_proposal_rejected : 8,
    ifactor_prepaid : 10,
    invoice_paid : 11,
    completed : 12
};

var dummyTx = [
    {
        "logIndex": 0,
        "transactionIndex": 0,
        "transactionHash": "0x56ec7035bd21d95a94b6100ad876d9be17b55fb15fce22a611432fb3b6a51b01",
        "blockHash": "0x24be04fa9d733156bad69b4fc00a2a9c9abb546da1b1c050f3b4d91cc2417700",
        "blockNumber": 6,
        "address": "0xab7ed59ddfa68b918a5849dd94ef24cd4342fb03",
        "type": "mined",
        "event": "invoiceHistory",
        "args": {
            "invoiceId": "1eucm0jg66oh73",
            "state": "invoice_accepted",
            "created": "1524121751841"
        }
    },
    {
        "logIndex": 0,
        "transactionIndex": 0,
        "transactionHash": "0x1f97949538e9248abaff635796aabda22d8bc81d7648d3e2615d3af8c016d053",
        "blockHash": "0x6e0b2268b788269e7c4d2f2179b51bc786c507767e4c99c172f3053f812fbbd2",
        "blockNumber": 7,
        "address": "0xab7ed59ddfa68b918a5849dd94ef24cd4342fb03",
        "type": "mined",
        "event": "invoiceHistory",
        "args": {
            "invoiceId": "1eucm0jg66oh73",
            "state": "ifactor_request",
            "created": "1524121810767"
        }
    },
    {
        "logIndex": 0,
        "transactionIndex": 0,
        "transactionHash": "0x9dd5353f51d1b0771471751f525bdf14ada1db5683834708a122fc8a2ca0116e",
        "blockHash": "0x3e8b722ccfb1600f369092703ca3196dfec3d5f5e8fc9925b109668abae1e258",
        "blockNumber": 8,
        "address": "0xab7ed59ddfa68b918a5849dd94ef24cd4342fb03",
        "type": "mined",
        "event": "invoiceHistory",
        "args": {
            "invoiceId": "1eucm0jg66oh73",
            "state": "ifactor_request",
            "created": "1524121930856"
        }
    },
    {
        "logIndex": 0,
        "transactionIndex": 0,
        "transactionHash": "0x5dd2967c8d79a640ea85fd0154af9ab4f74882b9e4675eedc8212944464057d1",
        "blockHash": "0xa649493cb6723c95337b712562cb2eda9ab8fb98a3031e40d159ac2ee51efc3e",
        "blockNumber": 9,
        "address": "0xab7ed59ddfa68b918a5849dd94ef24cd4342fb03",
        "type": "mined",
        "event": "invoiceHistory",
        "args": {
            "invoiceId": "1eucm0jg66oh73",
            "state": "ifactor_request",
            "created": "1524122147930"
        }
    }
];

var eventDNames = {
    invoiceHistory : 'Invoice History',
    factoringRequest : 'Factoring Request Details',
    factoringProposal : 'Factoring Terms',
    ifactorTransfer : 'Payment Details'
};

var getPrepayAmount = function(saftyPercentage, invoiceAmount) {
    return (!saftyPercentage || saftyPercentage <= 0) ?
        (!invoiceAmount ? 0 : invoiceAmount) :
        (saftyPercentage/100 * invoiceAmount);
};

var getCharges = function(platformCharges, invoiceAmount) {
    return (!platformCharges || platformCharges <=0) ? 0 :
            (platformCharges/100 * invoiceAmount);
}

var getPostpayAmount = function(invoice) {
    return  invoiceAmount - getPrepayAmount(invoice) + getCharges(invoice);
};

var processEvents = function(allEvents) {
    var event, ev;
    for (var i in allEvents) {
        event = allEvents[i];
        event.eventDName = eventDNames[event.event];
        if (event.event == 'factoringProposal') {
            console.log('factoringProposal')
            ev = event.args;
            ev.firstPayment = getPrepayAmount(ev.factorSaftyPercentage, ev.amount);
            ev.charges = getCharges(ev.factorCharges, ev.amount);
            ev.balancePayment = (ev.amount - (ev.firstPayment + ev.charges));
            console.log(ev);
        }
        if (event.event == 'ifactorTransfer') {
            ev = event.args;
            switch(ev.transferType) {
                case 'ifactor_prepaid' : ev.txDType = 'First Payment Financier to Supplier';
                    break;
                case 'invoice_paid' : ev.txDType = 'Invoice Payment Buyer to Financer';
                    break;
                case 'ifactor_postpaid' : ev.txDType = 'Final Payment Financier to Supplier'
            }
            
        }
    }
};


module.exports = {
    invoiceStateMap : invoiceStateMap,
    dummyTx : dummyTx,
    eventDNames : eventDNames,
    processEvents : processEvents
}
