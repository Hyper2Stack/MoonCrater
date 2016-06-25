var express = require('express'),
    bodyparser = require('body-parser'),
    app = express();

app.use(express.static('static'));
app.use(bodyparser.json());

app.get('/test', function (req, res) {
  res.write('hello world');
  res.send();
});

app.listen(8080, '0.0.0.0', function () {
  console.log('MoonCrater is listenning on 0.0.0.0::8080');
});
