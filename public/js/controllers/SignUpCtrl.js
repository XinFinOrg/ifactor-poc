angular.module('SignUpCtrl', []).controller('SignUpController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

		$scope.isLoggedIn = false;

	$scope.signup = function() {
		var data  = {input : $scope.input, url : '/signup'};
		GetPost.post(data, function(err, resp) {
			console.log(err, resp);
			if (!resp.status) {
				console.log('error')
			} else {
				Helper.showAlert('signup');
				$location.path('/login');
			}
	    });
	}

	$scope.login = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 

}]);