'use strict';

(function (document, window, $) {

// @include jQuery as $

// TODO request with userkey
// TODO verify action code

function verifyActionCode (code) {
  return true;
}

function klassCookie () {
  this.raw = {};
}

klassCookie.prototype = {
  parse: function () {
    this.raw = {};
    if (!document.cookie.length) {
      return this;
    }
    var raw = document.cookie.split('; ');
    for (var i = 0, n = raw.length; i < n; i++) {
      var p = raw[i].indexOf('=');
      this.raw[raw[i].substring(0, p)] = raw[i].substring(p + 1);
    }
    return this;
  },
  store: function () {
    var raw = [];
    for (var key in this.raw) {
      raw.push(key + '=' + this.raw[key]);
    }
    //document.cookie = raw.join('; ');
    return this;
  },
  get: function (key) {
    return this.raw[key];
  },
  set: function (key, value) {
    if (value === undefined && this.raw[key]) {
      delete this.raw[key];
    } else {
      this.raw[key] = value;
      document.cookie = key + '=' + value;
    }
    return this;
  },
  userkey: function (key) {
    if (key) {
      this.parse().set('userkey', key).store();
    } else {
      this.parse().set('userkey').store();
    }
    return this;
  }
};

var mockFlag = false, mockData = null;

function _ajaxMock(config) {
  var scope = {
    mockData: (typeof(config._mock) === 'function'?config._mock(config):config._mock),
    done: function (callback) {
      if (config._mockDone) {
        callback(scope.mockData, config);
      }
      return scope;
    },
    fail: function (callback) {
      if (config._mockFail) {
        callback(scope.mockData, config);
      }
      return scope;
    }
  };
  return scope;
}

function _nop() {}

function _extend(obj, extra) {
  if (!obj) obj = {};
  if (!extra) return obj;
  for (var k in extra) {
    obj[k] = extra[k];
  }
  return obj;
}

function _api(path, method, data, headers, extra) {
  var userkey = new klassCookie().parse().get('userkey');
  var config = {
    url: '/api/v1' + path,
    method: method
    // XXX backend should return value in JSON event DELETE and POST
    //     currently ignore
    //, dataType: 'json'
  };
  var _ajax = mockFlag?_ajaxMock:$.ajax;
  if (headers) {
    config.headers = headers;
  }
  if (!config.headers) {
    config.headers = {};
  }
  config.headers['Authorization'] = userkey;
  if (data) {
    config.contentType = 'application/json';
    config.data = JSON.stringify(data);
  }
  _extend(config, extra);
  if (mockFlag) {
    _extend(config, mockData);
    return _ajax(config);
  }

  var _aobj = _postactions();
  _ajax(config).done(function (data) {
    if (data) data = JSON.parse(data);
    for(var n = _aobj.donefn.length, i = 0; i < n; i++) {
      (_aobj.donefn[i] || _nop)(data);
    }
  }).fail(function () {
    (_aobj.failfn || _nop)();
  });
  return _aobj.feedback;
  //return _ajax(config);
}

function _postactions() {
  var obj = {
    donefn: [],
    failfn: null,
    feedback: {
      done: function (callback) {
        if (callback) obj.donefn.push(callback);
        return obj.feedback;
      },
      fail: function (callback) {
        obj.failfn = callback || _nop;
        return obj.feedback;
      }
    }
  };
  return obj;
}

var api = {
  get: function (path, data, headers, extra) {
    return _api(path, 'GET', data, headers, extra);
  },
  post: function (path, data, headers, extra) {
    return _api(path, 'POST', data, headers, extra);
  },
  put: function (path, data, headers, extra) {
    return _api(path, 'PUT', data, headers, extra);
  },
  delete: function (path, data, headers, extra) {
    return _api(path, 'DELETE', data, headers, extra);
  },
  patch: function (path, data, headers, extra) {
    return _api(path, 'PATCH', data, headers, extra);
  },
  custom: function (path, method, data, headers, extra) {
    return _api(path, method, data, headers, extra);
  }
};

function buildKlassArray(klass, instances) {
  if (!instances) return [];
  var r = [], t;
  for (var i = 0, n = instances.length; i < n; i++) {
    t = new klass();
    t.raw = instances[i];
    r.push(t);
  }
  return r;
}

function klassGroup () {
  this.raw = {
    id: -1,
    name: null,
    description: null,
    owner_id: -1,
    owner_obj: null,
    status: null,
    deployment: null,
    process: null
  };
}

function klassNode () {
  this.raw = {
    id: -1,
    name: null,
    uuid: null,
    description: null,
    status: null,
    owner_id: -1,
    owner_obj: null,
    tags: null,
    nics: null
  };
}

function klassRepo () {
  this.raw = {
    id: -1,
    owner_id: -1,
    owner_obj: null,
    name: null,
    is_public: false,
    description: null,
    readme: null,
    tags: [] // {id, name, yml}
  }
}

function klassUser () {
  this.raw = {
    id: -1,
    name: null,
    displayName: null,
    key: null, // store in cookie
    email: null,
    createTime: null
  }
}

klassUser.prototype = {
  checkLogin: function () {
    if (!document.cookie.length) return false;
    
  },
  signup: function (username, password, email, code) {
    if (!verifyActionCode()) {
      // TODO alert
      return;
    }
    return api.post('/signup', {
      username: username,
      password: password,
      email: email
    });
  },
  _loadUser: function (user) {
    this.raw = {
      _error: false,
      id: user.id,
      name: user.name,
      displayName: user.display_name,
      key: user.key,
      email: user.email,
      createTime: user.create_ts
    };
  },
  _clearUser: function () {
    this.raw = {
      _error: false,
      id: -1,
      name: null,
      displayName: null,
      key: null,
      email: null,
      createTime: null
    };
  },
  login: function (username, password, code) {
    if (!verifyActionCode()) {
      // TODO alert
      return;
    }
    var that = this;
    return api.post('/login', {
      username: username,
      password: password,
    }).done(function (user) {
      // this user.key is not [table]User.Key
      // it is session key
      new klassCookie().userkey(user.key);
    }).fail(function () {
      that.logout();
      thiat.raw._error = true;
    });
  },
  logout: function () {
    this._clearUser();
    new klassCookie().userkey(null);
    return {
      done: function (callback) {
        callback();
      },
      fail: _nop
    };
  },
  profile: function () {
    // TODO check current user
    var that = this;
    return api.get('/user').done(function (user) {
      that._loadUser(user);
    });
  },
  resetPassword: function (password) {
    // TODO check current user
    var that = this;
    return api.post('/user/reset-password', {
      password: password
    }).done(function () {
      that.logout();
    });
  },
  resetKey: function () {
    // TODO check current user
    var that = this;
    return api.post('/user/reset-key').done(function (user) {
      that.logout();
    });
  },

  repoctl: {
    list: function () {
      var that = this;
      return api.get('/user/repos').done(function (repos) {
        that.repos = buildKlassArray(klassRepo, repos);
      }).fail(function () {
        that.repos = null;
      });
    },
    create: function (is_public, name, description, readme) {
      var that = this;
      return api.post('/user/repos', {
        name: name,
        description: description,
        readme: readme,
        is_public: is_public
      });
    },
    one: function (reponame) {
      return api.get('/user/repos/' + reponame);
    },
    searchTags: function (q) {
      return api.get('/user/repotags');
    }
  },
  nodectl: {
    list: function () {
      var that = this;
      return api.get('/user/nodes').done(function (nodes) {
        that.nodes = buildKlassArray(klassNode, nodes);
      }).fail(function () {
        that.nodes = null;
      });
    },
    one: function (nodename) {
      return api.get('/user/nodes/' + nodename);
    }
  },
  groupctl: {
    list: function () {
      var that = this;
      return api.get('/user/groups').done(function (groups) {
        that.groups = buildKlassArray(klassGroup, groups);
      }).fail(function () {
        that.groups = null;
      });
    },
    create: function (name, description) {
      var that = this;
      return api.post('/user/groups', {
        name: name,
        description: description
      });
    },
    one: function (groupname) {
      return api.get('/user/groups/' + groupname);
    }
  }
};

klassRepo.prototype = {
  update: function (is_public, description, readme) {
    var that = this;
    return api.put('/user/repos/' + this.raw.name, {
      is_public: is_public,
      description: description,
      readme: readme
    }).done(function () {
      that.raw.is_public = is_public;
      that.raw.description = description;
      that.raw.readme = readme;
    });
  },
  delete: function () {
    var that = this;
    return api.delete(
      '/user/repos/' + this.raw.name
    ).done(function () {
      that.raw.id = -1;
      that.raw.name = null;
    });
  },
  listTags: function () {
    var that = this;
    return api.get(
      '/user/repos/' + this.raw.name + '/tags'
    ).done(function (tags) {
      that.tags = {};
      for (var i = 0, n = tags.length; i < n; i++) {
        that.tags[tags[i].name] = tags[i].yml;
      }
    });
  },
  oneTag: function (tagname) {
    return api.get(
      '/user/repos/' + this.raw.name + '/tags/' + tagname
    );
  },
  addTag: function (tagname, yml) {
    var that = this;
    return api.post('/user/repos/' + this.raw.name + '/tags', {
      name: tagname,
      yml: yml
    }).done(function () {
      that.tags[tagname] = yml;
    });
  },
  removeTag: function (tagname) {
    var that = this;
    return api.delete(
      '/user/repos/' + this.raw.name + '/tags/' + tagname
    ).done(function () {
      delete that.tags[tagname];
    });
  }
};

klassNode.prototype = {
  update: function (name, description) {
    var that = this;
    return api.put('/user/nodes/' + this.raw.name, {
      name: name,
      description: description
    }).done(function () {
      that.raw.name = name;
      that.raw.description = description;
    });
  },
  delete: function () {
    var that = this;
    return api.delete(
      '/user/nodes/' + this.raw.name
    ).done(function () {
      that.raw.id = -1;
      that.raw.name = null;
    });
  },
  listTags: function () {
    var that = this;
    return api.get(
      '/user/nodes/' + this.raw.name + '/tags'
    ).done(function (tags) {
      that.raw.tags = tags;
    });
  },
  addTag: function (tagname) {
    var that = this;
    return api.post('/user/nodes/' + this.raw.name + '/tags', {
      name: tagname
    }).done(function () {
      var index = that.raw.tags.indexOf(tagname);
      if (index < 0) that.raw.tags.push(tagname);
    });
  },
  removeTag: function (tagname) {
    var that = this;
    return api.delete(
      '/user/nodes/' + this.raw.name + '/tags/' + tagname
    ).done(function () {
      var index = that.raw.tags.indexOf(tagname);
      if (index >= 0) that.raw.tags.splice(index, 1);
    });
  },
  addNicTag: function (nicname, tagname) {
    var that = this;
    return api.post(
      '/user/nodes/' + this.raw.name + '/nics/' + nicname +'/tags', {
      name: tagname
    }).done(function () {
      var index, nics = that.raw.nics;
      for (var i = nics.length - 1; i >= 0; i--) {
        if (nics[i].name === nicname) {
          index = nics[i].tags.indexOf(tagname);
          if (index < 0) nics[i].tags.push(tagname);
          return;
        }
      }
    });
  },
  removeNicTag: function (nicname, tagname) {
    var that = this;
    return api.delete(
      '/user/nodes/' + this.raw.name +
      '/nics/' + nicname + '/tags/' + tagname
    ).done(function () {
      var index, nics = that.raw.nics;
      for (var i = nics.length - 1; i >= 0; i--) {
        if (nics[i].name === nicname) {
          index = nics[i].tags.indexOf(tagname);
          if (index >= 0) nics[i].tags.splice(index, 1);
          return;
        }
      }
    });
  }
};

klassGroup.prototype = {
  update: function (name, description) {
    var that = this;
    return api.put('/user/groups/' + this.raw.name, {
      name: name,
      description: description
    }).done(function () {
      that.raw.name = name;
      that.raw.description = description;
    });
  },
  delete: function () {
    var that = this;
    return api.delete(
      '/user/groups/' + this.raw.name
    ).done(function () {
      that.raw.id = -1;
      that.raw.name = null;
    });
  },
  listNode: function () {
    var that = this;
    return api.get(
      '/user/groups/' + this.raw.name + '/nodes'
    ).done(function (nodes) {
      that.nodes = {};
      var nodes = buildKlassArray(klassNode, nodes);
      for (var i = nodes.length - 1; i >= 0; i--) {
        that.nodes[nodes[i].name] = nodes[i];
      }
    });
  },
  addNode: function (nodename) {
    return api.post(
      '/user/groups/' + this.raw.name + '/nodes', {
      name: nodename
    });
  },
  removeNode: function (nodename) {
    return api.delete(
      '/user/groups/' + this.raw.name + '/nodes/' + nodename
    );
  },
  listDeployment: function () {
    var thxtat = this;
    return api.get(
      '/user/groups/' + this.raw.name + '/deployment'
    ).done(function (deployment) {
      that.raw.deployment = deployment;
    });
  },
  createDeployment: function (reponame, runtime) {
    return api.post(
      '/user/groups/' + this.raw.name + '/deployment', {
      repo: reponame,
      runtime: runtime
    });
  },
  deleteDeployment: function () {
    return api.delete(
      '/user/groups/' + this.raw.name + '/deployment'
    );
  },
  prepareDeployment: function () {
    // TODO check status
    return api.put(
      '/user/groups/' + this.raw.name + '/deployment/prepare'
    );
  },
  deploy: function (reponame, runtime) {
    // TODO check status
    // reponame = username/repo:tag
    return api.put(
      '/user/groups/' + this.raw.name + '/deployment/execute', {
        repo: reponame,
        runtime: runtime
      }
    );
  },
  progress: function () {
    return api.get(
      '/user/groups/' + this.raw.name + '/deployment/process'
    );
  }
};

// exports
var moonlegend = {
  Cookie: klassCookie,
  Group: klassGroup,
  Node: klassNode,
  Repo: klassRepo,
  User: klassUser,
  debug: {
    enable: function (val) {
      mockFlag = val;
    },
    fill: function (data) {
      mockData = data;
    }
  }
};

if (!window.MoonLegend) window.MoonLegend = {};
window.MoonLegend.core = moonlegend;

})(document, window, jQuery);
