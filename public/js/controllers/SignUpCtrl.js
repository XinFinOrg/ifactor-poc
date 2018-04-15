angular.module('SignUpCtrl', []).controller('SignUpController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

	$scope.signup = function() {
		var data  = {input : $scope.input, url : '/signup'};
		GetPost.post(data, function(err, resp) {
			console.log(err, resp);
			if (!resp.status) {
				console.log('error')
			} else {
				$location.path('/login');
			}
	    });
	}

}]);