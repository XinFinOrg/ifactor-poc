angular.module('ProfileCtrl', []).controller('ProfileController', ['$scope', '$rootScope', '$q',
'$http', '$location', 'GetPost', 'Helper', function($scope, $rootScope, $q, 
	$http, $location, GetPost, Helper) {

	GetPost.get({ url : '/startApp' }, function(err, res) {
		console.log('2');
		if (!res.status) {
			$rootScope.isMainLoader = true;
			Helper.showAlert('log_in');
			setTimeout(() => {
				$location.path('/login');
			}, 1000);
		} else {
			console.log(res);
			$rootScope.userType = res.data.userType;
		}
	});

	$scope.showToggle = false;
	$scope.dropdownMenuStyle = {'display':'none'};
	$scope.toggleDropdown = function() {
		$scope.showToggle = !$scope.showToggle;	
		$scope.dropdownMenuStyle = $scope.showToggle ? {'display':'block'} : {'display':'none'};
	}

	$scope.logOut = function () {
		console.log('inside logout');
		var data = { url : '/logout' };
		GetPost.get(data, function(err, resp) {
			if (!resp.status) {	
				console.log('1');
				$location.path('/login');
			} else {
				console.log('2');
				$rootScope.isLoggedIn = false;
				window.location.href = "/login";
		}
	});
	}
	// console.log('1');
	// function asyncLoggedInCheck() {
	// 	var deferred = $q.defer();
	// 	GetPost.get({ url : '/startApp' }, function(err, res) {
	// 		console.log('2');
	// 		if (!res.status) {
	// 			deferred.reject(res);
	// 			// $location.path('/login');
	// 		} else {
	// 			deferred.resolve(res);
	// 			// console.log(res);
	// 			// $rootScope.userType = res.data.userType;
	// 		}
	// 	});
	// 	return deferred.promise;
	// }
	// var promise = asyncLoggedInCheck();
	// promise.then(function(res) {
	// 	console.log('3');
	// 	console.log(res);
	// 	$rootScope.userType = res.data.userType;
		
	//   }, function() {
	// 	$location.path('/login');
	//   }, function(update) {
	// 	alert('Got notification: ' + update);
	//   });

	// GetPost.post({ url : '/getUserDetails'}, function(err, res) {

	// });
	// console.log('3');



}]);