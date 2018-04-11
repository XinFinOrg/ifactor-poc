angular.module('HelperService', []).factory('Helper', ['$http', function($http) {

    var invoiceStatusMap = {
        "supplier": {
            "draft": "Draft",
            "Invoice_created": "Approval Awaited",
            "Invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Factorig Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accpted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "In Progress",
            "completed": "Completed"
        },
        "buyer": {
            "invoice_created": "Approval Awaited",
            "invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Approved",
            "ifactor_rejected": "Approved",
            "ifactor_proposed": "Approved",
            "ifactor_proposal_rejected": "Approved",
            "ifactor_proposal_accpted": "Approved",
            "ifactor_prepaid": "Approved",
            "invoice_paid": "Payment completed",
            "completed": "Completed"
        },
        "financer": {
            "ifactor_request": "Factorig Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accpted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "In Progress",
            "completed": "Completed"
        }
    };

    return {
        invoiceStatusMap : invoiceStatusMap,
    }

}]);