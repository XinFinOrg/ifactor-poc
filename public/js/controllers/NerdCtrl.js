angular.module('NerdCtrl', []).controller('NerdController', function($scope, $rootScope, $location) {

	$scope.tagline = 'Nothing beats a pocket protector!';
	$rootScope.isMainLoader = false;
	$rootScope.isLoggedIn = false;
	$scope.gotoDashboard = function() {
		console.log('gotoDashboard')
		$location.path('/dashboard');
	}

	$scope.logOut = function () {
		//$scope.session.clear();
		$rootScope.isLoggedIn = false;
		window.location.href = "/login";
	}

});