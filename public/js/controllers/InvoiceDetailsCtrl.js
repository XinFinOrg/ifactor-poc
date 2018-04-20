	angular.module('InvoiceDetailsCtrl', []).controller('InvoiceDetailsController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'Helper',  function($scope, $rootScope, $http, $location, GetPost,Helper) {

	$scope.urlMap = function(type) {
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
			$scope.getInvoiceDetails();
		}
    });

	$scope.gotoDashboard = function() {
		$location.path('/dashboard');
	}

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

	$scope.getInvoiceStatus = function(state) {
		console.log('this.state.', state);
		var status = invoiceStatusMap[$rootScope.userType][state];
		console.log('status', status);
		return status;
	}


	if (!$rootScope.mainInvoiceIndex) {
		$rootScope.mainInvoiceIndex = 0;
	}
	
	$scope.dashboardData = [];
	$scope.invoiceData = [];
	$scope.invoiceTxHistory = [];
    $scope.getInvoiceDetails = function() {
		var data = {
			url : '/getInvoiceDetails',
			invoiceId : $rootScope.invoiceId
		};
		GetPost.post(data, function(err, resp) {
			console.log('invoiceDetails response');
			$scope.invoiceData = resp.data.invoice;
			$scope.invoiceTxHistory = resp.data.invoiceHistory;
		});
    }

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
			$scope.getInvoiceDetails();
	    });

	};
	

	// used
	$scope.rejectFactoringProposal = function (input) {
		console.log('rejectFactoringProposal');
		var data = {
			url : '/rejectFactoringProposal',
			invoiceId : $rootScope.invoiceId,
			remark : $scope.proposalActionForm.remark
		}
		
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_proposal_rejected'
			$scope.getInvoiceDetails();
	    });

	};
	

	/***************************buyer api*************************/
	$scope.invoiceActionForm = {};
	// used
	$scope.approveInvoice = function (input) {

		var data = {
			url : '/approveInvoice',
			invoiceId : $rootScope.invoiceId,
			buyerInvoiceRemark : $scope.invoiceActionForm.remark
		}
		GetPost.post(data, function(err, resp) {
			$scope.invoiceActionForm = {};
			$scope.getInvoiceDetails();
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
			$scope.getInvoiceDetails();
	    });

	};

	$scope.payInvoice = function () {
		var data = {
			url : '/payInvoice',
			invoiceId : $rootScope.invoiceId
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'invoice_paid'
			$scope.getInvoiceDetails();
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
			$scope.getInvoiceDetails();
	    });
	};


	$scope.proposalActionForm = {
		remark : ''
	};
	// used
	$scope.rejectFactoringRequest = function () {
		console.log('remark');
		console.log($scope.proposalActionForm);
		var data = {
			url : '/rejectFactoringRequest',
			invoiceId : $rootScope.invoiceId,
			remark : $scope.proposalActionForm.remark
		}
		GetPost.post(data, function(err, resp) {
    		console.log(resp);
    		// 'ifactor_rejected'
			$scope.getInvoiceDetails();
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
			$scope.getInvoiceDetails();
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
			$scope.getInvoiceDetails();
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
			$scope.getInvoiceDetails();
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

	$scope.isBuyerPayable = function() {
	    var list = ['ifactor_proposal_accepted', 'ifactor_prepaid', 'invoice_paid'];
	    var flag = list.indexOf($scope.invoiceData.state) >= 0 ? true : false;
	    return flag;
	};

	$scope.isBuyerApproved = function() {
		var list = ['invoice_accepted', 'ifactor_request', 'ifactor_rejected'];
	    return list.indexOf($scope.invoiceData.state) >= 0 ? true : false;		
	}

	$scope.stateOptions = [
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
	console.log($scope.stateOptions);

}]);