angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'ngToast', 'Helper',
			function($scope, $rootScope, $http, $location, GetPost, ngToast, Helper) {

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
			if(!err){
				$rootScope.message = 'You are logged in.';
				$rootScope.messageType = 'success';
				// Helper.createToast('You are logged in.', 'success');
				console.log('LoginCtrl: login(): docs:',docs, 'err:', err);
				$rootScope.userType = docs.data.userType;
				$location.path('/dashboard');
			} else {
				Helper.createToast('Please check your credentials.', 'danger');
			}
			
        });
	}

	$scope.goToSignup = function() {
		// window.location.href = "/signup";
		$location.path('/signup');		
	};
	$scope.isShowPassword = false;
	// $scope.showHideText = 'SHOW';
	$scope.showHideClass = 'glyphicon glyphicon-eye-open';
	$scope.showHideType = 'password';
	$scope.togglePasswordField = function() {
		$scope.isShowPassword = !$scope.isShowPassword;	
		$scope.showHideType = $scope.isShowPassword ? 'password' : 'text';
		$scope.showHideClass = $scope.isShowPassword ? 'glyphicon glyphicon-eye-open' : 'glyphicon glyphicon-eye-close';
	}

}]);