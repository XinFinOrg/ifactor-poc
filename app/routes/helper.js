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

exports.invoiceStateMap = invoiceStateMap;