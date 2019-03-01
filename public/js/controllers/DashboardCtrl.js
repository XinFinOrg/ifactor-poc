angular.module('DashboardCtrl', []).controller('DashboardController',['$scope', '$rootScope', 
			'$location', '$timeout', 'GetPost', 'Helper', '$window',
			function($scope, $rootScope, $location, $timeout, GetPost, Helper, $window) {

	
	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (!resp.status) {
			$scope.showHeaderOptions = false;
			$rootScope.isMainLoader = true;
			Helper.createToast(resp.error.message, 'warning');
			$timeout(() => {
				$location.path('/login');
			}, 1000);
		} else {
			Helper.checkForMessage();
			$scope.showHeaderOptions = true;
			if ($rootScope.balance == undefined){
				GetPost.get({ url : '/getBalance' }, function(err, resp) {
					if (resp.status) {
						$rootScope.balance = resp.data.balance;
					}
				});
			}
			$rootScope.isMainLoader = false;
			$rootScope.userType = resp.data.userType;
			$rootScope.name = resp.data.name;
			$scope.urlMap(resp.data.userType);
			$scope.date = new Date();
			$scope.eventSources = [];
			$scope.showToggle = false;
			$scope.dropdownMenuStyle = {'display':'none'};
			$scope.getInvoices();
			if (!$rootScope.mainInvoiceIndex) {
				$rootScope.mainInvoiceIndex = 0;
			}
			$scope.dashboardData = [];
			$scope.invoiceData = [];
		}
	});

	
	$scope.toggleDropdown = function() {
		$scope.showToggle = !$scope.showToggle;	
		$scope.dropdownMenuStyle = $scope.showToggle ? {'display':'block'} : {'display':'none'};
	}

	$scope.logOut = function () {
		$scope.showHeaderOptions = false;
		var data = { url : '/logout' };
		GetPost.get(data, function(err, resp) {
			$rootScope.isMainLoader = true;
			if(resp.status){
				Helper.showAlert('logged_out');
			} else {
				Helper.showAlert('error500');
			}
			$timeout(() => {
				$location.path('/login');
			}, 1000);
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
	
	var invoiceStatusMap = Helper.invoiceStatusMap;

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

	$scope.userTypeUrl  = {
		Supplier : 'getSupplierDashboard', 
		Buyer : 'getBuyerDashboard',
		Financer : 'getFinancerDashboard',
	}

    $scope.getInvoices = function () {
    	var url = $scope.userTypeUrl[$rootScope.userType];
    	GetPost.get({ url : '/' + url}, function(err, docs) {
			$scope.dashboardData = $scope.setStatusClasses(docs.data);
			$scope.dashboardData = docs.data;
			// $rootScope.name = docs.name;
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
    	$rootScope.mainInvoiceIndex = index;
    	$rootScope.invoiceId = invoice.invoiceId;
    	if (invoice.state == 'draft') {
    		$rootScope.fromDashboard = true;
    		$location.path('/create-invoice');
    	} else {
    		$location.path('/invoice-details/' + $rootScope.invoiceId);
    	}	
    };
	
	
}]);