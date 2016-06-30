'use strict';

var prototype = $petal.ui.scan($(document.body));

var user = new MoonLegend.core.User();

function _pageGoto(page1, page2) {
  for (var k in prototype.dom) {
    $(prototype.dom[k].self).hide();
  }
  $(prototype.dom[page1].self).show();
  if (page2) $(prototype.dom[page2].self).show();
  $(prototype.dom.home.self).show();
}

// login:
(function () {
  var pLogin = prototype.dom.login;
  $(pLogin.dom.btnLogin).click(function () {
    user.login(
      $(pLogin.dom.txtUsername).val(),
      $(pLogin.dom.txtPassword).val(),
      'code'
    ).done(function (obj) {
      console.log('login', obj.key);
      user.profile().done(function () {
        window.location.reload(true);
      });
    });
  });

  $(pLogin.dom.btnRegister).click(function () {
    _pageGoto('signup');
  });
})();

// signup:
(function () {
  var pSignup = prototype.dom.signup;
  $(pSignup.dom.btnRegister).click(function () {
    var username = $(pSignup.dom.txtUsername).val(),
        password = $(pSignup.dom.txtPassword).val(),
        password2 = $(pSignup.dom.txtPasswordConfirm).val(),
        email = $(pSignup.dom.txtEmail).val();
    if (!username || !password) {
      alert('请输入用户名和密码！');
    }
    if (password !== password2) {
      alert('两次密码不一样，请重新输入。');
      return;
    }
    user.signup(
      username,
      password,
      email,
      'code'
    ).done(function (obj) {
      window.location.reload(true);
    }).fail(function () {
      alert('用户注册失败，请重新尝试。如果多次未成功，请更换用户名后再试。');
    });
  });

  $(pSignup.dom.btnCancel).click(function () {
    $(pSignup.dom.txtUsername).val('');
    $(pSignup.dom.txtPassword).val('');
    $(pSignup.dom.txtPasswordConfirm).val('');
    $(pSignup.dom.txtEmail).val('');
    _pageGoto('login');
  });
})();

user.profile().done(function (u) {

function _text2html(text) {
  return $('<p>').text(text).text().replace(/\n/g, '<br />');
}

function _textlimit(text, limit) {
  if (text.length < limit) return text;
  return text.substring(0, limit) + ' ...';
}

function _listDiff(arr1, arr2) {
  if (arr1.length === 1 && arr1[0] === '') arr1.pop();
  if (arr2.length === 1 && arr2[0] === '') arr2.pop();
  var i = 0, n1 = arr1.length,
      j = 0, n2 = arr2.length;
  var r = {};
  for (i = 0; i < n1; i++) r[arr1[i]] = -1;
  for (j = 0; j < n2; j++) {
    if (arr1.indexOf(arr2[j]) < 0) r[arr2[j]] = 1;
                              else r[arr2[j]] = 0;
  }
  return r;
}

function _find(arr, key, val) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i][key] === val) return arr[i];
  }
  return null;
}

function _inverseElement(elem, list) {
  while (elem.parent().attr('uitag') !== list._root) {
    elem = elem.parent();
  }
  return list[elem.attr('uimark')];
}

function _markElement(elemobj, list) {
  // elemobj.self == elem
  elemobj.self.attr('uimark', list._i);
  list[list._i] = elemobj;
  elemobj._index = list._i;
  list._c ++;
  list._i ++;
}

function _removeElement(elemobj, list) {
  elemobj.self.remove();
  delete list[elemobj._index];
  list._c --;
}

if (!window.MoonLegend) window.MoonLegend = {debug: {}};
if (!window.MoonLegend.debug) window.MoonLegend.debug = {};

