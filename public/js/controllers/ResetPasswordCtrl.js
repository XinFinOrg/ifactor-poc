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
				if (err){
					// console.log('Error:', err);
					Helper.createToast('Some error has occured.', 'danger');
				}
				if(res.status){
					Helper.createToast('Password has been changed successsfully', 'success');
				} else if(res.error.errorCode  == "ResetIDError") {
					Helper.createToast(res.error.msg, 'warning');
				} else {
					Helper.createToast('Some error has occured.', 'danger');
				}
				});
				setTimeout(() => {
					$window.location.href = '/login';
				}, 2000)
		}
	} else {
		$rootScope.message = 'Invalid link';
		$rootScope.messageType = 'warning';
		$location.url('/login');
		// $window.location.href = '/login';
	}
	


}]);