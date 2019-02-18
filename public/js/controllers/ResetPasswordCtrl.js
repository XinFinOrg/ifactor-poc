angular.module('ResetPasswordCtrl', []).controller('ResetPasswordController',['$scope', '$rootScope',
 '$http', '$location', '$routeParams', 'GetPost', 'Helper',  function($scope, $rootScope,  $routeParams,
 	$http, $location, GetPost, Helper) {

	

		$scope.isLoggedIn = false;
		var myvalue = $routeParams.email;
	// console.log('defined',$location.search().resetId); 
// 	if ( $location.search('email')) {
// 		myvalue = $location.search()['email'];
// 		// 'myvalue' now stores '33'
//  }
	console.log('defined1',myvalue); 

	$scope.resetPassword = function() {
		var data  = {input : $scope.input, url : '/signup'};
		console.log('data in');
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, resp) {
			if(resp.status){
				Helper.createToast('Email has been sent successsfully.', 'success');
			} else if(resp.error.errorCode  == "AccountNotFound") {
				Helper.createToast('Email address not found.', 'warning');
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