// repos
(function () {
  var pRepos = prototype.dom.repoList;

  $(pRepos.dom.list).click(function (e) {
    switch ($(e.target).attr('uitag')) {
    case 'btnEdit':
      window.MoonLegend.debug.gotoPageRepoDetail($(e.target).attr('data'));
      break;
    case 'link':
      window.MoonLegend.debug.gotoPageRepoDetail($(e.target).text());
      break;
    }
  });
  $(pRepos.dom.btnCreate).click(function (e) {
    window.MoonLegend.debug.gotoPageRepoDetail(null);
  });
  pRepos._refresh = function () {
    $(pRepos.dom.init).detach();
    $(pRepos.dom.list).empty();
    $(pRepos.dom.list).append(pRepos.dom.init);
    user.repoctl.list().done(function (repos) {
      if (repos && repos.length) {
        var one, i, n;
        for (i = 0, n = repos.length; i < n; i++) {
          one = $petal.ui.createT(pRepos.template.repo);
          $(one.dom.link).text(repos[i].name);
          $(one.dom.desc).text(repos[i].description);
          $(one.self).find('.btn').attr('data', repos[i].name);
          $(pRepos.dom.list).append(one.self);
        }
        $(pRepos.dom.init).detach();
      } else {
        $(pRepos.dom.initInfo).text('没有应用。');
      }
      _pageGoto('repoList', 'hostList');
    });
  };

pRepos._refresh();

window.MoonLegend.debug.gotoPageRepoList = pRepos._refresh;

})();

// repo detail
(function () {
  var pRepo = prototype.dom.repo,
      pTags = pRepo.dom.tags;
  var repo = new MoonLegend.core.Repo();

  $(pTags.dom.list).click(function (e) {
    var one = _inverseElement($(e.target), pTags.tags);
    if (!one) return;
    var name = $(one.dom.boxEdit.dom.txtName).val(),
        yml = $(one.dom.boxEdit.dom.txtYml).val();
    switch ($(e.target).attr('uitag')) {
    case 'btnOk':
      if (!name) return;
      $(one.dom.name).text(name);
      $(one.dom.yml).text(yml);
      repo.addTag(name, yml).done(function () {
        $(one.self).find('.btn').attr('data', name);
        $(one.self[1]).hide();
        $(one.self[0]).show();
      });
      break;
    case 'btnCancel':
      _removeElement(one, pTags.tags);
      if (!pTags.tags._c) $(pTags.dom.list).append(pTags.dom.init);
      break;
    case 'btnDel':
      repo.removeTag($(e.target).attr('data')).done(function () {
        _removeElement(one, pTags.tags);
        if (!pTags.tags._c) $(pTags.dom.list).append(pTags.dom.init);
      });
      break;
    case 'btnDeploy':
      window.MoonLegend.debug.gotoPageDeploy(null, repo.raw.name + '\n' + $(e.target).attr('data'));
      break;
    }
  });
  $(pTags.dom.btnCreate).click(function (e) {
    var one = $petal.ui.createT(pTags.template.tag);
    $(one.self[0]).hide();
    $(one.dom.boxEdit.dom.txtName).val('');
    $(one.dom.boxEdit.dom.txtYmml).val('');
    $(pTags.dom.init).detach();
    _markElement(one, pTags.tags);
    $(pTags.dom.list).append(one.self);
  });
  $(pRepo.dom.boxDel.dom.btnCancel).click(function (e) {
    $(pRepo.dom.boxDel.self).hide();
    $(pRepo.dom.btnDel).show();
  });
  $(pRepo.dom.boxDel.dom.btnOk).click(function (e) {
    repo.delete().done(function (e) {
      window.MoonLegend.debug.gotoPageRepoList();
    });
  });
  $(pRepo.dom.btnDel).click(function (e) {
    $(pRepo.dom.btnDel).hide();
    $(pRepo.dom.boxDel.self).show();
  });
  $(pRepo.dom.btnEdit).click(function (e) {
    $(pRepo.dom.boxDel.self).hide();
    $(pRepo.dom.boxView).hide();
    $(pRepo.dom.btnDel).show();
    $(pRepo.dom.boxEdit.self).show();
  });
  $(pRepo.dom.boxEdit.dom.btnCancel).click(function (e) {
    if ($(pRepo.dom.boxEdit.dom.txtName).prop('disabled')) {
      $(pRepo.dom.boxEdit.self).hide();
      $(pRepo.dom.boxView).show();
    } else {
      window.MoonLegend.debug.gotoPageRepoList();
    }
  });
  $(pRepo.dom.boxEdit.dom.btnOk).click(function (e) {
    var name = $(pRepo.dom.boxEdit.dom.txtName).val(),
        desc = $(pRepo.dom.boxEdit.dom.txtDesc).val(),
        readme = $(pRepo.dom.boxEdit.dom.txtReadme).val();
    if (!name) return;
    if ($(pRepo.dom.boxEdit.dom.txtName).prop('disabled')) {
      repo.update(true, desc, readme).done(function () {
        pRepo._refresh(name);
      });
    } else {
      user.repoctl.create(true, name, desc, readme).done(function () {
        pRepo._refresh(name);
      });
    }
    window.MoonLegend.debug.gotoPageRepoList(); // XXX remove
  });
  pRepo._refresh = function (repoName) {
    $(pRepo.dom.boxView).hide();
    $(pRepo.dom.tags.self).hide();
    $(pRepo.dom.boxDel.self).hide();
    $(pRepo.dom.boxEdit.self).hide();
    if (repoName === null) {
      $(pRepo.dom.boxEdit.dom.txtReadme).val('');
      $(pRepo.dom.boxEdit.dom.txtDesc).val('');
      $(pRepo.dom.boxEdit.dom.txtName).val('');
      $(pRepo.dom.boxEdit.dom.txtName).prop('disabled', false);
      $(pRepo.dom.boxEdit.self).show();
      $(pTags.dom.initInfo).text('没有版本。');
      _pageGoto('repo');
      return;
    }
    user.repoctl.one(repoName).done(function (data) {
      repo.raw = data;
      $(pRepo.dom.name).text(repo.raw.name);
      $(pRepo.dom.desc).text(repo.raw.description);
      $(pRepo.dom.readme).html(_text2html(repo.raw.readme));
      $(pRepo.dom.boxEdit.dom.txtName).val(repo.raw.name);
      $(pRepo.dom.boxEdit.dom.txtName).prop('disabled', true);
      $(pRepo.dom.boxEdit.dom.txtDesc).val(repo.raw.description);
      $(pRepo.dom.boxEdit.dom.txtReadme).val(repo.raw.readme);
      $(pRepo.self).find('.btn').attr('data', repo.raw.name);
      $(pTags.dom.init).detach();
      $(pTags.dom.list).empty();
      $(pTags.dom.list).append(pTags.dom.init);
      pTags.tags = {_i: 0, _c: 0, _root: 'list'};
      repo.listTags().done(function (tags) {
        if (tags && tags.length) {
          var one, i, n;
          for (i = 0, n = tags.length; i < n; i++) {
            one = $petal.ui.createT(pTags.template.tag);
            $(one.self[1]).hide();
            $(one.dom.name).text(tags[i].name);
            $(one.dom.yml).text(_textlimit(tags[i].yml, 100));
            $(one.dom.boxEdit.dom.txtName).val(tags[i].name);
            $(one.dom.boxEdit.dom.txtYml).val(tags[i].yml);
            $(one.self).find('.btn').attr('data', tags[i].name);
            _markElement(one, pTags.tags);
            $(pTags.dom.list).append(one.self);
          }
          $(pTags.dom.init).detach();
        } else {
          $(pTags.dom.initInfo).text('没有版本。');
        }
      }); // repo.listTags
      $(pRepo.dom.boxView).show();
      $(pRepo.dom.tags.self).show();
      _pageGoto('repo');
    });
  };

window.MoonLegend.debug.gotoPageRepoDetail = pRepo._refresh;

})();

