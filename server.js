var express = require('express'),
    bodyparser = require('body-parser'),
    app = express();

app.use(express.static('static'));
app.use(bodyparser.json());

app.get('/test', function (req, res) {
  res.write('hello world');
  res.send();
});

var server_host = process.env.MOON_CRATER_HOST || '0.0.0.0',
    server_port = process.env.MOON_CRATER_PORT || '8080';

app.listen(parseInt(server_port), server_host, function () {
  console.log(
    'MoonCrater is listenning on ' + server_host +'::' + server_port
  );
});
