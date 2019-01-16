var SignUpCtrl = angular.module('SignUpCtrl', []);
SignUpCtrl.controller('SignUpController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper) {

		$scope.isLoggedIn = false;

	$scope.signup = function() {
		var data  = {input : $scope.input, url : '/signup'};
		GetPost.post(data, function(err, resp) {
			console.log(err, resp);
			if (!resp.status) {
				console.log('error')
			} else {
				Helper.showAlert('signup');
				$location.path('/login');
			}
	    });
	}

	$scope.login = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 

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