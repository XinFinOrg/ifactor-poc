angular.module('CreateInvoiceCtrl', []).controller('CreateInvoiceController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	var invoiceStateMap = Helper.invoiceStateMap;

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

	$scope.createRequest = function (argument) {
		// body...
	}

	$scope.date = new Date();
	$scope.eventSources = [];


    $scope.input = {
    	companyName : "",
		companyType : "Company Type",
		contactName : "",
		companyPhone : "",
		companyEmail : "",
		purchaseTitle : "",
		purchaseNo : "",
		purchaseDate : "",
		purchaseAmount : "",
		purchaseDocs : "",
		payableDate : "",
		invoiceNo : "",
		invoiceDate : "",
		invoiceAmount : "",
		invoiceDocs : "",
		grnNo : "",
		grnDate : "",
		grnDocs : "",
		invoiceState : "invoice_created",
		grnAmount : ""
		//buyerId
		//supplierId
    };

    $scope.submitInvoice = function (input, type) {

    	console.log(input);
    	$scope.input.invoiceState = type;
    	var data = {
			input : $scope.input,
			url : '/createInvoice'
		}

		GetPost.post(data, function(err, docs) {
			$location.path('/dashboard');
	    });

    }

    $scope.getDatesDiff = function(date) {
    	var date1 = date;
    	var date2 = new Date();
	    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
	            (1000 * 3600 * 24))/365).toFixed(2);
	    if (diff >= 0) {
	    	return diff;
	    }
	    if (!diff) {
	    	return 'N.A';
	    }
	};

	$scope.dashboardData = [];
    $scope.getInvoices = function () {

    	var data = {
			url : '/getSupplierDashboard'
		}
    	GetPost.get(data, function(err, docs) {
    		console.log(docs);
			$scope.input = docs.data[$rootScope.mainInvoiceIndex];
	    });
    }

    if ($rootScope.fromDashboard) {
    	$scope.getInvoices();
    	$rootScope.fromDashboard = false;
    }
    

	
}]);