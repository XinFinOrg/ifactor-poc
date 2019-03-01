angular.module('ProfileCtrl', []).controller('ProfileController', ['$scope', '$rootScope', '$q',
'$http', '$location', '$timeout', 'GetPost', 'Helper', function($scope, $rootScope, $q, 
	$http, $location, $timeout, GetPost, Helper) {

	// $scope.input = {
	// 	firstName : "",
	// 	lastName : "",
	// 	email : "",
	// 	address: "",
	// 	contactNo : ""
	// }

	let dbValues;

	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (!res.status) {
			$rootScope.isMainLoader = true;
			Helper.createToast(res.error.message, 'warning');
			$timeout(() => {
				$location.path('/login');
			}, 1000);
		} else {
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
			$scope.showHeaderOptions = true;
			$scope.showToggle = false;
			$scope.dropdownMenuStyle = {'display':'none'};
			$rootScope.userType = res.data.userType;
			$rootScope.name = res.data.name;
		}
	});

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
				$location.path('/login');
			}, 1000);
		});

	}


}]);