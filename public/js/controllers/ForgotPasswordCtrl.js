angular.module('ForgotPasswordCtrl', []).controller('ForgotPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', '$timeout', function($scope, $rootScope, GetPost, Helper, $location, $timeout) {

	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (resp.status) {
			var data = { url : '/logout' };
			GetPost.get(data, function(err, resp) {
				$rootScope.isMainLoader = true;
				if(resp.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/forgot-password';
				}, 1000);
			});
		}
	});

	$scope.forgotPassword = function() {
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, resp) {
			$rootScope.isMainLoader = true;
			if (!err) {
				Helper.createToast(resp.message, 'success');
			} else if (err && !resp.status) {
				Helper.createToast(resp.error.message, 'danger');
			} else {
				Helper.showAlert('error500');
			}
			$timeout(() => {
				$location.path('/login');
			}, 2000);
	    });
	}

}]);