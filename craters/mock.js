var websocket = require('ws');
    def = require('./interface.js');

function random_string(n) {
  // TODO random string with n length
}

function random_ip() {
  // TODO random ip
}

function moonlegend_client () {
  def.MoonLegendClient.call(this, {
    mock: true,
    repo_search: function () {
    },
    repo_create: function () {
    },
    repo_remove: function () {
    },
    repo_update: function () {
    },
    repo_tag_search: function () {
    },
    repo_tag_create: function () {
    },
    repo_tag_remove: function () {
    },
    repo_tag_update: function () {
    },
    host_search: function () {
    },
    host_detect: function () {
    },
    host_remove: function () {
    },
    host_update: function () {
    },
    host_tag_update: function () {
    },
    host_nic_update: function () {
    },
    group_search: function () {
    },
    group_create: function () {
    },
    group_remove: function () {
    },
    group_update: function () {
    },
    host_attach: function () {
    },
    host_detach: function () {
    },
    group_repo_bind: function () {
    },
    group_repo_prepare: function () {
    },
    group_repo_deploy: function () {
    },
    group_repo_cancel: function () {
    },
    group_repo_clean: function () {
    },
    user_search: function () {
    },
    user_signup: function () {
    },
    user_signin: function () {
    },
    user_password_reset: function () {
    },
    user_apikey_reset: function () {
    }
  });
}

function virtual_host () {
  def.VirtualHost.call(this, {
    name: random_string(12),
    tags: [],
    nics: [[random_ip(), 'eth0']]
  });

  // TODO establish websocket connection
  var ws = new websocket('ws://', {
    protocolVersion: 8,
    headers: {Authorization: ''}
  });
  ws.on('open', function () {
  });
  ws.on('close', function () {
  });
  ws.on('message', function (data, flags) {
  });
}

var mock = {
  MoonLegendClient: moonlegend_client,
  Host: virtual_host
};

module.exports = mock;
