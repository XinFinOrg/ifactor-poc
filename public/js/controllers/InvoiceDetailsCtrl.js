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


	// GetPost.get({ url : '/startApp' }, function(err, resp) {
	// 	if (!resp.status) {
	// 		$location.path('/login');
	// 	} else {
	// 		$scope.urlMap(resp.userType);
	// 		$rootScope.userType = resp.userType;
	// 	}

 //    });

    $rootScope.userType = 'supplier';

	var invoiceStatusMap = Helper.invoiceStatusMap;

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

    	GetPost.get({ url : '/getSupplierDashboard' }, function(err, docs) {
    		console.log(docs);
			$scope.dashboardData = $scope.setStatusClasses(docs.data);
			$scope.invoiceData = $scope.dashboardData[$rootScope.mainInvoiceIndex];
			console.log($scope.invoiceData);
			$scope.invoiceData.invoiceState = 'invoice_accpted';
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

	$scope.reqForFactor = function() {

		var data = {
			url : '/getSupplierDashboard',
			invoiceId : $scope.invoiceData.invoiceNo

		}
		console.log(data)
		GetPost.get(data, function(err, docs) {
    		console.log(docs);
			
	    });
	}

}]);