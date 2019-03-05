angular.module('CredsCtrl', []).controller('CredentialsController', ['$scope', '$window', function ($scope,$window) {
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
					$window.location.href = '/creds';
				}, 1000);
			});
		}
	});
}]);