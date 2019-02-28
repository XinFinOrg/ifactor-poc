angular.module('ForgotPasswordCtrl', []).controller('ForgotPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', function($scope, $rootScope, GetPost, Helper, $location) {

	$rootScope.isLoggedIn = false;

	$scope.forgotPassword = function() {
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, resp) {
			$rootScope.isMainLoader = true;
			if (!err) {
				Helper.createToast(resp.msg, 'success');
			} else if (err && !resp.status) {
				Helper.createToast(resp.error.msg, 'danger');
			} else {
				Helper.showAlert('error500');
			}
			setTimeout(() => {
				$location.path('/login');
			}, 2000);
	    });
	}

}]);