angular.module('LoginCtrl', []).controller('LoginController', function($scope, $http) {

	$scope.tagline = 'To the moon and back!';	
	$scope.login = function() {
		console.log('inside a function');
		var data = {
			username : $scope.username,
			password : $scope.password
		}
		$http.post('/login', data).then(function(response) {
			console.log('login');
			$scope.message = response;
			console.log(response);
		}, function(response) {
			console.log('login');
			console.log(response);
			$scope.message = response;
		});
	}
});