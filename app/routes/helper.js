const axios = require('axios');
var config = require('./../config/config');

var invoiceStateMap = {
    draft : 1,
    invoice_created : 2,
    invoice_rejected : 3,
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

var invoiceStateMap2 = {
    "draft": "Draft",
    "invoice_created": "Created",
    "invoice_rejected": "Rejected By Buyer",
    "invoice_accepted": "Approved By Buyer",
    "ifactor_request": "Factoring Requested",
    "ifactor_rejected": "Factoring Rejected",
    "ifactor_proposed": "Factoring Proposed",
    "ifactor_proposal_rejected": "Factoring Proposal Rejected",
    "ifactor_proposal_accepted": "Factoring Proposal Accepted",
    "ifactor_prepaid": "First Payment",
    "invoice_paid": "Buyer Invoice Payment",
    "completed": "Balance Payment"
};

var getDatesDiff = function(date, d2) {
    var date1 = new Date(date);
    var date2 = !d2 ? new Date() : new Date(d2);
    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
            (1000 * 3600 * 24))/365);
    return (diff*360 < 0) ? 0 : (diff*360).toFixed(0);
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

var processEvents = function(allEvents, invoice) {
    var event, ev;
    for (var i in allEvents) {
        event = allEvents[i];
        event.eventDName = eventDNames[event.event];
        if (event.event == 'invoiceHistory') {
            event.eventDName += ' - ' + invoiceStateMap2[event.args.state];
        }
        if (event.event == 'factoringProposal') {
            ev = event.args;
            /*ev.firstPayment = getPrepayAmount(ev.factorSaftyPercentage, ev.amount);
            ev.charges = getCharges(ev.factorCharges, ev.amount);
            ev.balancePayment = (ev.amount - (ev.firstPayment + ev.charges));*/
            ev.firstPayment = invoice.firstPayment;
            ev.charges = invoice.charges;
            ev.chargesPer = invoice.chargesPer;
            ev.balancePayment = invoice.balancePayment;
            ev.balancePaymentPer = invoice.balancePaymentPer;
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

var dummyInvoiceHistory = [
        {"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":384,"transactionHash":"0xc83501e65840411a03fa898048b992c96bef5679f8f7986640b0a506610762fa","transactionIndex":0,"blockHash":"0xac446b51e8bb9fa7c50b1426775a0921936679238a18bd5a196f35d0200d8e75","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_created","created":1533296731538},"eventDName":"Invoice History - Created"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":385,"transactionHash":"0x5600f59ca47e3b174b17701e6c03d873ea6a719fbd8f83b483279d8048f151da","transactionIndex":0,"blockHash":"0x4d9507fd8791057d000556f749dab45ede6bdf612804413aad7f467842e6c5c7","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_accepted","created":1533296905712},"eventDName":"Invoice History - Approved By Buyer"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":386,"transactionHash":"0xf5479c638b24deae81c8e344b7907720a68f47d18b9d711b7069a63e14e4821c","transactionIndex":0,"blockHash":"0x6dd889ea9ccf81eb7f374cb0ac52e77da460a3423fe21a18935f0c649941d0b6","logIndex":1,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_request","created":1533296953748},"eventDName":"Invoice History - Factoring Requested"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":387,"transactionHash":"0xd2dafb074b7883855bdb508259d116aa46a4bcde3b29cbe0301b29cc6e0c6050","transactionIndex":0,"blockHash":"0x9517b61855d8edd7fffe2115dfdba4fefb3352dc84fb3c32679b4a5540fad2fd","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_proposed","created":1533297123829},"eventDName":"Invoice History - Factoring Proposed"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":388,"transactionHash":"0x7a5cddeab1f8cd34dac874a376fd60a2708f064ca2b8f4656dea9a49b4aaa0a3","transactionIndex":0,"blockHash":"0x284d7499640a0ceca016fd23a1d35e78627385e6fd39c611529355857624fdc6","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_proposal_accepted","created":1533297378002},"eventDName":"Invoice History - Factoring Proposal Accepted"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":390,"transactionHash":"0xe637fad129e64ddce940013ca4868d586e1ea808ee845a657bc0141951c16c07","transactionIndex":0,"blockHash":"0x9ff8714d0ab5b87315144a18d6054bc9baff8ea3cf8bc48146181fb0d07495ef","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_prepaid","created":1533297514526},"eventDName":"Invoice History - First Payment"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":392,"transactionHash":"0xfc0ce2cfd697231ce040a037ff7cff88017eb0d4d233d177c3bf3fefb8447a11","transactionIndex":0,"blockHash":"0xd7262c68971f801105f2b97259ab768d763ccca73923aac608c550bf01c522ed","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_paid","created":1533297647334},"eventDName":"Invoice History - Buyer Invoice Payment"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":395,"transactionHash":"0x08791c368f8149a1271290b0aba6f861449451a96d672e5cab1f270e8d9bd86d","transactionIndex":0,"blockHash":"0x9f7b61958e158bef1930fee9a154c047f316919378ff17f7b26c45e3c2686b3f","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_paid","created":1533297759317},"eventDName":"Invoice History - Buyer Invoice Payment"}
    ];

