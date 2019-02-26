angular.module('ResetPasswordCtrl', []).controller('ResetPasswordController',['$scope', '$rootScope',
'GetPost', 'Helper', '$location', '$window', function($scope, $rootScope,
 	GetPost, Helper, $location, $window) {

	$rootScope.isLoggedIn = false;
	$rootScope.isMainLoader = true;
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
				if (err){
					Helper.showAlert('error500');
				}
				if(res.status){
					Helper.showAlert('password_changed');
				} else if(res.error.errorCode  == "ResetIDError") {
					Helper.showAlert('link_invalid');
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