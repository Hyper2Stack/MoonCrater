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
