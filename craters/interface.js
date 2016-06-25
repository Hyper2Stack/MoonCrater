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
    search:  bind.host_search,
    refresh: bind.host_detect,
    remove:  bind.host_remove,
    update:  bind.host_update,
    tags:    bind.host_tag_update,
    nics:    bind.host_nic_update
  };
  this.groups = {
    search_group: bind.group_search,
    create_group: bind.group_create,
    remove_group: bind.group_remove,
    update_group: bind.group_update,
    attach_host:  bind.host_attach,
    detach_host:  bind.host_detach
  };
  this.deployments = {
    deploy_bind:    bind.group_repo_bind,
    deploy_prepare: bind.group_repo_prepare,
    deploy_act:     bind.group_repo_deploy,
    deploy_cancel:  bind.group_repo_cancel,
    deploy_clean:   bind.group_repo_clean
  };
  this.users = {
    search:         bind.user_search,
    signup:         bind.user_signup,
    signin:         bind.user_signin,
    reset_password: bind.user_password_reset,
    reset_apikey:   bind.user_apikey_reset
  };
}

function virtual_host (meta) {
  this.name = meta.name;
  this.tags = meta.tags;
  this.nics = meta.nics;
  this.group = null;
}

var definitions = {
  MoonLegendClient: moonlegend_client,
  VirtualHost: virtual_host
  // TODO define user, repo, repotag, host, group
};

module.exports = definitions;
