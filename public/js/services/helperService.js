angular.module('HelperService', []).factory('Helper', ['$http', function($http) {

    var invoiceStatusMap = {
        "Supplier": {
            "draft": "Draft",
            "invoice_created": "Approval Awaited",
            "invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Factoring Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accepted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "In Progress",
            "completed": "Completed"
        },
        "Buyer": {
            "invoice_created": "Approval Awaited",
            "invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Approved",
            "ifactor_rejected": "Approved",
            "ifactor_proposed": "Approved",
            "ifactor_proposal_rejected": "Approved",
            "ifactor_proposal_accepted": "Approved",
            "ifactor_prepaid": "Approved",
            "invoice_paid": "Payment completed",
            "completed": "Completed"
        },
        "Financer": {
            "ifactor_request": "Factorig Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accepted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "In Progress",
            "completed": "Completed"
        }
    };

    var stateOptions = [
            'draft',
            'invoice_created',
            'invoice_rejected',
            'invoice_accepted',
            'ifactor_request',
            'ifactor_rejected',
            'ifactor_proposed',
            'ifactor_proposal_accepted',
            'ifactor_proposal_rejected',
            'ifactor_prepaid',
            'invoice_paid',
            'completed'
        ];

    return {
        invoiceStatusMap : invoiceStatusMap,
        stateOptions : stateOptions
    }

}]);
