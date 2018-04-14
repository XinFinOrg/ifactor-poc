angular.module('NerdCtrl', []).controller('NerdController', function($scope) {

	$scope.tagline = 'Nothing beats a pocket protector!';

	$scope.logOut = function () {
		$scope.session.clear();
		window.location.href = "/login";
	}

});