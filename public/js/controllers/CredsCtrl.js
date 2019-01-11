angular.module('CredsCtrl', []).controller('CredentialsController', ['$scope', '$window', function ($scope,$window) {
    $scope.redirectToNewTab = function () {
        $window.open('http://ifactor.xinfin.org/docs', '_blank');

    };
}]);