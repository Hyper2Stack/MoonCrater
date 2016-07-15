app.service(
  'common',[
  '$http',
  'ipCookie',
  function ($http, ipCookie) {
    var service = {
      check_logged_in: function () {
        var apikey = ipCookie('apikey');
        $http.defaults.headers.common['Authorization'] = apikey;
        return apikey;
      },
      logged_in: function (apikey) {
        ipCookie('apikey', apikey);
        $http.defaults.headers.common['Authorization'] = apikey;
      },
      logged_out: function () {
        ipCookie.remove('apikey');
        delete $http.defaults.headers.common.Authorization;
      }
    };
    return service;
  }
]);