var dummyTransferEvents = [
        {"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":390,"transactionHash":"0xe637fad129e64ddce940013ca4868d586e1ea808ee845a657bc0141951c16c07","transactionIndex":0,"blockHash":"0x9ff8714d0ab5b87315144a18d6054bc9baff8ea3cf8bc48146181fb0d07495ef","logIndex":1,"removed":false,"event":"ifactorTransfer","args":{"invoiceId":"98btb1bb1jkdxa919","transferType":"ifactor_prepaid","amount":8000,"created":1533297514526,"txDType":"First Payment Financier to Supplier"},"eventDName":"Payment Details"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":392,"transactionHash":"0xfc0ce2cfd697231ce040a037ff7cff88017eb0d4d233d177c3bf3fefb8447a11","transactionIndex":0,"blockHash":"0xd7262c68971f801105f2b97259ab768d763ccca73923aac608c550bf01c522ed","logIndex":1,"removed":false,"event":"ifactorTransfer","args":{"invoiceId":"98btb1bb1jkdxa919","transferType":"invoice_paid","amount":10000,"created":1533297647334,"txDType":"Invoice Payment Buyer to Financer"},"eventDName":"Payment Details"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":395,"transactionHash":"0x08791c368f8149a1271290b0aba6f861449451a96d672e5cab1f270e8d9bd86d","transactionIndex":0,"blockHash":"0x9f7b61958e158bef1930fee9a154c047f316919378ff17f7b26c45e3c2686b3f","logIndex":1,"removed":false,"event":"ifactorTransfer","args":{"invoiceId":"98btb1bb1jkdxa919","transferType":"ifactor_postpaid","amount":1994,"created":1533297759317,"txDType":"Final Payment Financier to Supplier"},"eventDName":"Payment Details"}
    ];

