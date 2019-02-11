angular.module('ForgotPasswordCtrl', []).controller('ForgotPasswordController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	

		$scope.isLoggedIn = false;

	$scope.forgotPassword = function() {
		console.log('data in');
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, resp) {
			if(resp.status){
				Helper.createToast('Email has been sent successsfully.', 'success');
			} else if(resp.error.errorCode  == "AccountNotFound") {
				Helper.createToast('Email id not found.', 'warning');
			} else {
				Helper.createToast('Some error has occured.', 'danger');
			}
			return resp;
	    });
	}

	$scope.login = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 

}]);