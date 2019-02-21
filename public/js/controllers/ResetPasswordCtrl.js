angular.module('ResetPasswordCtrl', []).controller('ResetPasswordController',['$scope', '$rootScope',
 '$http', '$location', '$routeParams', 'GetPost', 'Helper', '$window',  function($scope, $rootScope,  $routeParams,
 	$http, $location, GetPost, Helper, $window) {

	
		// $rootScope.isMainLoader = true;
		// window.alert('asasas');
		// console.log('$window', $location);
		// GetPost.get({url : ($window.location.origin + '/resetPassword' + $window.location.search)}, function(err, res) {
		// 	console.log(err,res);
		// 	if(res.status){
		// 		console.log('resetid match');
		// 		Helper.createToast('true', 'success');
		// 	} else if(res.error.errorCode  == "ResetIDError") {
		// 		Helper.createToast(res.error.msg, 'warning');
		// 		setTimeout(() =>{
		// 			$window.location.href = '/login';
		// 		}, 2000)
		// 		console.log('$window',window);
		// 		$rootScope.message = res.error.msg;
		// 		$rootScope.messageType = 'warning';
		// 	} else {
		// 		Helper.createToast('Some error has occured.', 'danger');
		// 	}
	  //   });
		$scope.isLoggedIn = false;
		var querystring = $window.location.search;
		querystring = querystring.split('&');
		var params = [];
		for(x of querystring){
			x = x.split('=');
				params.push(x[1]);
		};
	// console.log('defined',$location.search().resetId); 
// 	if ( $location.search('email')) {
// 		myvalue = $location.search()['email'];
// 		// 'myvalue' now stores '33'
//  }
	console.log('defined1',params); 

	$scope.resetPassword = function() {
		var data  = {
			'newPassword': $scope.input.password,
			'email': params[0],
			'resetId': params[1],
			'url' : '/resetPassword'
		};
		// console.log('data in');
		GetPost.post(data, function(err, res) {
			if(res.status){
				Helper.createToast('Password has been changed successsfully.', 'success');
			} else if(res.error.errorCode  == "ResetIDError") {
				Helper.createToast(res.error.msg, 'warning');
			} else {
				Helper.createToast('Some error has occured.', 'danger');
			}
			});
			setTimeout(() =>{
				$window.location.href = '/login';
			}, 2000)
	}

	$scope.login = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 

}]);