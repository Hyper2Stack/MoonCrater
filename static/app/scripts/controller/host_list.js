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
    $scope.user = common.user;

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
            putobj = {
              name: one._ui.update.name,
              description: one._ui.update.description
            };
        one.name = putobj.name;
        one.description = putobj.description;

        one._ui.update.processing = true;
        one.customPUT(putobj).then(function () {
          one.id = putobj.name;
          diff = tag_diff(one, one.tags, one._ui.update.tags);
          request_queue("Host tag", diff, 0, 0, function () {
            diff = [];
            one.nics.forEach(function (nic) {
              diff.push(tag_diff(nic, nic.tags, one._ui.update.nics[nic.name].tags));
            });
            update_nic(one.nics, diff, 0);

            function update_nic (nics, diffs, index) {
              if (index >= nics.length) {
                toastr.success('Host updated.');
                one._ui.update.processing = false;
                $state.reload();
                return;
              }
              var nic = nics[index],
                  diff = diffs[index];
              request_queue(
                "Host nic tag of '" + nic.name  + "'",
                diff, 0, 0, function () {
                  update_nic(nics, diffs, index + 1);
                }
              );
            }
          });

          function request_queue(action_name, queue, index, fail_count, postfn) {
            if (index >= queue.length) {
              if (queue.length === 0) {
              } else if (fail_count === queue.length) {
                toastr.error(action_name + ' updating failed.');
              } else if (fail_count > 0) {
                toastr.warning(action_name + ' updating partially failed.');
              } else {
                toastr.success(action_name + ' updated.');
              }
              if (postfn) postfn();
              return;
            }

            var req = queue[index];
            switch(req.op) {
            case 1:
              req.item.post('tags', {name: req.tag}).then(function () {
                request_queue(action_name, queue, index + 1, fail_count, postfn);
              }, function () {
                request_queue(action_name, queue, index + 1, fail_count + 1, postfn);
              });
              break;
            case -1:
              req.item.one('tags', req.tag).remove().then(function () {
                request_queue(action_name, queue, index + 1, fail_count, postfn);
              }, function () {
                request_queue(action_name, queue, index + 1, fail_count + 1, postfn);
              });
              break;
            default:
              request_queue(action_name, queue, index + 1, fail_count, postfn);
            }
          }

        }, function () {
          one._ui.update.processing = false;
          toastr.error('Updating host failed.');
        });
      },
      remove: function (one) {
        one.remove().then(function () {
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

    function tag_diff(item, old_tags, new_tags) {
      var diff = {}, list = [];
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
      for (var tag in diff) {
        list.push({
          op: diff[tag],
          tag: tag,
          item: item
        });
      }
      return list;
    }

    function sync_host(host) {
      var id = host.id;
      if (host._ui) {
        id = host._ui.id;
      }
      if (!host.tags) host.tags = [];
      if (!host.nics) host.nics = [];
      host._ui = {
        id: id,
        editing: false,
        update: {
          processing: false,
          name: host.name,
          description: host.description,
          tags: host.tags,
          nics: {}
        }
      }
      host.nics.forEach(function (nic) {
        host._ui.update.nics[nic.name] = {
          ip4addr: nic.ip4addr,
          tags: nic.tags
        };
      });
      host.id = host.name;
    }
    $scope._debug = {
      sync_host: sync_host
    }
  }
]);
