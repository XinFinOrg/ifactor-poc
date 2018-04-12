angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost',  function($scope, $rootScope, $http, $location, GetPost) {

	$scope.tagline = 'To the moon and back!';
	$scope.login = function() {
		console.log('inside a function');
		var data = {
			email : $scope.username,
			password : $scope.password,
			url : '/login'
		}
		// $http.post('/login', data).then(function(response) {
		// 	$location.path('/dashboard');

		// 	console.log("yo");
		// 	console.log('login');
		// 	$scope.message = response;
		// 	console.log(response);
		// }, function(response) {
		// 	console.log("yo22");
		// 	console.log('login');
		// 	console.log(response);
		// 	$location.path('/dashboard');
		// 	$scope.message = response;
		// });

		GetPost.post(data, function(err, docs) {
				console.log(docs);
				$rootScope.userType = docs.data.userType;
				$location.path('/dashboard');
        });
	}
}]);