const axios = require('axios');
var config = require('./../config/config');

var invoiceStateMap2 = {
    "draft": "Draft",
    "invoice_created": "Created",
    "invoice_rejected": "Rejected by buyer",
    "invoice_accepted": "Approved by buyer",
    "ifactor_request": "Factoring requested",
    "ifactor_rejected": "Factoring rejected",
    "ifactor_proposed": "Factoring proposed",
    "ifactor_proposal_rejected": "Factoring proposal rejected",
    "ifactor_proposal_accepted": "Factoring proposal accepted",
    "ifactor_prepaid": "First payment",
    "invoice_paid": "Buyer invoice payment",
    "completed": "Balance payment"
};

var eventDNames = {
    invoiceHistory : 'Invoice History',
    factoringRequest : 'Factoring Request Details',
    factoringProposal : 'Factoring Terms',
    ifactorTransfer : 'Payment Details'
};

var getDatesDiff = function(date, d2) {
    var date1 = new Date(date);
    var date2 = !d2 ? new Date() : new Date(d2);
    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
            (1000 * 3600 * 24))/365);
    return (diff*360 < 0) ? 0 : (diff*360).toFixed(0);
};

var processEvents = function(allEvents, invoice) {
    console.log('helper > processEvents() > allEvents, invoice: ', allEvents, invoice);
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
                case 'ifactor_prepaid' : ev.txDType = 'First Payment Financer to Supplier';
                    break;
                case 'invoice_paid' : ev.txDType = 'Invoice Payment Buyer to Financer';
                    break;
                case 'ifactor_postpaid' : ev.txDType = 'Final Payment Financer to Supplier'
            }
            
        }
    }
};

let formatDate = (date) => {
    var dd = date.getDate();
    var mm = date.getMonth()+1; 
    var yyyy = date.getFullYear(); 
    if(dd < 10) {
        dd = '0' + dd;
    } if(mm < 10) {
        mm = '0' + mm
    }
    return yyyy + '-' + mm + '-' + dd;
}

var prepareQbkInvoice = function(invoice) {
    var input = {
        state : 'invoice_created',
        qbkInvoiceId : invoice.Id,
        invoiceNo : invoice.DocNumber,
        invoiceAmount : invoice.DocNumber,
        items : invoice.Line,
        taxDetails : invoice.TxnTaxDetail,
        taxAmount : invoice.TxnTaxDetail.TotalTax,
        "companyName" : invoice.CustomerRef.name,
        "companyType" :"Automotive Aftermarket",
        "buyerEmail" : invoice.BillEmail.Address,
        //"buyerAddress" : #get address from buyer,
        "contactName" : invoice.CustomerRef.name,
        "companyPhone" : "",
        "companyEmail" : invoice.BillEmail.Address,
        "purchaseTitle" : 'Quickbook #' + invoice.DocNumber,
        "purchaseNo" : invoice.DocNumber,
        "purchaseDate" : formatDate(new Date(invoice.MetaData.CreateTime)),
        "purchaseAmount": invoice.TotalAmt,
        "purchaseDocs":"",
        "payableDate": invoice.DueDate,
        "invoiceNo": invoice.DocNumber,
        "invoiceDate": formatDate(new Date(invoice.MetaData.CreateTime)),
        "invoiceAmount": invoice.TotalAmt,
        "invoiceDocs":"",
        "grnNo":"GRN1234",
        "grnDate":"",
        "grnDocs":"",
        //"state": #as per createInvoice => new
        "grnAmount":"0",
        "source" : "Quickbook"
    };
    return input;
};

let arrayToObject = (arr, key) => {
    var result = Object.assign(...arr.map(x =>({[x[key]]:x})));
    return result;
}

module.exports = {
    processEvents : processEvents,
    getDatesDiff : getDatesDiff,
    prepareQbkInvoice : prepareQbkInvoice,
    arrayToObject : arrayToObject,
    formatDate : formatDate
}
