angular.module('NerdCtrl', []).controller('NerdController', function($scope, $rootScope, $location) {

	$scope.tagline = 'Nothing beats a pocket protector!';
	$rootScope.isMainLoader = false;
	$scope.gotoDashboard = function() {
		console.log('gotoDashboard')
		$location.path('/dashboard');
	}

	$scope.logOut = function () {
		//$scope.session.clear();
		window.location.href = "/login";
	}

});