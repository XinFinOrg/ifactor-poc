angular.module('SignUpCtrl', []).controller('SignUpController', function($scope, $http) {

	// $scope.username = 'atul';

	$scope.input = {
		email : '',
		password : '',
		userType : ''
	}

	console.log('signup');
	$scope.signup = function(input) {
		console.log(input);
		console.log('inside a function');
		
		$http.post('/signup', input).then(function(response) {
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