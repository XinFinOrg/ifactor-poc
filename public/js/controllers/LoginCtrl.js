angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', 
			'$location', 'GetPost', 'Helper', '$window',
			function($scope, $rootScope, $location, GetPost, Helper, $window) {
	
	$rootScope.isLoggedIn = false;
	$rootScope.isMainLoader = false;
	$rootScope.showHeaderOptions = true;
	if(!angular.equals($location.search(), {})){
		$rootScope.showHeaderOptions = false;
		$rootScope.isMainLoader = true;
		const email = $location.search().email;
		const verifyId = $location.search().verifyId;
		if(email !== undefined && verifyId !== undefined){
			let data = {
				email : email,
				verifyId : verifyId,
				url : '/verifyAccount'
			}
			GetPost.post(data, function(err, res) {
				$rootScope.isMainLoader = true;
				$rootScope.showHeaderOptions = false;
				if(!err){
					Helper.createToast(res.msg, 'success');
				} else if (err && !res.status) {
					Helper.createToast(res.error.msg, 'warning');
				} else {
					Helper.showAlert('error500');
				}
			});
		} else {
			Helper.showAlert('link_invalid');
		}
		setTimeout(() => {
			$location.url('/login');
		}, 2000)
	} else {
		Helper.checkForMessage();
		$scope.showHideClass = 'glyphicon glyphicon-eye-open';
		$scope.login = function() {
			var data = {
				email : $scope.input.email,
				password : $scope.input.password,
				url : '/login'
			}
			GetPost.post(data, function(err, resp) {
				if (!err) {
					$rootScope.showHeaderOptions = false;
					$rootScope.isMainLoader = true;
					$rootScope.isLoggedIn = true;
					Helper.createToast(resp.msg, 'success');
					setTimeout(() => {
						$location.path('/dashboard');
					}, 1000);
				} else if (err && !resp.status) {
					Helper.createToast(resp.error.msg, 'danger');
				} else {
					Helper.showAlert('error500');
				}
				$scope.input = {};
				$scope.userForm.$setUntouched();
			});
		}

		$scope.isShowPassword = false;
		$scope.showHideClass = 'glyphicon glyphicon-eye-open';
		$scope.showHideType = 'password';
		$scope.togglePasswordField = function() {
			$scope.isShowPassword = !$scope.isShowPassword;	
			$scope.showHideType = $scope.isShowPassword ? 'password' : 'text';
			$scope.showHideClass = $scope.isShowPassword ? 'glyphicon glyphicon-eye-open' : 'glyphicon glyphicon-eye-close';
		}
	}
	
	// }
	

}]);