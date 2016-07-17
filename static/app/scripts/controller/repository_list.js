app.controller(
  'RepositoryListComponent', [
  '$scope',
  '$state',
  'Restangular',
  'toastr',
  'common',
  function ($scope, $state, api, toastr, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.repo_new = {
      adding: false,
      processing: false,
      name: '',
      description: '',
      readme: '',
      is_public: true,
      open: function () {
        $scope.repo_new.adding = true;
      },
      close: function () {
        $scope.repo_new.name = '';
        $scope.repo_new.description = '';
        $scope.repo_new.readme = '';
        $scope.repo_new.is_public = true;
        $scope.repo_new.adding = false;
      },
      create: function () {
        if (!$scope.repo_new.name) {
          toastr.error('Repository has no name.');
          return;
        }
        $scope.repo_new.processing = true;
        api.one('user').post('repos', {
          name: $scope.repo_new.name,
          description: $scope.repo_new.description,
          readme: $scope.repo_new.readme,
          is_public: $scope.repo_new.is_public
        }).then(function () {
          $scope.repo_new.processing = false;
          $state.reload();
        }, function () {
          $scope.repo_new.processing = false;
          toastr.error('Creating repository failed.');
        });
      }
    };
    $scope.list = [];

    api.one('user').getList('repos').then(function (raw_list) {
      $scope.list = raw_list;
    }, function () {
      toastr.error('Loading repository list failed.');
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
        processing: true,
        adding: false,
        tag_new: {
          name: '',
          yml: '',
          open: function () {
            $scope.tab.tags.adding = true;
          },
          close: function () {
            $scope.tab.tags.adding = false;
            $scope.tab.tags.tag_new.name = '';
            $scope.tab.tags.tag_new.yml = '';
          },
          processing: false,
          create: function () {
            var name = $scope.tab.tags.tag_new.name,
                yml = $scope.tab.tags.tag_new.yml;
            if (!name && !desc) {
              toastr.error('Tag name or Deployment description is empty.');
              return;
            }
            api.one('user').all('repos').one($scope.repository.name).post('tags', {
              name: name,
              yml: yml
            }).then(function () {
              $scope.tab.tags.tag_new.processing = false;
              $state.reload();
            }, function () {
              $scope.tab.tags.tag_new.processing = false;
              toastr.error('Creating tag failed.');
            });
          },
          clone: function (one) {
            $scope.tab.tags.tag_new.open();
            $scope.tab.tags.tag_new.name = '';
            $scope.tab.tags.tag_new.yml = one.yml;
          }
        }, // tag_new
        remove: function (one) {
          one.remove().then(function () {
            $state.reload();
          }, function () {
            toastr.error('Deleting tag failed.');
          });
        }
      }, // tags
      readme: {
        processing: false,
        editing: false,
        value: '',
        open: function () {
          $scope.tab.readme.value = $scope.repository.raw.readme;
          $scope.tab.readme.editing = true;
        },
        close: function () {
          $scope.tab.readme.value = '';
          $scope.tab.readme.editing = false;
        },
        update: function () {
          var readme = $scope.repository.raw.readme;
          $scope.repository.raw.readme = $scope.tab.readme.value;
          $scope.repository.raw.put($scope.repository.raw.name).then(function () {
            toastr.success('README updated.');
            $scope.tab.readme.close();
          }, function () {
            $scope.repository.raw.readme = readme;
            toastr.error('Updating README failed.');
          });
        }
      }, // readme
      settings: {
        remove: function () {
          $scope.repository.raw.remove().then(function () {
            $state.go('repo');
          }, function () {
            toastr.error('Deleting repository failed.');
          });
        },
        update: {
          name: '',
          description: '',
          processing: false,
          apply: function () {
            var name = $scope.repository.raw.name,
                desc = $scope.repository.raw.description;
            $scope.tab.settings.update.processing = true;
            $scope.repository.raw.name = $scope.tab.settings.update.name;
            $scope.repository.raw.description = $scope.tab.settings.update.description;
            $scope.repository.raw.put().then(function () {
              $scope.tab.settings.update.processing = false;
              $state.go('repo_one', {name: $scope.repository.raw.name});
            }, function () {
              $scope.tab.settings.update.processing = false;
              $scope.repository.raw.name = name;
              $scope.repository.raw.description = desc;
              toastr.error('Updating repository failed.');
            });
          }
        }
      } // settings
    };

    api.one('user').one('repos', $scope.repository.name).get().then(function (raw) {
      $scope.repository.raw = raw;
      $scope.repository.id = raw.id;
      $scope.repository.raw.id = raw.name;
      $scope.tab.settings.update.name = raw.name;
      $scope.tab.settings.update.description = raw.description;
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
          id: one.id,
          fold: true
        };
        one.id = one.name;
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
