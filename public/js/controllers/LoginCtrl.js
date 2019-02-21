angular.module('LoginCtrl', []).controller('LoginController',['$scope', '$rootScope', '$http', 
			'$location', 'GetPost', 'ngToast', 'Helper', '$window',
			function($scope, $rootScope, $http, $location, GetPost, ngToast, Helper, $window) {
	
	if($window.location.search){
		$scope.isMainLoader = true;
		let querystring = $window.location.search.substring(1);
		querystring = querystring.split('&');
		let paramKeys = [];
		let paramValues = [];

		for(let x of querystring){
			x = x.split('=');
			paramKeys.push(x[0]);
			paramValues.push(x[1]);
		};
		console.log('paramKeys: ', paramKeys, 'paramValues: ',paramValues);
		if(paramKeys[0] == 'email' && paramKeys[1] == 'verifyId'){
			console.log('paramValues:',paramValues);
			let data = {
				email : paramValues[0],
				verifyId : paramValues[1],
				url : '/verifyAccount'
			}
			GetPost.post(data, function(err, res) {
				console.log(err,res);
				if(!err){
					Helper.createToast(res.msg, 'success');
				} else {
					Helper.createToast(res.error.msg, 'warning');
				}
			});
		} else {
			Helper.createToast('Trying malicious attack?', 'danger');
		}
		setTimeout(() => {
			console.log($rootScope.isMainLoader);
			$rootScope.isMainLoader = true;
			$window.location.href = '/login';
		}, 300000);
	}
	Helper.checkForMessage();
	$scope.showHideClass = 'glyphicon glyphicon-eye-open';
	$scope.login = function() {
		console.log('LoginCtrl > login(): data ff');
		var data = {
			email : $scope.username,
			password : $scope.password,
			url : '/login'
		}
		console.log('LoginCtrl > login(): data = ',data);
		GetPost.post(data, function(err, docs) {
			if(!err){
				$rootScope.message = 'You are logged in.';
				$rootScope.messageType = 'success';
				// Helper.createToast('You are logged in.', 'success');
				console.log('LoginCtrl: login(): docs:',docs, 'err:', err);
				$rootScope.userType = docs.data.userType;
				$location.path('/dashboard');
			} else {
				Helper.createToast('Please check your credentials.', 'danger');
			}
			
        });
	}

	$scope.goToSignup = function() {
		// window.location.href = "/signup";
		$location.path('/signup');		
	};
	$scope.isShowPassword = false;
	// $scope.showHideText = 'SHOW';
	$scope.showHideClass = 'glyphicon glyphicon-eye-open';
	$scope.showHideType = 'password';
	$scope.togglePasswordField = function() {
		$scope.isShowPassword = !$scope.isShowPassword;	
		$scope.showHideType = $scope.isShowPassword ? 'password' : 'text';
		$scope.showHideClass = $scope.isShowPassword ? 'glyphicon glyphicon-eye-open' : 'glyphicon glyphicon-eye-close';
	}

}]);