angular.module('QuickbookConnectCtrl', []).controller('QuickbookConnectController',['$scope', '$rootScope', '$http', 
'$location', 'GetPost', 'Helper', '$timeout', '$window',
function($scope, $rootScope, $http, $location, GetPost,Helper, $timeout, $window) {
    
    console.log('a');
    var parameters = "channelmode=1,width=800,height=650";
    parameters += ",left=" + (screen.width - 800) / 2 + ",top=" + (screen.height - 650) / 2;
    $window.open($rootScope.quickbookURL, '', parameters);
}]);