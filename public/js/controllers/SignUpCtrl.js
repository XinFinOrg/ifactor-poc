var SignUpModule = angular.module('SignUpCtrl', []);

SignUpModule.controller('SignUpController',['$scope', '$rootScope',
 '$location', '$timeout', 'GetPost', 'Helper', '$window', function($scope, $rootScope,  
 	$location, $timeout, GetPost, Helper, $window) {
	
	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (res.status) {
			$rootScope.isMainLoader = true;
			$scope.showHeaderOptions = false;
			var data = { url : '/logout' };
			GetPost.get(data, function(err, res) {
				if(res.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/signup';
				}, 1000);
			});
		} else {
			$rootScope.isMainLoader = false;
			$scope.showHeaderOptions = true;
		}
	});

	Helper.checkForMessage();
	$scope.signup = function() {
		var data  = {input : $scope.input, url : '/signup'};
		GetPost.post(data, function(err, res) {
			if (!err) {
				$rootScope.isMainLoader = true;
				$scope.showHeaderOptions = false;
				Helper.createToast(res.message, 'success');
				$timeout(() => {
					$location.path('/login');
				}, 3000);
			} else if (err && !res.status) {
				Helper.createToast(res.error.message, 'warning');
			} else {
				Helper.showAlert('error500');
			}
			$scope.input = {};
			$scope.userForm.$setUntouched();
	    });
	}

}]);