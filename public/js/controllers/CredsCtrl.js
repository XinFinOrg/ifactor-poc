angular.module('CredsCtrl', []).controller('CredentialsController', ['$scope', '$window', function ($scope,$window) {
    GetPost.get({ url : '/startApp' }, function(err, resp) {
		if (resp.status) {
			$window.location.href = '/creds';
		}
	});
}]);