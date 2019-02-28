angular.module('ResetPasswordCtrl', []).controller('ResetPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', '$window', function($scope, $rootScope,
 	GetPost, Helper, $location, $window) {

	$rootScope.isLoggedIn = false;
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
			GetPost.post(data, function(err, resp) {
				$rootScope.isMainLoader = true;
				$rootScope.showHeaderOptions = false;
				if (!err) {
					Helper.createToast(resp.msg, 'success');
				} else if (err && !resp.status) {
					Helper.createToast(resp.error.msg, 'danger');
				} else {
					Helper.showAlert('error500');
				}
			});
			setTimeout(() => {
				$location.url('/login');
			}, 2000)
		}
	} else {
		Helper.showAlert('link_invalid');
		setTimeout(() => {
			$location.url('/login');
		}, 2000)
	}
	


}]);