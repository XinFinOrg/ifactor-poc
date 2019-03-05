var SignUpCtrl = angular.module('SignUpCtrl', []).controller('SignUpController',['$scope', '$rootScope',
 '$location', '$timeout', 'GetPost', 'Helper', '$window', function($scope, $rootScope,  
 	$location, $timeout, GetPost, Helper, $window) {

	SignUpCtrl.directive('ngCompare', function () {
		return {
			require: 'ngModel',
			link: function (scope, currentEl, attrs, ctrl) {
				var comparefield = document.getElementsByName(attrs.ngCompare)[0]; //getting first element
				compareEl = angular.element(comparefield);
				
				//current field key up
				currentEl.on('keyup', function () {
					if (compareEl.val() != "") {
						var isMatch = currentEl.val() === compareEl.val();
						ctrl.$setValidity('compare', isMatch);
						scope.$digest();
					}
				});
				
				//Element to compare field key up
				compareEl.on('keyup', function () {
					if (currentEl.val() != "") {
						var isMatch = currentEl.val() === compareEl.val();
						ctrl.$setValidity('compare', isMatch);
						scope.$digest();
					}
				});
			}
		}
	});

	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (res.status) {
			var data = { url : '/logout' };
			GetPost.get(data, function(err, res) {
				$rootScope.isMainLoader = true;
				if(res.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/signup';
				}, 1000);
			});
		}
	});

	Helper.checkForMessage();
	$scope.signup = function() {
		var data  = {input : $scope.input, url : '/signup'};
		GetPost.post(data, function(err, res) {
			if (!err) {
				$rootScope.isMainLoader = true;
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