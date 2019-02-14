angular.module('NerdCtrl', []).controller('NerdController', ['$scope', '$rootScope', '$location', 'GetPost', 'ngToast', 'Helper',
function($scope, $rootScope, $location, GetPost, ngToast, Helper) {

	$scope.tagline = 'Nothing beats a pocket protector!';
	
	// GetPost.get({ url : '/getUSDPrice' }, function(err, resp) {
	// 	if(err){
	// 		console.log('error:', err);
	// 	} else {
	// 		console.log('resp:', resp);
	// 	}
	// });
	$rootScope.message = '';
	$rootScope.messageType = '';
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
				$rootScope.message = 'You have logged out';
				$rootScope.messageType = 'success'
				$rootScope.isLoggedIn = false;
				// window.location.href = '/login';
				$location.path('/login');
				
			} else {
				console.log('2');
				$rootScope.isLoggedIn = false;
				window.location.href = "/login";
		}
	});

		// // $scope.session.clear();
		// console.log("chfcfhfc");
		// $rootScope.isLoggedIn = false;
		// window.location.href = "/login";
	}

}]);