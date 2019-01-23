angular.module('ForgotPasswordCtrl', []).controller('ForgotPasswordController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	

		$scope.isLoggedIn = false;

	$scope.forgotpassword = function() {
		console.log('data in');
		var data  = {input : $scope.input, url : '/forgot-password'};
		console.log(data);
		GetPost.post(data, function(err, resp) {
			// console.log(err, resp);
			return resp;
	    });
	}

	$scope.login = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 

}]);