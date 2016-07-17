app.service(
  'common',[
  '$http',
  '$location',
  '$state',
  'ipCookie',
  function ($http, $location, $state, ipCookie) {
    var service = {
      check_logged_in: function () {
        var apikey = ipCookie('apikey');
        $http.defaults.headers.common['Authorization'] = apikey;
        return apikey;
      },
      redirect_if_not_logged_in: function () {
        var apikey = ipCookie('apikey');
        if (apikey) {
          $http.defaults.headers.common['Authorization'] = apikey;
          return false;
        }
        $state.go('login', {
          next: $location.$$url
        });
        return true;
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
