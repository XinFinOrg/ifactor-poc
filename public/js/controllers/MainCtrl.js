angular.module('MainCtrl', []).controller('MainController',['$rootScope',
'$location', function($rootScope, $location) {

	GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (resp.status) {
			$window.location.href = '/home';
		}
	});
	$location.path('/home');
}]);