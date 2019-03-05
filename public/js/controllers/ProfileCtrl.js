angular.module('ProfileCtrl', []).controller('ProfileController', ['$scope', '$rootScope', '$q',
'$http', '$location', '$timeout', 'GetPost', 'Helper', '$window', function($scope, $rootScope, $q, 
	$http, $location, $timeout, GetPost, Helper, $window) {

	let dbValues;

	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (!res.status) {
			$rootScope.isLoggedIn = false;
			$scope.showHeaderOptions = false;
			$rootScope.isMainLoader = true;
			Helper.createToast(res.error.message, 'warning');
			$timeout(() => {
				$window.location.href = '/login';
			}, 1000);
		} else {
			$rootScope.isLoggedIn = true;
			$rootScope.isMainLoader = false;
			$scope.showHeaderOptions = true;
			$scope.showToggle = false;
			$scope.dropdownMenuStyle = {'display':'none'};
			$rootScope.userType = resp.data.userType;
			$rootScope.name = resp.data.name;

			if ($rootScope.balance == undefined){
				GetPost.get({ url : '/getBalance' }, function(err, resp) {
					if (resp.status) {
						$rootScope.balance = resp.data.balance;
					}
				});
			}
			var data = {
				email : res.data.email,
				url : '/getUserDetails'
			}
			GetPost.post(data, function(err, res) {
				if (res.status) {
					$scope.input = res.data;
					dbValues = angular.copy($scope.input);
				}
			});
		}
	});

	$scope.logOut = function () {
		$scope.showHeaderOptions = false;
		var data = { url : '/logout' };
		GetPost.get(data, function(err, resp) {
			$rootScope.isMainLoader = true;
			if(resp.status){
				Helper.showAlert('logged_out');
			} else {
				Helper.showAlert('error500');
			}
			$timeout(() => {
				$window.location.href = '/login';
			}, 1000);
		});

	}
	
	$scope.toggleDropdown = function() {
		$scope.showToggle = !$scope.showToggle;	
		$scope.dropdownMenuStyle = $scope.showToggle ? {'display':'block'} : {'display':'none'};
	}

	$scope.submitProfileForm = function() {
		if (JSON.stringify($scope.input) !== JSON.stringify(dbValues)){
			var data = {
				email: $scope.input.email,
				firstName : $scope.input.firstName,
				lastName : $scope.input.lastName,
				contactNo: $scope.input.contactNo,
				url : '/editUserDetails'
			}
			GetPost.post(data, function(err, res) {
				if (res.status) {
					Helper.showAlert('details_updated');
				} else {
					Helper.showAlert('error500');
				}
			});
		}
		else {
			Helper.createToast('No changes to update', 'warning');
		}
		
	}

	$scope.submitPasswordForm =function() {
		var data = {
			email: $scope.input.email,
			oldPassword: $scope.input.oldPassword,
			password : $scope.input.password,
			url : '/changePassword'
		}
		GetPost.post(data, function(err, res) {
			if (err){
				Helper.createToast(res.error.message, 'warning');
			} else {
				Helper.createToast(res.message, 'success');
			}
		});
		$scope.input.oldPassword="";
		$scope.input.password="";
		$scope.input.confirmPassword="";
		$scope.passwordForm.$setUntouched();
	}

}]);