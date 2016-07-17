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
  '$timeout',
  '$state',
  '$stateParams',
  'Restangular',
  'toastr',
  'common',
  function ($scope, $timeout, $state, $stateParams, api, toastr, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.loaded = false;
    $scope.repository = {
      raw: null,
      name: $stateParams.name,
      tag_list: []
    };
    $scope.tab = {
      active: 0,
      tags: {
        processing: true
      }
    };

    api.one('user').one('repos', $scope.repository.name).get().then(function (raw) {
      $scope.repository.raw = raw;
      $scope.loaded = true;
    }, function () {
      toastr.error('The repository "' + $scope.repository.name + '" loading failed.');
      $timeout(function () {
        $state.go('repo');
      }, 2000);
    });

    api.one('user').all('repos').one($scope.repository.name).getList('tags').then(function (raw_list) {
      $scope.tab.tags.processing = false;
      $scope.repository.tag_list = raw_list;
      $scope.repository.tag_control = [];
      $scope.repository.tag_list.forEach(function (one) {
        one._ui = {
          fold: true
        };
      });
      if (raw_list.length > 0) {
        $scope.repository.tag_list[0]._ui.fold = false;
      }
    }, function () {
      $scope.tab.tags.processing = false;
      toastr.error('Loading tags failed.');
    });
  }
]);
