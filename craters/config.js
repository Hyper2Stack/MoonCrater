var config = {
  server_host: process.env.MOON_CRATER_HOST || '0.0.0.0',
  server_port: process.env.MOON_CRATER_PORT || '8081',
  moonlegend:  process.env.MOON_LEGEND_HOST || 'http://127.0.0.1:8080'
}

module.exports = config;
