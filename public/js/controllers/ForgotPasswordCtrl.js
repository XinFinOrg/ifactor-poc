angular.module('ForgotPasswordCtrl', []).controller('ForgotPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', '$timeout', function($scope, $rootScope, GetPost, Helper, $location, $timeout) {

	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (res.status) {
			$rootScope.isMainLoader = true;
			$scope.showHeaderOptions = false;
			var data = { url : '/logout' };
			GetPost.get(data, function(err, res) {
				if(res.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/forgot-password';
				}, 1000);
			});
		} else {
			$rootScope.isMainLoader = false;
			$scope.showHeaderOptions = true;
		}
	});

	$scope.forgotPassword = function() {
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, res) {
			$rootScope.isMainLoader = true;
			if (!err) {
				Helper.createToast(res.message, 'success');
			} else if (err && !res.status) {
				Helper.createToast(res.error.message, 'danger');
			} else {
				Helper.showAlert('error500');
			}
			$timeout(() => {
				$location.path('/login');
			}, 2000);
	    });
	}

}]);