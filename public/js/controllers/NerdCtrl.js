angular.module('NerdCtrl', []).controller('NerdController', ['$scope', '$rootScope',
'$location', 'GetPost',
function($scope, $rootScope, $location, GetPost) {

	$scope.tagline = 'Nothing beats a pocket protector!';
	$rootScope.isMainLoader = false;
	$rootScope.isLoggedIn = false;
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

		// $scope.session.clear();
		console.log("chfcfhfc");
		$rootScope.isLoggedIn = false;
		window.location.href = "/login";
	}

}]);