angular.module('SignUpCtrl', []).controller('SignUpController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {


	console.log('signup');
	$scope.signup = function() {
		console.log({input : $scope.input});
		console.log('inside a function');
		$scope.input.url = '/signup';
		GetPost.post({input : $scope.input}, function(err, resp) {
			if (!resp.status) {
				console.log('error')
			} else {
				$location.path('/login');
			}
	    });
		
		/*$http.post('/signup', {input : input}).then(function(response) {
			console.log('signup');
			console.log(response);
		}, function(response) {
			console.log('signup');
			console.log(response);
		});*/
	}

}]);