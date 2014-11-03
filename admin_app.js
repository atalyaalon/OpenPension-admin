var express    = require('express'),
    bodyParser = require('body-parser');

var app = express();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var api = require("./api.js");
app.use("/api", api.router);

var server = app.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
});
