angular.module('ForgotPasswordCtrl', []).controller('ForgotPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', function($scope, $rootScope, GetPost, Helper, $location) {

	$rootScope.isLoggedIn = false;

	$scope.forgotPassword = function() {l
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, resp) {
			$rootScope.isMainLoader = true;
			if(err){
				Helper.showAlert('error500');
			}
			if(resp.status){
				Helper.showAlert('email_sent');
			} else if(resp.error.errorCode  == "AccountNotFound") {
				Helper.showAlert('account_not_found');
			} else {
				Helper.showAlert('error500');
			}
			setTimeout(() => {
				$location.path('/login');
			}, 3000);
	    });
	}

}]);