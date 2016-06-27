var express = require('express'),
    bodyparser = require('body-parser'),
    config = require(__dirname + '/craters/config.js'),
    app = express();

app.use(express.static('static'));
app.use(bodyparser.json());

app.get('/test', function (req, res) {
  res.write('hello world');
  res.send();
});

var server_host = config.server_host,
    server_port = parseInt(config.server_port);

app.listen(server_port, server_host, function () {
  console.log(
    'MoonCrater is listenning on ' + server_host +'::' + server_port
  );
});
