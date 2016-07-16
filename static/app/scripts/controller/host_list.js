app.controller(
  'HostListComponent', [
  '$scope',
  'common',
  function ($scope, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.apikey = common.check_logged_in();
  }
]);
