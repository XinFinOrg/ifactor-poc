angular.module('ResetPasswordCtrl', []).controller('ResetPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', '$timeout', '$window', function($scope, $rootScope,
 	GetPost, Helper, $location, $timeout, $window) {

	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (res.status) {
			var data = { url : '/logout' };
			GetPost.get(data, function(err, res) {
				$rootScope.isMainLoader = true;
				if(res.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/home';
				}, 1000);
			});
		}
	});
	$rootScope.isMainLoader = true;
	$rootScope.showHeaderOptions = true;
	const email = $location.search().email;
	const resetId = $location.search().resetId;
	if(email !== undefined && resetId !== undefined){
		$rootScope.isMainLoader = false;
		$scope.resetPassword = function() {
			var data  = {
				'newPassword': $scope.input.password,
				'email': email,
				'resetId': resetId,
				'url' : '/resetPassword'
			};
			GetPost.post(data, function(err, res) {
				$rootScope.isMainLoader = true;
				$rootScope.showHeaderOptions = false;
				if (!err) {
					Helper.createToast(res.message, 'success');
				} else if (err && !res.status) {
					Helper.createToast(res.error.message, 'danger');
				} else {
					Helper.showAlert('error500');
				}
			});
			$timeout(() => {
				$location.url('/login');
			}, 2000)
		}
	} else {
		Helper.showAlert('link_invalid');
		$timeout(() => {
			$location.url('/login');
		}, 2000)
	}
	


}]);