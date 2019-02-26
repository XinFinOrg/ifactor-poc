angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', 
			'$location', 'GetPost', 'Helper', '$window',
			function($scope, $rootScope, $location, GetPost, Helper, $window) {
	
	$rootScope.isLoggedIn = false;
	$rootScope.isMainLoader = false;
	if(!angular.equals($location.search(), {})){
		console.log('inside');
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
				console.log(err,res);
				if(!err){
					Helper.createToast(res.msg, 'success');
				} else {
					Helper.createToast(res.error.msg, 'warning');
				}
				setTimeout(() => {
					$location.url('/login');
				}, 3000);
			});
		} else {
			// Helper.createToast('Trying malicious attack?', 'danger');
			$rootScope.message = 'Invalid link';
			$rootScope.messageType = 'danger';
			$location.url('/login');
		}
	}
	
	// }
	Helper.checkForMessage();
	$scope.showHideClass = 'glyphicon glyphicon-eye-open';
	$scope.login = function() {
		console.log('LoginCtrl > login(): data ff');
		var data = {
			email : $scope.username,
			password : $scope.password,
			url : '/login'
		}
		console.log('LoginCtrl > login(): data = ',data);
		 GetPost.post(data, function(err, docs) {
			console.log('LoginCtrl > login() > login API > docs:',docs, 'err:', err,docs);
			if(!err){
				$rootScope.isLoggedIn = true;
				$rootScope.message = 'You are logged in.';
				$rootScope.messageType = 'success';
				// $rootScope.userType = docs.data.userType;
				$location.path('/dashboard');
			} else {
				Helper.createToast(docs.message.message, 'danger');
			}
			
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

}]);