// machine hosts
(function () {
  var pHosts = prototype.dom.hostList,
      pGroups = pHosts.dom.groups,
      pNodes = pHosts.dom.nodes;

  var mNodes = {}, mGroups = {};

  $(pNodes.dom.btnHelp).click(function (e) {
    alert('Api Key: ' + user.key);
  });
  var debugAddNode = $('<a class="btn btn-default">虚拟机器</a>'); // XXX remove
  $(pNodes.dom.btnHelp).parent().append(debugAddNode); // XXX remove
  $(debugAddNode).click(function (e) {
    function _randomString(n) {
      var str = '';
      while (n--) str += String.fromCharCode(Math.floor(Math.random() * 90) + 32);
      return str;
    }

    window.MoonLegend.debug.raw.nodes.push({
      name: _randomString(12),
      description: _randomString(32),
      tags: [],
      nics: [{
        name: 'eth0',
        ip4addr: '192.168.1.' + Math.floor(Math.random() * 255),
        tags: []
      }]
    });
    pHosts._refresh();
  }); // XXX remove

  function _node2group(nodeobj, groupobj) {
    var node = mNodes[$(nodeobj.dom.boxEdit.dom.txtName).val()],
        group = mGroups[$(groupobj.dom.boxEdit.dom.txtName).val()];
    group.addNode(node.raw.name).done(function () {
      node.belong = [group.raw.name];
      $(nodeobj.dom.btnDetach).show();
      $(nodeobj.dom.group).text(group.raw.name);
      $(nodeobj.self[0]).prop('draggable', '');
    });
  }

  function _nodeXgroup(nodeobj) {
    var node = mNodes[$(nodeobj.dom.boxEdit.dom.txtName).val()],
        group = mGroups[node.belong[0]];
    group.removeNode(node.raw.name).done(function () {
      node.belong = [];
      $(nodeobj.dom.btnDetach).hide();
      $(nodeobj.dom.group).text('n/a');
      $(nodeobj.self[0]).prop('draggable', 'true');
    });
  }

  function _bindDropEvents(elemobj) {
    $(elemobj.self[0]).on('dragover', function (e) {
      if ($(this).prop('tagName').toLowerCase() !== 'tr') return;
      e.originalEvent.preventDefault();
      $(this).css('border', '2px solid #777');
    });
    $(elemobj.self[0]).on('dragleave', function (e) {
      if ($(this).prop('tagName').toLowerCase() !== 'tr') return;
      e.originalEvent.preventDefault();
      $(this).css('border', '');
    });
    $(elemobj.self[0]).on('drop', function (e) {
      if ($(this).prop('tagName').toLowerCase() !== 'tr') return;
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      var tr = $(e.target);
      while (tr.prop('tagName').toLowerCase() !== 'tr') tr = tr.parent();
      var node = e.originalEvent.dataTransfer.getData('_node_dnd_');
      node = pNodes.nodes[node];
      var group = tr.attr('uimark');
      group = _inverseElement(tr, pGroups.groups);
      _node2group(node, group);
      tr.css('border', '');
    });
  }

  $(pGroups.dom.btnCreate).click(function (e) {
    var one = $petal.ui.createT(pGroups.template.group);
    $(one.self[0]).hide();
    _markElement(one, pGroups.groups);
    $(pGroups.dom.init).detach();
    $(pGroups.dom.list).append(one.self);
  });
  $(pGroups.dom.list).click(function (e) {
    var one = _inverseElement($(e.target), pGroups.groups);
    if (!one) return;
    var name = $(one.dom.boxEdit.dom.txtName).val(),
        desc = $(one.dom.boxEdit.dom.txtDesc).val();
    switch ($(e.target).attr('uitag')) {
    case 'btnOk':
      if (!name) return;
      if ($(e.target).attr('data')) {
        $(one.dom.link).text(name);
        $(one.dom.desc).text(desc);
        mGroups[$(e.target).attr('data')].update(name, desc).done(function () {
          mGroups[name] = mGroups[$(e.target).attr('data')];
          delete mGroups[$(e.target).attr('data')];
          // view update
          $(one.self).find('.btn').attr('data', name);
          $(one.self[1]).hide();
          $(one.self[0]).show();
          window.MoonLegend.debug.gotoPageHostList();
        });
      } else {
        $(one.dom.link).text(name);
        $(one.dom.desc).text(desc);
        user.groupctl.create(name, desc).done(function () {
          // view update
          mGroups[name] = new window.MoonLegend.core.Group();
          mGroups[name].raw = {
            name: name,
            description: desc
          };
          $(one.self).find('.btn').attr('data', name);
          $(one.self[1]).hide();
          $(one.self[0]).show();
          _bindDropEvents(one);
        });
      }
      break;
    case 'btnEdit':
      name = $(e.target).attr('data');
      $(one.dom.boxEdit.dom.txtName).val(name);
      $(one.dom.boxEdit.dom.txtDesc).val(mGroups[name].raw.description);
      $(one.self[0]).hide();
      $(one.self[1]).show();
      break;
    case 'btnCancel':
      if (!$(e.taret).attr('data')) {
        _removeElement(one, pGroups.groups);
        if (!pGroups.groups._c) $(pGroups.dom.list).append(pGroups.dom.init);
        return;
      }
      $(one.self[1]).hide();
      $(one.self[0]).show();
      break;
    case 'btnDel':
      // TODO check if the group is running a repo and release nodes
      mGroups[$(e.target).attr('data')].delete().done(function () {
        _removeElement(one, pGroups.groups);
        if (!pGroups.groups._c) $(pGroups.dom.list).append(pGroups.dom.init);
      });
      break;
    case 'btnDeploy':
      window.MoonLegend.debug.gotoPageDeploy($(e.target).attr('data'), null);
      break;
    }
  });
  $(pNodes.dom.list).click(function (e) {
    var one = _inverseElement($(e.target), pNodes.nodes);
    if (!one) return;
    var name = $(one.dom.boxEdit.dom.txtName).val(),
        desc = $(one.dom.boxEdit.dom.txtDesc).val(),
        tags = $(one.dom.boxEdit.dom.txtTag).val();
    switch ($(e.target).attr('uitag')) {
    case 'btnOk':
      if (!name) return;
      $(one.dom.link).text(name);
      $(one.dom.desc).text(desc);
      mNodes[$(e.target).attr('data')].update(name, desc).done(function () {
        if (name !== $(e.target).attr('data')) {
          mNodes[name] = mNodes[$(e.target).attr('data')];
          delete mNodes[$(e.target).attr('data')];
        }
        // update tags
        var new_tags = tags.split(','),
            old_tags = mNodes[name].raw.tags,
            diff = _listDiff(old_tags, new_tags);
        for (var key in diff) {
          if (diff[key] === -1) mNodes[name].removeTag(key);
          else if (diff[key] === 1) mNodes[name].addTag(key);
        }
        // update nic tags
        var nics = $(one.dom.boxEdit.dom.nicList).find('tr'),
            nicname;
        for (var i = nics.length - 1; i >= 0; i--) {
          nicname = $(nics[i]).find('[uitag=ip]').attr('data-name');
          new_tags = $(nics[i]).find('[uitag=txtNicTag]').val().split(',');
          old_tags = _find(mNodes[name].raw.nics, 'name', nicname);
          if (old_tags) old_tags = old_tags.tags; else old_tags = [];
          diff = _listDiff(old_tags, new_tags);
          for (var key in diff) {
            if (diff[key] === -1) mNodes[name].removeNicTag(nicname, key);
            else if (diff[key] === 1) mNodes[name].addNicTag(nicname, key);
          }
        }
        // view update
        $(one.self).find('.btn').attr('data', name);
        $(one.self[1]).hide();
        $(one.self[0]).show();
      });
      break;
    case 'btnEdit':
      name = $(e.target).attr('data');
      $(one.dom.boxEdit.dom.txtName).val(name);
      $(one.dom.boxEdit.dom.txtDesc).val(mNodes[name].raw.description);
      $(one.dom.boxEdit.dom.txtTag).val(mNodes[name].raw.tags.join(','));
      $(one.self[0]).hide();
      $(one.self[1]).show();
      break;
    case 'btnCancel':
      $(one.self[1]).hide();
      $(one.self[0]).show();
      break;
    case 'btnDel':
      // TODO check if node belong to a group and the group is running a repo
      mNodes[$(e.target).attr('data')].delete().done(function () {
        _removeElement(one, pNodes.nodes);
        if (!pNodes.nodes._c) $(pNodes.dom.list).append(pNodes.dom.init);
      });
      break;
    case 'btnDetach':
      _nodeXgroup(one);
      break;
    }
  });
  pHosts._refresh = function () {
    mGroups = {};
    mNodes = {};
    _loadGroupList().then(_loadNodeList, function () {/*fail*/});
  };

  function _parseGroupStatus(group) {
    // TODO
    return group.status || 'unknown';
  }

  function _parseNodeStatus(node) {
    // TODO
    return 'unknown';
  }

  function _loadGroupList() {
    var donefn = null, failfn = null;
    $(pGroups.dom.init).detach();
    $(pGroups.dom.list).empty();
    $(pGroups.dom.list).append(pGroups.dom.init);
    pGroups.groups = {_i: 0, _c: 0, _root: 'list'};
    user.groupctl.list().done(function (groups) {
      var urgly_reader = 0;
      if (groups.length) {
        var one, i, n;
        for (i = 0, n = groups.length; i < n; i++) {
          one = $petal.ui.createT(pGroups.template.group);
          $(one.self[1]).hide();
          $(one.dom.link).text(groups[i].name);
          $(one.dom.desc).text(groups[i].description);
          $(one.dom.status).text(_parseGroupStatus(groups[i]));
          $(one.dom.boxEdit.dom.txtName).val(groups[i].name);
          $(one.dom.boxEdit.dom.txtDesc).val(groups[i].description);
          $(one.self).find('.btn').attr('data', groups[i].name);
          $(pGroups.dom.list).append(one.self);
          _markElement(one, pGroups.groups);
          urgly_reader ++;
          _bindDropEvents(one);
        }
        $(pGroups.dom.init).detach();
        // load group nodes
        for (i = 0, n = groups.length; i < n; i++) {
          one = new MoonLegend.core.Group();
          one.raw = groups[i];
          mGroups[one.raw.name] = one;
          one.listNode().done(function (nodes) {
            for (var i = nodes.length - 1, node = null; i >= 0; i--) {
              node = new MoonLegend.core.Node();
              node.raw = nodes[i];
              if (mNodes[node.raw.name]) {
                mNodes[node.name].belong.push(one.raw.name);
              } else {
                node.belong = [one.raw.name];
                mNodes[node.raw.name] = node;
              }
            }
            urgly_reader --;
            if (!urgly_reader) {
              setTimeout(function () {if (donefn) donefn();}, 0);
            }
          });
        }
      } else {
        $(pGroups.dom.initInfo).text('没有机器组。');
        setTimeout(function () {if (donefn) donefn();}, 0);
      }
    }).fail(function () {
      if (failfn) failfn();
    });
    return {then: function (doneFn, failFn) {
      donefn = doneFn;
      failfn = failFn;
    }};
  }

  function _loadNodeList() {
    $(pNodes.dom.init).detach();
    $(pNodes.dom.list).empty();
    $(pNodes.dom.list).append(pNodes.dom.init);
    pNodes.nodes = {_i: 0, _c: 0, _root: 'list'};
    user.nodectl.list().done(function (nodes) {
      if (nodes.length) {
        var one, i, n;
        for (i = 0, n = nodes.length; i < n; i++) {
          one = $petal.ui.createT(pNodes.template.node);
          $(one.self[1]).hide();
          $(one.dom.link).text(nodes[i].name);
          $(one.dom.desc).text(nodes[i].description);
          $(one.dom.status).text(_parseNodeStatus(nodes[i]));
          $(pNodes.dom.list).append(one.self);
          if (mNodes[nodes[i].name]) {
            // just treat one-one for group-node mapping
            $(one.dom.btnDetach).show();
            $(one.dom.group).text(mNodes[nodes[i].name].belong[0]);
          } else {
            $(one.dom.btnDetach).hide();
            $(one.dom.group).text('n/a');
            one._tmp = new MoonLegend.core.Node();
            one._tmp.raw = nodes[i];
            mNodes[one._tmp.raw.name] = one._tmp;
            delete one._tmp;
          }
          $(one.dom.boxEdit.dom.txtName).val(nodes[i].name);
          $(one.dom.boxEdit.dom.txtDesc).val(nodes[i].description);
          $(one.dom.boxEdit.dom.txtTag).val(nodes[i].tags.join(','));
          if (nodes[i].nics.length) {
            $(one.dom.boxEdit.dom.nicTag).show();
            var nic;
            for (var j = nodes[i].nics.length - 1; j >= 0; j--) {
              nic = $petal.ui.createT(one.dom.boxEdit.template.nic);
              $(nic.dom.ip).attr('data-name', nodes[i].nics[j].name);
              $(nic.dom.ip).text(nodes[i].nics[j].name + ': ' + nodes[i].nics[j].ip4addr);
              $(nic.dom.txtNicTag).val(nodes[i].nics[j].tags.join(','));
              $(one.dom.boxEdit.dom.nicList).prepend(nic.self);
            }
          } else {
            $(one.dom.boxEdit.dom.nicTag).hide();
          }
          $(one.self).find('.btn').attr('data', nodes[i].name);
          _markElement(one, pNodes.nodes);
          if (one.belong && one.belong.length > 0) {
            $(one.self[0]).prop('draggable', '');
          }
          $(one.self[0]).on('dragstart', function (e) {
            e.originalEvent.dataTransfer.setData('_node_dnd_', $(e.target).attr('uimark'));
          });
        }
        $(pNodes.dom.init).detach();
      } else {
        $(pNodes.dom.initInfo).text('没有机器。');
      }
      _pageGoto('hostList', 'repoList');
    });
  }

pHosts._refresh();

window.MoonLegend.debug.gotoPageHostList = pHosts._refresh;

})();

