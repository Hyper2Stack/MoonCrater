function _nop () {}

function moonlegend_client (bind) {
  this.mock = bind.mock || false;
  this.repositories = {
    search_repo: bind.repo_search || _nop,
    create_repo: bind.repo_create || _nop,
    remove_repo: bind.repo_remove || _nop,
    update_repo: bind.repo_update || _nop,
    search_tag:  bind.repo_tag_search || _nop,
    create_tag:  bind.repo_tag_create || _nop,
    remove_tag:  bind.repo_tag_remove || _nop,
    update_tag:  bind.repo_tag_update || _nop
  };
  this.hosts = {
    search:  bind.host_search || _nop,
    refresh: bind.host_detect || _nop,
    remove:  bind.host_remove || _nop,
    update:  bind.host_update || _nop,
    tags:    bind.host_tag_update || _nop,
    nics:    bind.host_nic_update || _nop
  };
  this.groups = {
    search_group: bind.group_search || _nop,
    create_group: bind.group_create || _nop,
    remove_group: bind.group_remove || _nop,
    update_group: bind.group_update || _nop,
    attach_host:  bind.host_attach || _nop,
    detach_host:  bind.host_detach || _nop
  };
  this.deployments = {
    deploy_bind:    bind.group_repo_bind || _nop,
    deploy_prepare: bind.group_repo_prepare || _nop,
    deploy_act:     bind.group_repo_deploy || _nop,
    deploy_cancel:  bind.group_repo_cancel || _nop,
    deploy_clean:   bind.group_repo_clean || _nop
  };
  this.users = {
    search:         bind.user_search || _nop,
    signup:         bind.user_signup || _nop,
    signin:         bind.user_signin || _nop,
    reset_password: bind.user_password_reset || _nop,
    reset_apikey:   bind.user_apikey_reset || _nop
  };
}

function virtual_host (meta) {
  this.name = meta.name;
  this.tags = meta.tags;
  this.nics = meta.nics;
  this.group = null;
}

function model_user (meta) {
  this.username = meta.username;
  this.password = meta.password;
  this.email = meta.email;
  this.key = meta.key;
}

var definitions = {
  MoonLegendClient: moonlegend_client,
  VirtualHost: virtual_host
  // TODO define user, repo, repotag, host, group
};

module.exports = definitions;
