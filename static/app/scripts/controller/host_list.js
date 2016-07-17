app.controller(
  'HostListComponent', [
  '$scope',
  '$timeout',
  '$state',
  'Restangular',
  'toastr',
  'common',
  function ($scope, $timeout, $state, api, toastr, common) {
    if (common.redirect_if_not_logged_in()) return;
    $scope.apikey = common.check_logged_in();

    $scope.tips = {
      show: false,
      open: function () { $scope.tips.show = true; },
      close: function () { $scope.tips.show = false; }
    };
    $scope.tab = {
      refresh: function () {
        toastr.success('Host list is going to be refreshed.');
        $state.reload();
      },
      update: function (one) {
        var name = one.name,
            desc = one.description,
            tags = one.tags,
            nics = one.nics,
            diff = null,
            count = 0,
            fail_count = 0,
            putobj = {
              name: one._ui.update.name,
              description: one._ui.update.description
            };
        one.name = putobj.name;
        one.description = putobj.description;

        one._ui.update.processing = true;
        one.customPUT(putobj).then(function () {
          diff = tag_diff(one.tags, one._ui.update.tags.split(','));
          for (var key in diff) {
            if (diff[key] > 0) {
              one.post('tags', {name: key}).then(function () {
                check_complete();
              }, function () {
                fail_count ++;
              });
            } else {
              one.one('tags', key).remove().then(function () {
                check_complete();
              }, function () {
                fail_count ++;
              });
            }
            count ++;
          }
          one.nics.forEach(function (nic) {
            diff = tag_diff(
              nic.tags,
              one._ui.update.nics[nic.name].tags.split(',')
            );
            for (var key in diff) {
              if (diff[key] > 0) {
                one.one('nics', nic.name).post('tags', {name: key}).then(function () {
                  check_complete();
                }, function () {
                  fail_count ++;
                });
              } else {
                one.one('nics', nic.name).one('tags', key).remove().then(function () {
                  check_complete();
                }, function () {
                  fail_count ++;
                });
              }
              count ++;
            }
          });

          function check_complete() {
            if (count) count --;
            if (count - fail_count === 0) {
              if (fail_count > 0) {
                toastr.warn('Updating host partially failed.');
              } else {
                toastr.success('Host updated.');
              }
              one._ui.update.processing = false;
              $state.reload();
            }
          }
        }, function () {
          one._ui.update.processing = false;
          toastr.error('Updating host failed.');
        });
      },
      remove: function (one) {
        one.delete().then(function () {
          toastr.success('Host removed.');
          $state.reload();
        }, function () {
          toastr.error('Deleting host failed.');
        });
      },
      close_editing: function (one) {
        one._ui.editing = false;
      },
      open_editing: function (one) {
        one._ui.editing = true;
      }
    }

    $scope.list = [];

    api.one('user').getList('nodes').then(function (raw_list) {
      $scope.list = raw_list;
      $scope.list.forEach(function (one) {
        sync_host(one);
      });
    }, function () {
      toastr.error('Loading host list failed.');
    });

    function tag_diff(old_tags, new_tags) {
      var diff = {};
      old_tags.forEach(function (tag) {
        if (!tag) return;
        diff[tag] = -1;
      });
      new_tags.forEach(function (tag) {
        if (!tag) return;
        if (diff[tag] === -1) {
          delete diff[tag];
        } else {
          diff[tag] = 1;
        }
      });
      return diff;
    }

    function sync_host(host) {
      var id = host.id;
      if (host._ui) {
        id = host._ui.id;
      }
      host._ui = {
        id: id,
        editing: false,
        update: {
          processing: false,
          name: host.name,
          description: host.description,
          tags: host.tags.join(','),
          nics: {}
        }
      }
      host.nics.forEach(function (nic) {
        host._ui.update.nics[nic.name] = {
          ip4addr: nic.ip4addr,
          tags: nic.tags.join(',')
        };
      });
      host.id = host.name;
    }
    $scope._debug = {
      sync_host: sync_host
    }
  }
]);
