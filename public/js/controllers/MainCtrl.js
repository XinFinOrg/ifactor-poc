angular.module('MainCtrl', []).controller('MainController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	$scope.isLoggedIn = false;

	// $scope.urlMap = function(type) {

	// 	if (type == 'createInvoice') {
	// 		$location.path('/create-invoice');
	// 	}
	// 	$scope.dashboardUrl = {
	// 		Buyer : '/views/buyer-dashboard.html',
	// 		Financier : '/views/financier-dashboard.html',
	// 		Supplier : '/views/supplier-dashboard.html',
	// 		supplierApproved : '/views/supplier-approved.html',
	// 		createInvoice : '/views/createInvoice.html',
	// 	};

	// 	$scope.templateUrlDashboard = $scope.dashboardUrl[type];
	// };

	$scope.gotoDashboard = function() {
			console.log('inside gotoDashboard');
			$location.path('/dashboard');		
	};

	$scope.goToSignup = function() {
		window.location.href = "/signup";
		// $location.path('/signup');		
};

	$scope.goToLogin = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 
	// GetPost.get({ url : '/startApp' }, function(err, resp) {
	// 	if (!resp.status) {
	// 		$location.path('/');
	// 	} else {
	// 		$rootScope.userType = resp.data.userType;
	// 		//$location.path('/dashboard');
	// 		GetPost.get({ url : '/getBalance' }, function(err, resp) {
	// 			if (resp.status) {
	// 				$rootScope.balance = parseFloat(resp.data.balance);
	// 				console.log('balance', $scope.balance)
	// 			}
	// 	    });
	// 	}
	// });
	
	// GetPost.get({ url : '/getUSDPrice' }, function(err, resp) {
	// 	if(err){
	// 		console.log('error:', err);
	// 	} else {
	// 		console.log('resp:', resp);
	// 	}
	// });

}]);