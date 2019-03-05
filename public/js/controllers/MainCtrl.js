angular.module('MainCtrl', []).controller('MainController',['$rootScope',
'$location', function($rootScope, $location) {

	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (resp.status) {
			var data = { url : '/logout' };
			GetPost.get(data, function(err, resp) {
				$rootScope.isMainLoader = true;
				if(resp.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/';
				}, 1000);
			});
		}
	});
	$location.path('/home');
}]);