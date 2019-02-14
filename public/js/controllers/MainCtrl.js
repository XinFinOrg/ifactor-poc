angular.module('MainCtrl', []).controller('MainController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	$rootScope.isLoggedIn = false;

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
		// window.location.href = "/signup";
		$location.path('/signup');		
};

	$scope.goToLogin = function() {
		$location.path('/login')
		// window.location.href = "/login";
	};
}]);