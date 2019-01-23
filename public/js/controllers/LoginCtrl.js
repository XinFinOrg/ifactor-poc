angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost',  function($scope, $rootScope, $http, $location, GetPost) {

	$scope.tagline = 'To the moon and back!';
	$scope.login = function() {
		console.log('LoginCtrl > login(): data ff');
		var data = {
			email : $scope.username,
			password : $scope.password,
			url : '/login'
		}
		console.log('LoginCtrl > login(): data = ',data);
		GetPost.post(data, function(err, docs) {
				console.log(docs);
				$rootScope.userType = docs.data.userType;
				$location.path('/dashboard');
        });
	}

	$scope.goToSignup = function() {
		window.location.href = "/signup";
		// $location.path('/signup');		
	};
	$scope.isShowPassword = false;
	$scope.showHideText = 'SHOW';
	$scope.showHideType = 'password';
	$scope.togglePasswordField = function() {
		$scope.isShowPassword = !$scope.isShowPassword;
		$scope.showHideText = !$scope.isShowPassword ? 'SHOW' : 'HIDE';			
		$scope.showHideType = !$scope.isShowPassword ? 'password' : 'text';
	}

}]);