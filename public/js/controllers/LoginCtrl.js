angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', 
			'$location', 'GetPost', 'Helper', '$timeout', '$window',
			function($scope, $rootScope, $location, GetPost, Helper, $timeout, $window) {
	
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
					$window.location.href = '/login';
				}, 1000);
			});
		} else {
			$rootScope.isMainLoader = false;
			$rootScope.showHeaderOptions = true;
		}
	});
	
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
					Helper.createToast(res.message, 'success');
				} else if (err && !res.status) {
					Helper.createToast(res.error.message, 'warning');
				} else {
					Helper.showAlert('error500');
				}
			});
		} else {
			Helper.showAlert('link_invalid');
		}
		$timeout(() => {
			$location.url('/login');
		}, 1000)
	} else {
		Helper.checkForMessage();
		$scope.showHideClass = 'glyphicon glyphicon-eye-open';
		$scope.login = function() {
			var data = {
				email : $scope.input.email,
				password : $scope.input.password,
				url : '/login'
			}
			GetPost.post(data, function(err, res) {
				$rootScope.isMainLoader = true;
				if (!err) {
					$rootScope.showHeaderOptions = false;
					$rootScope.isLoggedIn = true;
					Helper.createToast(res.message, 'success');
					$timeout(() => {
						$location.path('/dashboard');
					}, 1000);
				} else {
					if (err && !res.status) {
						Helper.createToast(res.error.message, 'danger');
					} else {
						Helper.showAlert('error500');
					}
					$timeout(() => {
						$window.location.href = '/login';
					}, 1000);
				}
				
				// $scope.input = {};
				// $scope.userForm.$setUntouched();
				
				
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