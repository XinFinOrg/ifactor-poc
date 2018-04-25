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
            "ifactor_request": "Factoring Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accepted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "Payment completed",
            "completed": "Completed"
        },
        "Financer": {
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

    var statusClassMap = {
        'draft' : 'labelDraft',
        'invoice_created' : 'labelPending',
        'invoice_rejected' : 'labelRejected',
        'invoice_accepted' : 'labelApproved',
        'ifactor_request' : 'labelPending',
        'ifactor_rejected' : 'labelRejected',
        'ifactor_proposed' : 'labelPending',
        'ifactor_proposal_accepted' : 'labelApproved',
        'ifactor_proposal_rejected' : 'labelRejected',
        'ifactor_prepaid' : 'labelApproved',
        'invoice_paid' : 'labelApproved',
        'completed' : 'labelApproved'
    };

    return {
        invoiceStatusMap : invoiceStatusMap,
        stateOptions : stateOptions,
        statusClassMap : statusClassMap
    }

}]);

