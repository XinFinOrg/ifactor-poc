angular.module('DashboardCtrl', []).controller('DashboardController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'Helper',  function($scope, $rootScope, $http, $location, GetPost,Helper) {

	$scope.urlMap = function(type) {
		console.log(type);
		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			buyer : '/views/buyer/dashboard.html',
			financier : '/views/financier/dashboard.html',
			supplier : '/views/supplier/dashboard.html',
			supplierApproved : '/views/supplier-approved.html',
			createInvoice : '/views/createInvoice.html'
		};

		$scope.templateUrlDashboard = $scope.dashboardUrl[type];
	};

	$scope.urlMap('supplier');


	// GetPost.get({ url : '/startApp' }, function(err, resp) {
	// 	if (!resp.status) {
	// 		$location.path('/login');
	// 	} else {
	// 		console.log(resp);
	// 		$scope.urlMap(resp.userType);
	// 		$rootScope.userType = resp.userType;
	// 	}

 //    });

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

    $scope.getInvoicesDetails = function (index) {

    	$rootScope.mainInvoiceIndex = index;
    	if ($scope.dashboardData[index].state == 'Draft') {
    		$rootScope.fromDashboard = true;
    		$location.path('./create-invoice');
    	} else {
    		$location.path('./invoice-details');
    	}	
    };
	
	
}]);