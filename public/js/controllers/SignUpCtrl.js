angular.module('SignUpCtrl', []).controller('SignUpController', function($scope, $http) {

	$scope.username = 'atul';
	$scope.signup = function() {
		console.log('inside a function');
		var data = {
			username : $scope.username,
			password : $scope.password
		}
		$http.post('/signup', data).then(function(response) {
			console.log('signup');
			console.log(response);
		}, function(response) {
			console.log('signup');
			console.log(response);
		});
	}

	$scope.getUsers = function() {
		console.log('inside getUsers');
		$http.get('/getUsers').then(function(response) {
			$scope.users = response;
		}, function(response) {
			console.log('err', response);
		});		
	}

});