var dummyOtherEvents = [
        {"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":384,"transactionHash":"0xc83501e65840411a03fa898048b992c96bef5679f8f7986640b0a506610762fa","transactionIndex":0,"blockHash":"0xac446b51e8bb9fa7c50b1426775a0921936679238a18bd5a196f35d0200d8e75","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_created","created":1533296731538},"eventDName":"Invoice History - Created"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":385,"transactionHash":"0x5600f59ca47e3b174b17701e6c03d873ea6a719fbd8f83b483279d8048f151da","transactionIndex":0,"blockHash":"0x4d9507fd8791057d000556f749dab45ede6bdf612804413aad7f467842e6c5c7","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_accepted","created":1533296905712},"eventDName":"Invoice History - Approved By Buyer"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":386,"transactionHash":"0xf5479c638b24deae81c8e344b7907720a68f47d18b9d711b7069a63e14e4821c","transactionIndex":0,"blockHash":"0x6dd889ea9ccf81eb7f374cb0ac52e77da460a3423fe21a18935f0c649941d0b6","logIndex":1,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_request","created":1533296953748},"eventDName":"Invoice History - Factoring Requested"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":386,"transactionHash":"0xf5479c638b24deae81c8e344b7907720a68f47d18b9d711b7069a63e14e4821c","transactionIndex":0,"blockHash":"0x6dd889ea9ccf81eb7f374cb0ac52e77da460a3423fe21a18935f0c649941d0b6","logIndex":0,"removed":false,"event":"factoringRequest","args":{"invoiceId":"98btb1bb1jkdxa919","amount":10000,"created":1533296953748},"eventDName":"Factoring Request Details"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":387,"transactionHash":"0xd2dafb074b7883855bdb508259d116aa46a4bcde3b29cbe0301b29cc6e0c6050","transactionIndex":0,"blockHash":"0x9517b61855d8edd7fffe2115dfdba4fefb3352dc84fb3c32679b4a5540fad2fd","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_proposed","created":1533297123829},"eventDName":"Invoice History - Factoring Proposed"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":387,"transactionHash":"0xd2dafb074b7883855bdb508259d116aa46a4bcde3b29cbe0301b29cc6e0c6050","transactionIndex":0,"blockHash":"0x9517b61855d8edd7fffe2115dfdba4fefb3352dc84fb3c32679b4a5540fad2fd","logIndex":1,"removed":false,"event":"factoringProposal","args":{"invoiceId":"98btb1bb1jkdxa919","factorCharges":2,"factorSaftyPercentage":80,"amount":10000,"created":1533297123829,"firstPayment":8000,"charges":6,"chargesPer":0.06,"balancePayment":1994,"balancePaymentPer":19.939999999999998},"eventDName":"Factoring Terms"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":388,"transactionHash":"0x7a5cddeab1f8cd34dac874a376fd60a2708f064ca2b8f4656dea9a49b4aaa0a3","transactionIndex":0,"blockHash":"0x284d7499640a0ceca016fd23a1d35e78627385e6fd39c611529355857624fdc6","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_proposal_accepted","created":1533297378002},"eventDName":"Invoice History - Factoring Proposal Accepted"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":390,"transactionHash":"0xe637fad129e64ddce940013ca4868d586e1ea808ee845a657bc0141951c16c07","transactionIndex":0,"blockHash":"0x9ff8714d0ab5b87315144a18d6054bc9baff8ea3cf8bc48146181fb0d07495ef","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"ifactor_prepaid","created":1533297514526},"eventDName":"Invoice History - First Payment"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":392,"transactionHash":"0xfc0ce2cfd697231ce040a037ff7cff88017eb0d4d233d177c3bf3fefb8447a11","transactionIndex":0,"blockHash":"0xd7262c68971f801105f2b97259ab768d763ccca73923aac608c550bf01c522ed","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_paid","created":1533297647334},"eventDName":"Invoice History - Buyer Invoice Payment"},{"address":"0x6f2dbd40dbbd60d5f050735ee02a64904bdae675","blockNumber":395,"transactionHash":"0x08791c368f8149a1271290b0aba6f861449451a96d672e5cab1f270e8d9bd86d","transactionIndex":0,"blockHash":"0x9f7b61958e158bef1930fee9a154c047f316919378ff17f7b26c45e3c2686b3f","logIndex":0,"removed":false,"event":"invoiceHistory","args":{"invoiceId":"98btb1bb1jkdxa919","state":"invoice_paid","created":1533297759317},"eventDName":"Invoice History - Buyer Invoice Payment"}
    ];

// let getUSDPrice = function(){
//     return new Promise(function(resolve, reject) {
//         axios.get(config.getXDCPriceUrl, {params: {id:2634}}).then((resp,err) => {
//             console.log('getUSDPrice');
//             console.log(err, resp.data[0].price_usd);
//             resolve(resp.data[0].price_usd);
//         });
//     });
    
// }

module.exports = {
    invoiceStateMap : invoiceStateMap,
    dummyTx : dummyTx,
    eventDNames : eventDNames,
    processEvents : processEvents,
    getDatesDiff : getDatesDiff,
    dummyOtherEvents : dummyOtherEvents,
    dummyTransferEvents : dummyTransferEvents,
    dummyInvoiceHistory : dummyInvoiceHistory,
    // getUSDPrice : getUSDPrice
}
