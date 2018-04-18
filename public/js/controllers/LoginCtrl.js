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

		GetPost.post(data, function(err, docs) {
				console.log(docs);
				$rootScope.userType = docs.data.userType;
				$location.path('/dashboard');
        });
	}
}]);