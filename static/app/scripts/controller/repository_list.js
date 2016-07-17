app.controller(
  'RepositoryListComponent', [
  '$scope',
  'Restangular',
  'common',
  function ($scope, api, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.list = [];

    api.one('user').getList('repos').then(function (raw_list) {
      $scope.list = raw_list;
    }, function () {
    });
  }
]);

app.controller(
  'RepositoryComponent', [
  '$scope',
  '$stateParams',
  'Restangular',
  'common',
  function ($scope, $stateParams, api, common) {
    $scope.id = $stateParams.id;
  }
]);
