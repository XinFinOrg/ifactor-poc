angular.module('HelperService', []).factory('Helper', ['$http', function($http) {

    var invoiceStatusMap = {
        'supplier' : {
            '1' : 'Draft',
            '2' : 'Approval Awaited',
            '3' : 'Rejected',
            '4' : 'Approved',
            '5' : 'Factorig Requested',
            '6' : 'Rejected',
            '7' : 'Proposal Received',
            '8' : 'Proposal Rejected',
            '9' : 'Proposal Accepted',
            '10' : 'In Progress',
            '11' : 'In Progress',
            '12' : 'Completed'
        },
        'buyer' : {
            '2' : 'Approval Awaited',
            '3' : 'Rejected',
            '4' : 'Approved',
            '5' : 'Approved',
            '6' : 'Approved',
            '7' : 'Approved',
            '8' : 'Approved',
            '9' : 'Approved',
            '10' : 'Approved',
            '11' : 'Payment completed',
            '12' : 'Completed'
        },
        'financer' : {
            '5' : 'Factorig Requested',
            '6' : 'Rejected',
            '7' : 'Proposal Received',
            '8' : 'Proposal Rejected',
            '9' : 'Proposal Accepted',
            '10' : 'In Progress',
            '11' : 'In Progress',
            '12' : 'Completed'
        }
    };

    return {
        invoiceStatusMap : invoiceStatusMap,
    }

}]);