angular.module('GetPostService', []).factory('GetPost', ['$http', '$rootScope', 'ngToast', function($http, $rootScope, ngToast) {

        /* Post data */
        var post  = function(input, cb) {
            // var url = getUrl(input);
            console.log('getpost');
            console.log(input);
            $rootScope.isMainLoader = true;
            $http.post(input.url, input)
            .then(function(resp) {
                $rootScope.isMainLoader = false;
                console.log('inside getpost post')
                /* Success */
                console.log('resp', resp);
                if (resp.data && resp.data.status) {
                    return cb(0, resp.data);
                }
                return cb(1, resp.data);
            }, function(resp) {
                /* Failure */
                console.log("post: Error received for ");
                console.log(resp.data);
                return cb(1);
            });
        };

        var get = function(input, cb) {
            var url = input.url;
            $rootScope.isMainLoader = true;
            $rootScope.isLoggedIn = false;
            $http.get(url)
            .then(function(resp) {
                $rootScope.isMainLoader = false;
                $rootScope.isLoggedIn = true;
                if (!(resp.data && resp.data.success)) {
                    console.log("get: could not get data to ");
                    return cb(1, resp.data);
                }
                return cb(0, resp.data);
            }, function(resp) {
                /* Failure */
                console.log("get:   Error received for ");

                return cb(1);
            });
        };

        var service = {
            post : post,
            get : get
        };

        return service;

}]);