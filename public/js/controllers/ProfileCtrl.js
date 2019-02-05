angular.module('ProfileCtrl', []).controller('ProfileController', ['$scope', '$window', function ($scope,$window) {
   
	$scope.gotoDashboard = function() {
		console.log('gotoDashboard')
		$location.path('/dashboard');
	}

	$scope.logOut = function () {
		var data = { url : '/logout' };
		GetPost.get(data, function(err, resp) {
			if (!resp.status) {	
				console.log('1');
				$location.path('/login');
			} else {
				console.log('2');
				$rootScope.isLoggedIn = false;
				window.location.href = "/login";
		}
	});
	}

	$scope.urlMap = function(type) {
		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			Buyer : '/views/buyer/dashboard.html',
			Financer : '/views/financier/dashboard.html',
			Supplier : '/views/supplier/dashboard.html',
			supplierApproved : '/views/supplier-approved.html',
			createInvoice : '/views/createInvoice.html'
		};

		$scope.templateUrlDashboard = $scope.dashboardUrl[type];
	};

	$scope.name = $rootScope.name;
	$scope.urlMap($rootScope.userType);


	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (!resp.status) {
			$location.path('/login');
		} else {
			console.log(resp);
			$scope.urlMap(resp.data.userType);
			$rootScope.userType = resp.data.userType;
			$scope.getInvoices();
		}

    });


	GetPost.get({ url : '/getBalance' }, function(err, resp) {
		if (resp.status) {
			$rootScope.balance = resp.data.balance;
		}
    });

	var invoiceStatusMap = Helper.invoiceStatusMap;

	$scope.date = new Date();
	$scope.eventSources = [];

	$scope.setStatusClasses = function (data) {
		var userType = $rootScope.userType;
		for (var i = 0; i < data.length; i++) {
			if (data[i].state) {
				data[i].status = 
							invoiceStatusMap[userType][data[i].state];
				data[i].stateClass = Helper.statusClassMap[data[i].state];
			}
		}

		return data;
	};


	if (!$rootScope.mainInvoiceIndex) {
		$rootScope.mainInvoiceIndex = 0;
	}
	
	$scope.dashboardData = [];
	$scope.invoiceData = [];

	$scope.userTypeUrl  = {
		Supplier : 'getSupplierDashboard', 
		Buyer : 'getBuyerDashboard',
		Financer : 'getFinancerDashboard',
	}

	var setInvoices = function() {

	};

    $scope.getInvoices = function () {
    	console.log('$scope.getInvoices: ',$rootScope.userType);
    	var url = $scope.userTypeUrl[$rootScope.userType];
    	console.log(url);
    	GetPost.get({ url : '/' + url}, function(err, docs) {
    		console.log(docs);
			$scope.dashboardData = $scope.setStatusClasses(docs.data);
			$scope.dashboardData = docs.data;
			$rootScope.name = docs.name;
			// $scope.invoiceData = $scope.dashboardData[$rootScope.mainInvoiceIndex];
	    });
    }  

    $scope.getDatesDiff = function(date) {
    	var date1 = new Date(date);
    	var date2 = new Date();
	    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
	            (1000 * 3600 * 24))/365);
		var days = (diff*360).toFixed(0);
		return days > 0 ? days : 0;
	};

    $scope.getInvoicesDetails = function (invoice, index) {	
		console.log('ffd');
		console.log(invoice);
		console.log(index);
    	$rootScope.mainInvoiceIndex = index;
    	$rootScope.invoiceId = invoice.invoiceId;
    	if (invoice.state == 'draft') {
    		$rootScope.fromDashboard = true;
    		$location.path('./create-invoice');
    	} else {
    		$location.path('/invoice-details/' + $rootScope.invoiceId);
    	}	
    };
	
	
}]);