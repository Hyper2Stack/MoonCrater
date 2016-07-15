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
