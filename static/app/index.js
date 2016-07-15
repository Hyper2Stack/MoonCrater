var app = angular.module(
  'mooncrater', [
  'ui.router',
  'ipCookie',
  'restangular',
  'toastr',
  'ui.bootstrap'
]);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');
  $stateProvider
  .state('debug', {
    url: '/debug',
    templateUrl: 'views/debug.html',
    controller: 'DebugComponent'
  })
  .state('home', {
    url: '/',
    templateUrl: 'views/debug.html',
    controller: 'DebugComponent'
  })
  .state('e404', {
    url: '/404',
    templateUrl: 'views/404.html',
    controller: function($scope) {
    }
  })
  .state('login', {
    url: '/login?next',
    templateUrl: 'views/401.html',
    controller: 'LoginComponent'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'views/register.html',
    controller: 'RegisterComponent'
  });
}]);

app.config(['RestangularProvider', function ($RestangularProvider) {
  $RestangularProvider.setBaseUrl('/api/v1');
}]);

app.directive('ladda', ['$interval', function ($interval) {
  return {
    restrict: 'A',
    link: function ($scope, $elem, $attr) {
      var monitor = $attr.ladda;
      if (!monitor) return;
      var index = 0,
          states = ['', '.', '..', '...'],
          timer = null,
          span = angular.element('<span>');
      span.addClass('hide');
      $elem.append(span);
      $scope.$watch(monitor, function (val, old_val) {
        if (val && (!!val) !== (!!old_val)) {
          if (timer) $interval.cancel(timer);
          $elem.addClass('disabled');
          span.text(states[index]);
          span.removeClass('hide');
          timer = $interval(function () {
            index ++;
            if (index >= states.length) index = 0;
            $elem.text(states[index]);
          }, 500);
        } else {
          if (timer) $interval.cancel(timer);
          index = 0;
          $elem.removeClass('disabled');
          span.addClass('hide');
        }
      });
    }
  };
}]);

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

app.controller(
  'LoginComponent', [
  '$scope',
  '$location',
  '$state',
  'toastr',
  'Restangular',
  'common',
  function ($scope, $location, $state, toastr, api, common) {
    $scope.login = {
      redirect: $state.params.next || '/',
      processing: false,
      username: '',
      password: '',
      act: function () {
        if (!$scope.login.username) {
          toastr.error('No user name.');
          return false;
        }
        if (!$scope.login.password) {
          toastr.error('Password is empty.');
          return false;
        }
        $scope.login.processing = true;
        api.all('login').post({
          username: $scope.login.username,
          password: $scope.login.password
        }).then(function (user) {
          $scope.login.processing = false;
          common.logged_in(user.key);
          $location.url($scope.login.redirect);
        }, function () {
          $scope.login.processing = false;
          toastr.error('Login failed.');
        });
        return true;
      }
    };

    if (common.check_logged_in()) {
      $location.url($scope.login.redirect);
      return;
    }
  }
]);

app.controller(
  'RegisterComponent', [
  '$scope',
  '$location',
  '$state',
  'toastr',
  'Restangular',
  'common',
  function ($scope, $location, $state, toastr, api, common) {
    $scope.register = {
      processing: false,
      username: '',
      password: '',
      password_confirm: '',
      email: '',
      act: function () {
        if (!$scope.register.username) {
          toastr.error('No user name.');
          return false;
        }
        if (!$scope.register.password) {
          toastr.error('Password is empty.');
          return false;
        }
        if ($scope.register.password_confirm !== $scope.register.password) {
          toastr.error('Confirmed password is different from password.');
          return false;
        }
        if (!$scope.register.email) {
          toastr.error('No email.');
          return false;
        }

        $scope.register.processing = true;
        api.all('signup').post({
          username: $scope.register.username,
          password: $scope.register.password,
          email: $scope.register.email
        }).then(function () {
          $scope.register.processing = false;
          toastr.success('New registered user: "' + $scope.register.username + '".');
          $location.url('/login');
        }, function () {
          $scope.register.processing = false;
          toastr.error('Register failed.');
        });

        return true;
      }
    };
  }
]);

app.controller(
  'DebugComponent', [
  '$scope',
  'common',
  function ($scope, common) {
    var apikey = common.check_logged_in();
    $scope.cookie = {
      apikey: apikey || '',
      login: function () {
        common.logged_in($scope.cookie.apikey);
      },
      logout: function () {
        $scope.cookie.apikey = '';
        common.logged_out();
      }
    };
  }
]);
