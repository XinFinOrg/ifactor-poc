angular.module('MainCtrl', []).controller('MainController',['$rootScope',
'$location', function($rootScope, $location) {

	$rootScope.isLoggedIn = false;
	$location.path('/home');
}]);