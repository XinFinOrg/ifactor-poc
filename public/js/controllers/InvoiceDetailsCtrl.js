angular.module('InvoiceDetailsCtrl', []).controller('InvoiceDetailsController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'Helper',  function($scope, $rootScope, $http, $location, GetPost,Helper) {

	$scope.urlMap = function(type) {
		console.log("type :" + type);
		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			buyer : '/views/buyer/invoiceDetails.html',
			financier : '/views/financier/invoiceDetails.html',
			supplier : '/views/supplier/invoiceDetails.html'
		};

		$scope.templateUrlInvoice = $scope.dashboardUrl[type];
	};

	$scope.urlMap('supplier');


	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (!resp.status) {
			$location.path('/login');
		} else {
			$scope.urlMap(resp.userType);
			$rootScope.userType = resp.userType;
		}

    });

	var invoiceStatusMap = Helper.invoiceStatusMap;

	$scope.date = new Date();
	$scope.eventSources = [];

	$scope.setStatusClasses = function (data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].state) {
				data[i].state = 
							invoiceStatusMap.supplier[data[i].state];
				if (data[i].state == 'Approval Awaited') {
					data[i].stateClass = 'labelPending';
				} else if (data[i].state == 'Approved') {
					data[i].stateClass = 'labelApproved';
				} else if(data[i].state == 'Draft') {
					data[i].stateClass = 'labelDraft';
				} else {
					data[i].stateClass = 'labelRejected';
				}
			}
			continue;
			
		}

		return data;
	};


	if (!$rootScope.mainInvoiceIndex) {
		$rootScope.mainInvoiceIndex = 0;
	}
	
	$scope.dashboardData = [];
	$scope.invoiceData = [];
    $scope.getInvoices = function () {

    	GetPost.get({ url : '/getSupplierDashboard' }, function(err, docs) {
    		console.log(docs);
			$scope.dashboardData = $scope.setStatusClasses(docs.data);
			$scope.invoiceData = $scope.dashboardData[$rootScope.mainInvoiceIndex];
			console.log($scope.invoiceData);
			$scope.invoiceData.state = 'invoice_accpted';
	    });
    }

    $scope.getInvoices();

    $scope.getDatesDiff = function(date) {
    	var date1 = new Date(date);
    	var date2 = new Date();
	    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
	            (1000 * 3600 * 24))/365);
	    return (diff*360).toFixed(0);
	};

	

	// invoiceId
	// use $rootScope.invoiceId

	/***************************supplier api*************************/

	// used
	$scope.requestFactoring = function (input) {

		var data = {
			url : '/requestFactoring',
			invoiceId : invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_request'
	    });

	};

	
	// used
	$scope.acceptFactoringProposal = function (input) {

		var data = {
			url : '/acceptFactoringProposal',
			invoiceId : invoiceId,
			remark : remark
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_proposal_accpted'
	    });

	};

	// used
	$scope.rejectFactoringProposal = function (input) {

		var data = {
			url : '/rejectFactoringProposal',
			invoiceId : invoiceId,
			remark : remark
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_proposal_rejected'
	    });

	};
	

	/***************************buyer api*************************/

	// used
	$scope.approveInvoice = function (input) {

		var data = {
			url : '/approveInvoice',
			invoiceId : invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'invoice_accpted'
	    });

	};


	// used
	$scope.rejectInvoice = function (input) {

		var data = {
			url : '/rejectInvoice',
			invoiceId : invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// invoice_rejected
	    });

	};

	$scope.payInvoice = function (input) {

		var data = {
			url : '/payInvoice',
			invoiceId : invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'invoice_paid'
	    });

	};


	/***************************financier api*************************/
	

	// used
	$scope.factoringProposal = function (input) {

		/*input :
			invoiceId : invoiceId
			platformCharges : '',
			saftyPercentage : '',
			acceptFactoringRemark : ''
		*/

		var data = {
			url : '/factoringProposal',
			input : input
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_proposed'
	    });

	};

	// used
	$scope.rejectFactoringRequest = function (input) {

		var data = {
			url : '/rejectFactoringRequest',
			invoiceId : invoiceId,
			remark : remark
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_rejected'
	    });

	};

	// used
	$scope.prepaySupplier = function (input) {

		var data = {
			url : '/prepaySupplier',
			invoiceId : invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_prepaid'
	    });

	};

	$scope.postpaySupplier = function (input) {

		var data = {
			url : '/postpaySupplier',
			invoiceId : invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'completed'
	    });

	};

}]);