angular.module('InvoiceDetailsCtrl', []).controller('InvoiceDetailsController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'Helper',  function($scope, $rootScope, $http, $location, GetPost,Helper) {

	$scope.urlMap = function(type) {
		console.log('<<<<<<<<<<<<<<<<<<<deep tought>>>>>>>>>>>>>');
		console.log("type :" + type);
		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			Buyer : '/views/buyer/invoiceDetails.html',
			Financer : '/views/financier/invoiceDetails.html',
			Supplier : '/views/supplier/invoiceDetails.html'
		}

		$scope.templateUrlInvoice = $scope.dashboardUrl[type];
	};

	$scope.getDashboardDetails = function () {
		$location.path('./dashboard');
	};

	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (!resp.status) {
			$location.path('/login');
		} else {
			console.log('userType', $rootScope.userType, 'invoiceId', $rootScope.invoiceId);
			$scope.urlMap(resp.data.userType);
			$rootScope.userType = resp.data.userType;
			console.log('invoiceId', $rootScope.invoiceId)
			var data = {
				url : '/getInvoiceDetails',
				invoiceId : $rootScope.invoiceId
			};
			GetPost.post(data, function(err, resp) {
				console.log(resp.data)
				$scope.invoiceData = resp.data;
			});
		}
    });

	var invoiceStatusMap = Helper.invoiceStatusMap;

	$scope.date = new Date();
	$scope.eventSources = [];

	$scope.setStatusClasses = function (data) {
		var userType = $rootScope.userType;
		console.log('userType', userType);
		for (var i = 0; i < data.length; i++) {
			if (data[i].state) {
				console.log('state', data[i].state);
				data[i].status = 
							invoiceStatusMap[userType][data[i].state];
				console.log('status', data[i].status);
				if (data[i].status == 'Approval Awaited') {
					data[i].stateClass = 'labelPending';
				} else if (data[i].status == 'Approved') {
					data[i].stateClass = 'labelApproved';
				} else if(data[i].status == 'Draft') {
					data[i].stateClass = 'labelDraft';
				} else {
					data[i].stateClass = 'labelRejected';
				}
			}
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

    //$scope.getInvoices();

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
			invoiceId : $rootScope.invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_request'
	    });

	};
	

	// used
	$scope.rejectFactoringProposal = function (input) {

		var data = {
			url : '/rejectFactoringProposal',
			invoiceId : $rootScope.invoiceId,
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
			invoiceId : $rootScope.invoiceId
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
			invoiceId : $rootScope.invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// invoice_rejected
	    });

	};

	$scope.payInvoice = function (input) {

		var data = {
			url : '/payInvoice',
			invoiceId : $rootScope.invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'invoice_paid'
	    });

	};


	/***************************financier api*************************/
	

	// used
	$scope.acceptFactoringForm = {
			platformCharges : 0,
			saftyPercentage : 0,
			acceptFactoringRemark : ''
	};

	// used
	$scope.factoringProposal = function (input) {
		var data = {
			url : '/factoringProposal',
			invoiceId : $rootScope.invoiceId,
			input :	$scope.acceptFactoringForm
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
	    });
	};


	$scope.proposalActionForm = {};
	// used
	$scope.rejectFactoringRequest = function () {
		var data = {
			url : '/rejectFactoringRequest',
			invoiceId : $rootScope.invoiceId,
			remark : $scope.proposalActionForm.remark
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_rejected'
	    });
	};

	$scope.acceptFactoringProposal = function () {
		var data = {
				url : '/acceptFactoringProposal',
				invoiceId : $rootScope.invoiceId,
				remark : $scope.proposalActionForm.remark
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
	    });
	};

	// used
	$scope.prepaySupplier = function (input) {

		var data = {
			url : '/prepaySupplier',
			invoiceId : $rootScope.invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_prepaid'
	    });

	};

	$scope.postpaySupplier = function (input) {

		var data = {
			url : '/postpaySupplier',
			invoiceId : $rootScope.invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'completed'
	    });

	};

	$scope.factorFlags = {
		proceedIfactorRequest : false,
		rejectIfactorRequest : false
	}

	$scope.isIfactorRequested = function() {
		return $scope.invoiceData.state == 'ifactor_request' &&
			!$scope.factorFlags.proceedIfactorRequest && !$scope.factorFlags.rejectIfactorRequest;
	}

	$scope.proceedRequest = function() {
		console.log('proceed Request');
		$scope.factorFlags.proceedIfactorRequest = true;
	}

	$scope.rejectRequest = function() {
		console.log('reject Request');
		$scope.factorFlags.rejectIfactorRequest = true;
	}

}]);