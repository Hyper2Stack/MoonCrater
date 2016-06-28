'use strict';

(function () {
var repos = [], groups = [], nodes = [], repo_tags = {}, group_nodes = {}, agents = [];

function _last(arr) {
  return arr[arr.length - 1];
}

function _find(arr, key, val) {
  var index;
  if (key) {
    for (index = 0; index < arr.length; index++) {
      if (arr[index][key] === val) return {index: index, obj: arr[index]};
    }
    return {index: -1, obj: null};
  } else {
    index = arr.indexOf(val);
    if (index < 0) return {index: -1, obj: null};
    return {index: index, obj: arr[index]};
  }
}

window.MoonLegend.core.debug.enable(true);
window.MoonLegend.core.debug.fill({
  _mockDone: true,
  _mock: function (config) {
    var method = config.method.toLowerCase(),
        uri = config.url.split('/').slice(3),
        data = config.data,
        obj = null;
    if (typeof(data) === 'string') data = JSON.parse(data);
    if (uri[0] === 'ping') return 'pong';
    if (uri[0] === 'login') return {key: 'test_hahs_key'};
    if (uri[0] === 'signup') {
      console.log(config.method, config.url, data);
      return null;
    }
    if (uri[0] === 'user') {
      if (uri.length === 1) return {
        id: 1,
        name: 'mock',
        display_name: 'MockDebug',
        key: 'key_hash',
        email: 'none@moonlegend.cn',
        create_ts: 0
      };
      if (uri[1] === 'reset-password' || uri[1] === 'reset-key') {
        console.log(config.method, config.url, data);
        return null;
      }
      if (uri[1] === 'repos') {
        switch (uri.length) {
        case 2:
          if (method === 'get') return repos;
          if (method === 'post') {
            console.log(config.method, config.url, data);
            repos.push({
              is_public: data.is_public,
              description: data.description,
              readme: data.readme,
              name: data.name,
              id: _last(repos)?_last(repos).id:0
            });
            repo_tags[data.name] = [];
            return null;
          }
          break;
        case 3:
          if (method === 'get') return _find(repos, 'name', uri[2]).obj;
          if (method === 'put') {
            console.log(config.method, config.url, data);
            obj = _find(repos, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.obj.is_public = data.is_public;
            obj.obj.readme = data.readme;
            obj.obj.description = data.description;
            return null;
          }
          if (method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(repos, 'name', uri[2]);
            if (obj.index < 0) return null;
            repos.splice(obj.index, 1);
            delete repo_tags[uri[2]];
            return null;
          }
          break;
        case 4:
          if (method === 'get') return repo_tags[uri[2]];
          if (method === 'post') {
            console.log(config.method, config.url, data);
            repo_tags[uri[2]].push({
              name: data.name, yml: data.yml
            });
            return null;
          }
          break;
        case 5:
          if (method === 'get') {
            obj = _find(repo_tags[uri[2]], 'name', uri[4]);
            if (obj.index < 0) return null;
            return obj.obj;
          }
          if (method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(repo_tags[uri[2]], 'name', uri[4]);
            if (obj.index < 0) return null;
            repo_tags[uri[2]].splice(obj.index, 1);
            return null;
          }
          break;
        } /* switch */
      } /* if repos */ else if (uri[1] === 'repotags') {
        var repotags = [], tags;
        for (var i = repos.length - 1; i >= 0; i--) {
          tags = repo_tags[repos[i].name];
          for (var j = tags.length - 1; j >= 0; j--) {
            repotags.push({
              repo: repos[i].name,
              name: tags[j].name
            });
          }
        }
        return repotags;
      } /* if repotags*/ else if (uri[1] === 'nodes') {
        switch (uri.length) {
        case 2:
          if (method === 'get') return nodes;
          break;
        case 3:
          if (method === 'get') return _find(nodes, 'name', uri[2]).obj;
          if (method === 'put') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.obj.readme = data.readme;
            obj.obj.description = data.description;
            return null;
          }
          if (method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', uri[2]);
            if (obj.index < 0) return null;
            nodes.splice(obj.index, 1);
            return null;
          }
          break;
        case 4:
          if (/*uri[3] === 'tags'*/ method === 'post') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.obj.tags.push(data.name);
            return null;
          }
          break;
        case 5:
          if (/*uri[3] === 'tags'*/ method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.sub = _find(obj.obj.tags, null, uri[4]);
            if (obj.sub.index < 0) return null;
            obj.obj.tags.splice(obj.sub.index, 1);
            return null;
          }
          break;
        case 6:
          if (/*uri[3] === 'nics'*/ method === 'post') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.sub = _find(obj.obj.nics, 'name', uri[4]);
            if (obj.sub.index < 0) return null;
            obj.obj.nics[obj.sub.index].tags.push(data.name);
            return null;
          }
          break;
        case 7:
          if (/*uri[3] === 'nics'*/ method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.sub = _find(obj.obj.nics, 'name', uri[4]);
            if (obj.sub.index < 0) return null;
            obj.subsub = _find(obj.obj.nics[obj.sub.index].tags, null, uri[6]);
            if (obj.subsub.index < 0) return null;
            obj.obj.nics[obj.sub.index].tags.splice(obj.subsub.index, 1);
            return null;
          }
          break;
        } /* switch */
      } /* if nodes */ else if (uri[1] === 'groups') {
        switch (uri.length) {
        case 2:
          if (method === 'get') return groups;
          if (method === 'post') {
            console.log(config.method, config.url, data);
            groups.push({
              description: data.description,
              name: data.name,
              id: _last(repos)?_last(repos).id:0
            });
            group_nodes[data.name] = [];
            return null;
          }
          break;
        case 3:
          if (method === 'get') return _find(groups, 'name', uri[2]).obj;
          if (method === 'put') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            if (obj.index < 0) return null;
            obj.obj.name = data.name;
            obj.obj.description = data.description;
            group_nodes[data.name] = group_nodes[uri[2]];
            delete group_nodes[uri[2]];
            return null;
          }
          if (method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            if (obj.index < 0) return null;
            groups.splice(obj.index, 1);
            return null;
          }
          break;
        case 4:
          if (uri[3] === 'nodes' && method === 'get') return group_nodes[uri[2]] || [];
          if (uri[3] === 'nodes' && method === 'post') {
            console.log(config.method, config.url, data);
            obj = _find(nodes, 'name', data.name);
            group_nodes[uri[2]].push(obj.obj);
            return null;
          }
          if (uri[3] === 'deployment' && method === 'get') {
            obj = _find(groups, 'name', uri[2]);
            return groups[obj.index].deployment;
          }
          if (uri[3] === 'deployment' && method === 'post') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            // data.repo, data.runtime
            return null;
          }
          if (uri[3] === 'deployment' && method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            return null;
          }
          break;
        case 5:
          if (uri[3] === 'nodes' && method === 'delete') {
            console.log(config.method, config.url, data);
            obj = _find(group_nodes[uri[2]], 'name', uri[4]);
            if (obj.index < 0) return null;
            group_nodes[uri[2]].splice(obj.index, 1);
            return null;
          }
          if (uri[3] === 'deployment' && uri[4] === 'prepare' && method === 'put') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            return null;
          }
          if (uri[3] === 'deployment' && uri[4] === 'execute' && method === 'put') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            return null;
          }
          if (uri[3] === 'deployment' && uri[4] === 'process' && method === 'get') {
            console.log(config.method, config.url, data);
            obj = _find(groups, 'name', uri[2]);
            return {};
          }
          break;
        } /* switch */
      } /* if groups */
    } /* if user */  else if (uri[0] === 'repos') {
    } /* if repos */ else if (uri[0] === 'agent') {
    }
  }
});

if (!window.MoonLegend) window.MoonLegend = {};
window.MoonLegend.debug = {
  raw: {
    agents: agents,
    repos: repos,
    repo_tags: repo_tags,
    nodes: nodes,
    groups: groups,
    group_nodes: group_nodes
  }
};

})();



/*
MoonLegend.debug.raw.repos.push({
  name:"hello",
  description:"world",
  readme:"this is a readme\nhello."
});
MoonLegend.debug.raw.repo_tags['hello'] = [{
  name:'latest',
  yml:'-service\n  -test'
}];
MoonLegend.debug.raw.nodes.push({
  name:'ubuntu-14.04',
  description:'test',
  tags:['test', 'test2'],
  nics:[{
    name:'eth0',
    ip4addr:'0.0.0.0',
    tags:['general']
  }]
});
MoonLegend.debug.raw.groups.push({
  name:'nginx',
  description:'nginx test'
});
MoonLegend.debug.raw.group_nodes['nginx'] = [];

MoonLegend.debug.gotoPageRepoList();
MoonLegend.debug.gotoPageHostList();
MoonLegend.debug.gotoPageRepoDetail('hello');
*/