// deployment
(function () {
  var pDeploy = prototype.dom.deployment,
      pStep1 = pDeploy.dom.boxStep1,
      pStep2 = pDeploy.dom.boxStep2;

  function _loadData(group, repotag) {
    _loadGroups(group, repotag);
  }

  function _loadGroups(group, repotag) {
    if (group) {
      user.groupctl.one(group).done(function (data) {
        var group = new window.MoonLegend.core.Group();
        group.raw = data;
        _loadRepotag([group], repotag);
      });
    } else {
      user.groupctl.list().done(function (data) {
        var groups = [], group;
        for (var i = data.length - 1; i >= 0; i--) {
          group = new window.MoonLegend.core.Group();
          group.raw = data[i];
          groups.push(group);
        }
        _loadRepotag(groups, repotag);
      });
    }
  }

  function _loadRepotag(groups, repotag) {
    // XXX repotag = repo\ntag
    if (repotag) {
      var repo = new window.MoonLegend.core.Repo();
      repotag = repotag.split('\n');
      repo.raw = {name: repotag[0]};
      repo.oneTag(repotag[1]).done(function (data) {
        _makeView(groups, [{
          repo: repotag[0],
          name: data.name
        }]);
      });
    } else {
      user.repoctl.searchTags().done(function (data) {
        _makeView(groups, data);
      });
    }
  }

  function _makeView(groups, repotags) {
    var one;
    $(pStep1.dom.boxSearchGroup.dom.boxResult).empty();
    for (var i = 0, n = groups.length; i < n; i++) {
      one = $petal.ui.createT(pStep1.dom.boxSearchGroup.template.groupInfo);
      $(one.dom.hit).val(groups[i].raw.name);
      $(one.dom.name).text(groups[i].raw.name);
      $(pStep1.dom.boxSearchGroup.dom.boxResult).append(one.self);
    }
    $($(pStep1.dom.boxSearchGroup.dom.boxResult).find('input')[0]).prop('checked', true);
    $(pStep1.dom.boxSearchRepo.dom.boxResult).empty();
    for (var i = 0, n = repotags.length; i < n; i++) {
      one = $petal.ui.createT(pStep1.dom.boxSearchRepo.template.repoInfo);
      $(one.dom.hit).val(user.raw.name + '/' + repotags[i].repo + ':' + repotags[i].name);
      $(one.dom.name).text($(one.dom.hit).val());
      $(pStep1.dom.boxSearchRepo.dom.boxResult).append(one.self);
    }
    $($(pStep1.dom.boxSearchRepo.dom.boxResult).find('input')[0]).prop('checked', true);
    _pageGoto('deployment');
  }

  pDeploy._refresh = function (group, repotag) {
    $(pStep2.self).hide(); // XXX remove
    $(pStep1.self).show(); // XXX remove
    // TODO check deployment status and then decide to go to step 1 or 2
    _loadData(group, repotag);
  };

  function _findChecked(elem) {
    var inputs = $(elem).find('input');
    for (var i = 0, n = inputs.length; i < n; i++) {
      if ($(inputs[i]).prop('checked') === true) return inputs[i];
    }
    return null;
  }

  $(pStep1.dom.btnCreateDeploy).click(function (e) {
    var groupelem = _findChecked(pStep1.dom.boxSearchGroup.dom.boxResult),
        repoelem = _findChecked(pStep1.dom.boxSearchRepo.dom.boxResult);
    if (!groupelem || !repoelem) return;
    $(pStep2.dom.resource).html(_text2html(
      '机器组：' + $(groupelem).val() + '\n应用：' + $(repoelem).val()
    ));
    $(pStep2.dom.result).text('TODO 部署状态在这里显示');
    $(pStep2.dom.btnPrepare).attr('data', $(groupelem).val());
    $(pStep2.dom.btnDeploy).attr('data', $(groupelem).val());
    var group = new window.MoonLegend.core.Group();
    group.raw = {name: $(groupelem).val()};
    group.createDeployment($(repoelem).val(), {
      env: [],
      global_policy: {restart: 'always', port_mapping: 'fixed'},
      service_policy: {},
    }).done(function () {
      $(pStep2.self).show();
      $(pStep1.self).hide();
    });
  });

  $(pStep2.dom.btnPrepare).click(function (e) {
    var group = new window.MoonLegend.core.Group();
    group.raw = {name: $(this).val()};
    group.prepareDeployment().done(function () {
      alert('prepare started.');
    })
  });

  $(pStep2.dom.btnDeploy).click(function (e) {
    var group = new window.MoonLegend.core.Group();
    group.raw = {name: $(this).val()};
    group.deploy().done(function () {
      alert('deploy started.');
    })
  });

window.MoonLegend.debug.gotoPageDeploy = pDeploy._refresh;

})();

}).fail(function () {
  _pageGoto('login');
}); // user login;
