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
