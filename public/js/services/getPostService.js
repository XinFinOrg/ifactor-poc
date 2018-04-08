angular.module('GetPostService', []).factory('GetPost', ['$http', function($http) {

        /* Post data */
        var post  = function(input, cb) {
            // var url = getUrl(input);

            $http.post(input.url, input)
            .then(function(resp) {
                /* Success */
                if (!(resp.data && resp.data.success)) {
                    return cb(1, resp.data);
                }
                return cb(0, resp.data);
            }, function(resp) {
                /* Failure */
                console.log("post: Error received for ");
                console.log(resp.data);
                return cb(1);
            });
        };

        var get = function(input, cb) {
            var url = input.url;
            $http.get(url)
            .then(function(resp) {
                //console.log('resp : ' + JSON.stringify(resp, null, 4));
                /* Success */
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