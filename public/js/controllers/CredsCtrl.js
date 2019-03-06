angular.module('CredsCtrl', []).controller('CredentialsController', ['$scope', '$rootScope', '$window', '$timeout',
'GetPost', 'Helper', function ($scope, $rootScope, $window, $timeout, GetPost, Helper) {
    GetPost.get({ url : '/startApp' }, function(err, res) {
		if (res.status) {
			$rootScope.isMainLoader = true;
			$scope.showHeaderOptions = false;
			var data = { url : '/logout' };
			GetPost.get(data, function(err, res) {
				if(res.status){
					Helper.showAlert('logged_out');
				} else {
					Helper.showAlert('error500');
				}
				$timeout(() => {
					$window.location.href = '/creds';
				}, 1000);
			});
		} else {
			$rootScope.isMainLoader = false;
			$scope.showHeaderOptions = true;
		}
	});
}]);