app.service(
  'common',[
  '$http',
  '$location',
  '$state',
  'ipCookie',
  'Restangular',
  'toastr',
  function ($http, $location, $state, ipCookie, api, toastr) {
    var service = {
      user: {
        name: null,
        email: null,
        agentkey: null,
        apikey: null
      },
      check_logged_in: function () {
        var apikey = ipCookie('apikey');
        service.user.apikey = apikey;
        $http.defaults.headers.common['Authorization'] = apikey;
        return apikey;
      },
      redirect_if_not_logged_in: function () {
        var apikey = ipCookie('apikey');
        if (apikey) {
          $http.defaults.headers.common['Authorization'] = apikey;
          service.user_profile();
          service.user.apikey = apikey;
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
        service.user_profile();
        service.user.apikey = apikey;
      },
      logged_out: function () {
        ipCookie.remove('apikey');
        service.user.name = null;
        service.user.email = null;
        service.user.agentkey = null;
        service.user.apikey = null;
        delete $http.defaults.headers.common.Authorization;
      },
      user_profile: function () {
        api.one('user').get().then(function (raw_user) {
          service.user.name = raw_user.name;
          service.user.email = raw_user.email;
          service.user.agentkey = raw_user.key;
        }, function () {
          toastr.error('Loading user profile failed.');
        });
      }
    };
    return service;
  }
]);
