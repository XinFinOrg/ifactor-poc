angular.module('DashboardCtrl', []).controller('DashboardController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'Helper',  function($scope, $rootScope, $http, $location, GetPost,Helper) {


	var invoiceStatusMap = Helper.invoiceStatusMap;

	$scope.urlMap = function(type) {

		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			buyer : '/views/buyer-dashboard.html',
			financier : '/views/financier-dashboard.html',
			supplier : '/views/supplier-dashboard.html',
			supplierApproved : '/views/supplier-approved.html',
			createInvoice : '/views/createInvoice.html',
		};

		$scope.templateUrlDashboard = $scope.dashboardUrl[type];
	};

	$scope.urlMap('supplier');


	$scope.date = new Date();
	$scope.eventSources = [];

	$scope.setStatusClasses = function (data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].invoiceState) {
				data[i].invoiceState = 
							invoiceStatusMap.supplier[data[i].invoiceState];
				if (data[i].invoiceState == 'Approval Awaited') {
					data[i].invoiceStateClass = 'labelPending';
				} else if (data[i].invoiceState == 'Approved') {
					data[i].invoiceStateClass = 'labelApproved';
				} else if(data[i].invoiceState == 'Draft') {
					data[i].invoiceStateClass = 'labelDraft';
				} else {
					data[i].invoiceStateClass = 'labelRejected';
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

    	var data = {
			url : '/getSupplierDashboard'
		}
    	GetPost.get(data, function(err, docs) {
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
    	if ($scope.dashboardData[index].invoiceState == 'Draft') {
    		$rootScope.fromDashboard = true;
    		$location.path('./create-invoice');
    	} else {
    		$location.path('./invoice-details');
    	}	
    };
	
	
}]);