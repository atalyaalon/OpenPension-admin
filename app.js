var express    = require('express'),
    bodyParser = require('body-parser'),
    cors        = require('cors');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var api = require("./api.js");
app.use("/api", api.router);

var server = app.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
});
