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
			console.log('$rootScope.balance', $rootScope.balance);
			if ($rootScope.balance == undefined){
				GetPost.get({ url : '/getBalance' }, function(err, resp) {
					if (resp.status) {
						$rootScope.balance = resp.data.balance;
					}
				});
			}
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


}]);