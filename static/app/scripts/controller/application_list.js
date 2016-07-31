app.controller(
  'ApplicationListComponent', [
  '$scope',
  '$state',
  'Restangular',
  'toastr',
  'common',
  function ($scope, $state, api, toastr, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.deploy_new = {
      adding: false,
      processing: false,
      name: '',
      create: function () {
        if (!$scope.deploy_new.name) {
          toastr.error('New application has no name.');
          return;
        }
        $scope.deploy_new.processing = true;
        api.one('user').post('groups', {
          name: $scope.deploy_new.name,
          description: ''
        }).then(function () {
          $scope.deploy_new.processing = false;
          toastr.success('Application created.');
          $state.go('app_one', {name: $scope.deploy_new.name});
        }, function () {
          $scope.deploy_new.processing = false;
          toastr.error('Creating application failed.');
        });
      },
      open: function () {
        $scope.deploy_new.adding = true;
      },
      close: function () {
        $scope.deploy_new.adding = false;
        $scope.deploy_new.name = '';
      }
    };

    $scope.list = [];
    api.one('user').getList('groups').then(function (raw_list) {
      $scope.list = raw_list;
    }, function () {
      toastr.error('Loading application list failed.');
    })
  }
]);

app.controller(
  'ApplicationComponent', [
  '$scope',
  '$timeout',
  '$state',
  '$stateParams',
  'Restangular',
  'toastr',
  'common',
  function ($scope, $timeout, $state, $stateParams, api, toastr, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.tab = {
      active: 0,
      deploy: {
        processing: false,
        raw: null,
        phase: {
          raw: {
            processing: false,
            all: [],
            selected: null,
            load_repotags: function () {
              $scope.tab.deploy.phase.raw.all = [];
              api.one('user').getList('repos').then(function (raw_list) {
                raw_list.forEach(function (repo) {
                  api.one('user').one('repos', repo.name).getList('tags').then(function (raw_list) {
                    raw_list.forEach(function (tag) {
                      $scope.tab.deploy.phase.raw.all.push(
                        common.user.name + '/' + repo.name + ':' + tag.name);
                    }); // prepare select options
                  }); // load repo tags
                }); // prepare tags
              }); // load repos
            }
          },
          pre: {
            processing: false
          },
          ing: {
            processing: false
          },
          post: {
            processing: false
          }
        },
        edit: {
          repo: null /*,
          runtime: {
            env: [],
            global_policy: {
              restart: 'always',
              port_mapping: 'fixed'
            },
            service_policy: {}
          } */
        },
        raw_compile: function () {
          $scope.tab.deploy.edit.repo = $scope.tab.deploy.phase.raw.selected;
          // TODO compile runtime => $scope.tab.deploy.edit.runtime
        },
        init: function () {
          if (!$scope.tab.deploy.phase.raw.selected) {
            toastr.error('No repository is selected to be deployed.');
            return;
          }
          $scope.tab.deploy.raw_compile();
          $scope.tab.deploy.phase.raw.processing = true;
          $scope.item.raw.post('deployment', $scope.tab.deploy.edit).then(function () {
            $state.reload();
          }, function () {
            toastr.error('Initializing the deployment failed.');
            $scope.tab.deploy.phase.raw.processing = false;
          });
        },
        prepare: function () {
          $scope.tab.deploy.phase.pre.processing = true;
          $scope.item.raw.one('deployment').one('prepare').put({}).then(function () {
            $state.reload();
          }, function () {
            toastr.error('Start preparing the deployment failed.');
            $scope.tab.deploy.phase.pre.processing = false;
          });
        },
        apply: function () {
          $scope.tab.deploy.phase.ing.processing = true;
          $scope.item.raw.one('deployment').one('execute').put({}).then(function () {
            $state.reload();
          }, function () {
            toastr.error('Start the deployment failed.');
            $scope.tab.deploy.phase.ing.processing = false;
          });
        },
        clear: function () {
          $scope.tab.deploy.phase.post.processing = true;
          $scope.item.raw.one('deployment').one('clear').put({}).then(function () {
            $state.reload();
          }, function () {
            toastr.error('Clearing the deployment failed.');
            $scope.tab.deploy.phase.post.processing = false;
          });
        }
      },
      hosts: {
        processing: true,
        process: null,
        all: [],
        raw: [],
        update: {
          selected: [],
          editing: false,
          processing: false,
          apply: function () {
            var update = $scope.tab.hosts.update,
                map = {},
                count = 0,
                fail_count = 0;
            update.processing = true;
            $scope.tab.hosts.raw.forEach(function (host) {
              map[host.name] = {
                op: -1,
                obj: host
              }
              count++;
            });
            update.selected.forEach(function (host) {
              if (map[host.name]) {
                delete map[host.name];
                count--;
              } else {
                map[host.name] = {
                  op: 1,
                  obj: host
                };
                count++;
              }
            });
            for (var key in map) {
              if (map[key].op > 0)
                $scope.tab.hosts.attach(map[key].obj, -1, _update);
              else
                $scope.tab.hosts.detach(map[key].obj, -1, _update);
            }
            if (count === 0) {
              update.processing = false;
            }

            function _update (host_name, op) {
              count --;
              if (op === 0) fail_count ++;
              if (count > 0) return;
              update.processing = false;
              $scope.tab.hosts.raw = update.selected.slice();
              toastr.success('Hosts of the application updated');
              $scope.tab.hosts.update.close();
            }

          },
          open: function () {
            $scope.tab.hosts.update.editing = true;
          },
          close: function () {
            $scope.tab.hosts.update.editing = false;
          }
        },
        attach: function (host, index, callback) {
          api.one('user').one(
            'groups', $scope.item.name
          ).post(
            'nodes', {
            name: host.name
          }).then(function () {
            if (callback) {
              callback(host, 1);
            } else {
              $scope.tab.hosts.raw.push(host);
            }
          }, function () {
            toastr.error('Detaching host failed.');
            if (callback) callback(host, 0);
          });
        },
        detach: function (host, index, callback) {
          api.one('user').one(
            'groups', $scope.item.name
          ).one(
            'nodes', host.name
          ).remove().then(function () {
            if (callback) {
              callback(host, -1);
            } else {
              $scope.tab.hosts.raw.splice(index, 1);
              $scope.tab.hosts.update.selected = $scope.tab.hosts.raw.slice();
            }
          }, function () {
            toastr.error('Detaching host failed.');
            if (callback) callback(host, 0);
          });
        }
      },
      settings: {
        remove: function () {
          // XXX clear deployment first ?
          $scope.item.raw.remove().then(function () {
            $state.go('app');
          }, function () {
            toastr.error('Deleting application failed.');
          });
        },
        update: {
          name: null,
          description: null,
          processing: false,
          apply: function () {
            var name = $scope.item.raw.name,
                desc = $scope.item.raw.description;
            $scope.tab.settings.update.processing = true;
            $scope.item.raw.name = $scope.tab.settings.update.name;
            $scope.item.raw.description = $scope.tab.settings.update.description;
            $scope.item.raw.put().then(function () {
              $scope.tab.settings.update.processing =false;
              $state.go('app_one', {name: $scope.item.raw.name});
            }, function () {
              $scope.tab.settings.update.processing =false;
              $scope.item.raw.name = name;
              $scope.item.raw.description = desc;
              toastr.error('Updating application failed.');
            });
          }
        }
      }
    };

    $scope.item = {
      processing: true,
      id: null,
      raw: null,
      name: $stateParams.name,
      state: null,
      get_state: function () {
        switch($scope.item.raw.status) {
        case 'raw':
          $scope.item.state = 'raw'; break;
        case 'created':
        case 'preparing':
        case 'prepared':
        case 'prepare_timeout':
        case 'prepare_error':
          $scope.item.state = 'pre'; break;
        case 'deploying':
        case 'deploy_timeout':
        case 'deploy_error':
          $scope.item.state = 'ing'; break;
        case 'deployed':
        case 'clearing':
          $scope.item.state = 'post'; break;
        default:
          $scope.item.state = null;
        }
      }
    };
    api.one('user').one('groups', $scope.item.name).get().then(function (raw) {
      $scope.item.raw = raw;
      $scope.item.id = raw.id;
      $scope.item.raw.id = raw.name;
      $scope.item.get_state();
      if ($scope.item.state === 'raw') {
        $scope.tab.deploy.phase.raw.load_repotags();
      }
      $scope.tab.settings.update.name = raw.name;
      $scope.tab.settings.update.description = raw.description;
      $scope.tab.deploy.raw = raw.deployment;
      $scope.tab.hosts.process = raw.process;
      $scope.item.processing = false;
    }, function () {
      toastr.error('The application "' + $scope.item.name + '" loading failed.');
      $timeout(function () {
        $state.go('app');
      }, 2000);
    });

    api.one('user').one('groups', $scope.item.name).getList('nodes').then(function (raw_list) {
      $scope.tab.hosts.raw = raw_list;
      $scope.tab.hosts.update.selected = raw_list.slice();
      $scope.tab.hosts.processing = false;
    }, function () {
      toastr.error('Loading hosts of the application failed.');
      $scope.tab.hosts.processing = false;
    });

    api.one('user').getList('nodes').then(function (raw_list) {
      $scope.tab.hosts.update.all = raw_list.slice();
    }, function () {
      toastr.error('Loading hosts of user failed.');
    });
  }
]);
