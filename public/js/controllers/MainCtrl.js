angular.module('MainCtrl', []).controller('MainController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	$scope.urlMap = function(type) {

		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			Buyer : '/views/buyer-dashboard.html',
			Financier : '/views/financier-dashboard.html',
			Supplier : '/views/supplier-dashboard.html',
			supplierApproved : '/views/supplier-approved.html',
			createInvoice : '/views/createInvoice.html',
		};

		$scope.templateUrlDashboard = $scope.dashboardUrl[type];
	};

	$scope.gotoDashboard = function() {
			console.log('inside gotoDashboard');
			$location.path('/dashboard');		
	};
 
	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (!resp.status) {
			$location.path('/login');
		} else {
			$rootScope.userType = resp.data.userType;
			//$location.path('/dashboard');
			GetPost.get({ url : '/getBalance' }, function(err, resp) {
				if (resp.status) {
					$rootScope.balance = resp.data.balance;
					console.log('balance', $scope.balance)
				}
		    });
		}
    });

}]);