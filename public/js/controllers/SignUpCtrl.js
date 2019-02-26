var SignUpCtrl = angular.module('SignUpCtrl', []).controller('SignUpController',['$scope', '$rootScope',
 '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$location, GetPost, Helper) {

	$rootScope.isLoggedIn = false;
	Helper.checkForMessage();

	$scope.signup = function() {
		var data  = {input : $scope.input, url : '/signup'};
		GetPost.post(data, function(err, resp) {
			console.log(err, resp);
			if (!resp.status) {
				$rootScope.message = resp.error.msg;
				$rootScope.messageType = 'warning';
				$location.path('/login');
			} else {
				$rootScope.message = 'You have successfully signed up. Please log in.';
				$rootScope.messageType = 'success';
				$location.path('/login');
			}
	    });
	}

}]);

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