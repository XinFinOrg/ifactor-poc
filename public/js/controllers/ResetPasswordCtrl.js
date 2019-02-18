angular.module('ResetPasswordCtrl', []).controller('ResetPasswordController',['$scope', '$rootScope',
 '$http', '$location', '$routeParams', 'GetPost', 'Helper',  function($scope, $rootScope,  $routeParams,
 	$http, $location, GetPost, Helper) {

	
		$rootScope.isMainLoader = true;
		GetPost.get({url : (window.location.origin+'/resetPassword'+window.location.search)}, function(err, res) {
			console.log(err,res);
			if(res.status){
				console.log('resetid match');
				$rootScope.isMainLoader = false;
				Helper.createToast('true', 'success');
			} else if(res.error.errorCode  == "ResetIDError") {
				Helper.createToast(res.error.msg, 'warning');
				// $rootScope.message = res.error.msg;
				// $rootScope.messageType = 'warning';
				// $location.path('/login');
				// res.redirect('/login');
			} else {
				Helper.createToast('Some error has occured.', 'danger');
			}
	    });
		$scope.isLoggedIn = false;
		var querystring = window.location.search;
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
	console.log('defined1',params, window.location); 

	$scope.resetPassword = function() {
		var data  = {input : $scope.input, url : '/signup'};
		console.log('data in');
		const url = '/forgotPassword?email=' + $scope.input.email; 
		var data  = {url : url};
		GetPost.get(data, function(err, resp) {
			if(resp.status){
				Helper.createToast('Email has been sent successsfully.', 'success');
			} else if(resp.error.errorCode  == "AccountNotFound") {
				Helper.createToast('Email address not found.', 'warning');
			} else {
				Helper.createToast('Some error has occured.', 'danger');
			}
			return resp;
	    });
	}

	$scope.login = function() {
		window.location.href = "/login";
		// $location.path('/signup');		
	};
 

}]);