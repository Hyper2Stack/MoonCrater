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
