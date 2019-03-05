angular.module('CredsCtrl', []).controller('CredentialsController', ['$scope', '$window', function ($scope,$window) {
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
					$window.location.href = '/creds';
				}, 1000);
			});
		}
	});
}]);