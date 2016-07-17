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
  .state('repo', {
    url: '/repo',
    templateUrl: 'views/repository_list.html',
    controller: 'RepositoryListComponent'
  })
  .state('repo_one', {
    url: '/repo/{name}',
    templateUrl: 'views/repository.html',
    controller: 'RepositoryComponent'
  })
  .state('host', {
    url: '/host',
    templateUrl: 'views/host_list.html',
    controller: 'HostListComponent'
  })
  .state('app', {
    url: '/app',
    templateUrl: 'views/application_list.html',
    controller: 'ApplicationListComponent'
  })
  .state('setting', {
    url: '/setting',
    templateUrl: 'views/global_setting.html',
    controller: 'GlobalSettingComponent'
  })
  .state('debug', {
    url: '/debug',
    templateUrl: 'views/debug.html',
    controller: 'DebugComponent'
  })
  .state('home', {
    url: '/',
    templateUrl: 'views/home.html',
    controller: 'HomeComponent'
  })
  .state('e404', {
    url: '/404',
    templateUrl: 'views/404.html',
    controller: function($scope) {
    }
  })
  .state('about', {
    url: '/about',
    templateUrl: 'views/about.html'
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
