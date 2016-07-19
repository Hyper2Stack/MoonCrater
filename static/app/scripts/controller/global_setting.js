app.controller(
  'GlobalSettingComponent', [
  '$scope',
  '$state',
  'toastr',
  'Restangular',
  'common',
  function ($scope, $state, toastr, api, common) {
    if(common.redirect_if_not_logged_in()) return;
    $scope.user = common.user;
    $scope.apikey = {
      processing: false,
      update: function () {
        $scope.apikey.processing = true;
        api.all('user').one('reset-key').put({}).then(function () {
          $scope.apikey.processing = false;
          toastr.success('New api key is generated');
          $state.reload();
        }, function () {
          $scope.apikey.processing = false;
          toastr.error('Api key update failed.');
        });
      }
    }

    $scope.userpass = {
      processing: false,
      value: '',
      update: function () {
        if (!$scope.userpass.value) {
          toastr.error('Password is empty.');
          return;
        }

        $scope.userpass.processing = true;
        api.all('user').one('reset-password').put({}).then(function () {
          $scope.userpass.processing = false;
          toastr.success('Password is updated');
          common.logged_out();
          common.redirect_if_not_logged_in();
        }, function () {
          $scope.userpass.processing = false;
          toastr.error('Password update failed.');
        });
      }
    }
  }
]);
