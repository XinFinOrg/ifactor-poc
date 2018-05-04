	angular.module('InvoiceDetailsCtrl', []).controller('InvoiceDetailsController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'Helper', '$routeParams',  function($scope, $rootScope, $http, $location, GetPost,Helper, $routeParams) {

	$scope.urlMap = function(type) {
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
		for (var i = 0; i < data.length; i++) {
			if (data[i].state) {
				data[i].status = invoiceStatusMap[userType][data[i].state];
				data[i].stateClass = Helper.statusClassMap[data[i].state];
			}
		}

		return data;
	};

	$scope.getInvoiceStatus = function(state) {
		console.log('this.state.', state);
		var status = invoiceStatusMap[$rootScope.userType][state];
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
			invoiceId : $rootScope.invoiceId || $routeParams.invoiceId
		};
		GetPost.post(data, function(err, resp) {
			console.log('invoiceDetails response');
			$scope.invoiceData = resp.data.invoice;
			$rootScope.balance = resp.data.balance;
			$scope.invoiceTxHistory = resp.data.invoiceHistory;
			mapInvoiceHistory($scope.invoiceTxHistory);
			$scope.setCurrentStage();
		});
    }


    var mapInvoiceHistory = function(invoiceHistory) {
    	var tx;
		for (var i in invoiceHistory) {
			tx = invoiceHistory[i];
			switch(tx.event) {
				case 'invoiceHistory' :
					tx.eventDName = 'Invoice History',
					tx.status = invoiceStatusMap[$scope.userType][tx.args.state];
			}
		}
		//invoiceHistory.reverse();
    };


    $scope.getDatesDiff = function(date) {
    	var date1 = new Date(date);
    	var date2 = new Date();
	    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
	            (1000 * 3600 * 24))/365);
	    return (diff*360).toFixed(0);
	};


	$scope.filterTransactionHistory = function(state, txhash) {
		console.log('filterTransactionHistory');
		console.log($scope.invoiceTxHistory);
		var tx;
	    for (var i  in $scope.invoiceTxHistory) {
	        tx = $scope.invoiceTxHistory[i];
	        console.log(tx.args.state, state)
	        if (tx.args && tx.args.state == state) {
	            return !txhash ? tx : tx.transactionHash;
	        }
	    }
	    return {};
	};

	$scope.downloadDocs = function(docField) {
		console.log('downloadDocs : inside downloadDocs');
		console.log(docField, $scope.invoiceData[docField])
    	var data = {
			docUrl : $scope.invoiceData[docField],
			name : docField + '.pdf',
			url : '/downloadInvoiceDocs'
		}
		if (!data.docUrl) {
			console.log('no documents to download');
			return;
		}
		window.open('/downloadInvoiceDocs?docUrl='+
			$scope.invoiceData[docField] + '&name=' + data.name, '_blank');
	};

	// invoiceId
	// use $rootScope.invoiceId

	/***************************supplier api*************************/

	// used
	$scope.requestFactoring = function (input) {

		var data = {
			url : '/requestFactoring',
			invoiceId : $rootScope.invoiceId,
			invoiceAmount : $scope.invoiceData.invoiceAmount
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
			console.log('supplierAddress : ', $scope.invoiceData.supplierAddress);
			console.log('financerAddress : ', $scope.invoiceData.financerAddress);
			console.log('buyerAddress : ', $scope.invoiceData.buyerAddress)
		var data = {
			url : '/payInvoice',
			invoiceId : $rootScope.invoiceId,
			supplierAddress : $scope.invoiceData.supplierAddress,
			financerAddress : $scope.invoiceData.financerAddress,
			buyerAddress : $scope.invoiceData.buyerAddress,
			invoiceAmount : $scope.invoiceData.invoiceAmount
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
			$scope.factorFlags.proceedIfactorRequest = false;
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
			$scope.factorFlags.proceedIfactorRequest = false;
			$scope.factorFlags.rejectIfactorRequest = false;
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
			invoiceId : $rootScope.invoiceId,
			supplierAddress : $scope.invoiceData.supplierAddress,
			financerAddress : $scope.invoiceData.financerAddress,
			buyerAddress : $scope.invoiceData.buyerAddress
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
			invoiceId : $rootScope.invoiceId,
			supplierAddress : $scope.invoiceData.supplierAddress,
			financerAddress : $scope.invoiceData.financerAddress,
			buyerAddress : $scope.invoiceData.buyerAddress
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

	$scope.stageOptions = [
		'goods_delivered',
		'buyer_confirmation',
		'factoring_request',
		'payment_disbursed',
		'contract_complete'
	];

	console.log($scope.stateOptions);

	var invoiceStages = {
		goods_delivered : 1,
		buyer_confirmation : 2,
		factoring_request : 3,
		payment_disbursed : 4,
		contract_complete : 5
	};

	var invoiceStates = {
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

	$scope.invoiceStageMap = {
		'Buyer' : {
			goods_delivered : [],
			buyer_confirmation : ['invoice_created', 'invoice_accepted', 'invoice_rejected'],
			factoring_request : ['ifactor_request', 'ifactor_rejected', 'ifactor_proposed',
				'ifactor_proposal_accepted', 'ifactor_proposal_rejected'
			],
			payment_disbursed : ['ifactor_prepaid'],
			contract_complete : ['invoice_paid', 'completed']
		},
		'Supplier' : {
			goods_delivered : [],
			buyer_confirmation : ['invoice_created', 'invoice_rejected'],
			factoring_request : ['invoice_accepted', 'ifactor_request', 'ifactor_rejected', 'ifactor_proposed',
				'ifactor_proposal_rejected'
			],
			payment_disbursed : ['ifactor_proposal_accepted', 'ifactor_prepaid', 'invoice_paid'],
			contract_complete : ['completed']
		},
		'Financer' : {
			goods_delivered : [],
			buyer_confirmation : ['invoice_created', 'invoice_rejected', 'invoice_accepted'],
			factoring_request : ['ifactor_request', 'ifactor_rejected', 'ifactor_proposed',
				'ifactor_proposal_rejected'
			],
			payment_disbursed : ['ifactor_proposal_accepted', 'ifactor_prepaid', 'invoice_paid'],
			contract_complete : ['completed']
		}
	};

	$scope.setCurrentStage = function() {
		//var userType = $scope.userType;
		var userType = $scope.userType;
		var currentState = $scope.invoiceData.state;
		var stageMap = $scope.invoiceStageMap[userType];
		for (var stageKey in stageMap) {
			if (stageMap[stageKey].indexOf(currentState) != -1) {
				$scope.currentStage = stageKey;
			}
		}
	};

	$scope.isStageEnabled = function(stage) {
		var currentStage = $scope.currentStage;
		var stageNo = invoiceStages[stage];
		var currentStageNo = invoiceStages[currentStage];
		//console.log('isStageEnabled', stage, stageNo, currentStageNo, (stageNo > (currentStageNo - 2)));
		return $scope.showHistoryFlag || (stageNo > (currentStageNo - 2));
	}

	$scope.isStageOpaque = function(stage) {
		var currentStage = $scope.currentStage;
		var stageNo = invoiceStages[stage];
		var currentStageNo = invoiceStages[currentStage];
		//console.log('isStageOpaque', stage, stageNo, currentStageNo, (stageNo > currentStageNo));
		return stageNo > currentStageNo;
	}

	$scope.isCurrentStage = function(stage) {
		//console.log('isCurrentStage', stage, $scope.currentStage, (stage == $scope.currentStage));
		return stage == $scope.currentStage;
	}

	$scope.isOldStage = function(stage) {
		var currentStage = $scope.currentStage;
		var stageNo = invoiceStages[stage];
		var currentStageNo = invoiceStages[currentStage];
		return (stageNo < currentStageNo);
	}

	$scope.isHistoryBarEnabled = function(stage) {
		if ($scope.showHistoryFlag) {
			return false;
		}
		var currentStage = $scope.currentStage;
		var stageNo = invoiceStages[stage];
		var currentStageNo = invoiceStages[currentStage];
		//console.log('isHistoryBarEnabled', stage, stageNo, currentStageNo, (stageNo == (currentStageNo-1)));
		return (stageNo == (currentStageNo-2));
	};

	$scope.showHistoryFlag = false;
	$scope.showHistory = function() {
		$scope.showHistoryFlag = true;
	}
}]);