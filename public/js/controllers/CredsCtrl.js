angular.module('CredsCtrl', []).controller('CredentialsController', ['$scope', '$window', function ($scope,$window) {
    $scope.redirectToNewTab = function () {
        $window.open('http://test.infactor.io/docs', '_blank');

    };
}]);