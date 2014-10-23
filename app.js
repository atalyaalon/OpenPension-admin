var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors');
var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var db = require('./db.js');

app.route("/funds")
    .get(function(req, res) {

        db.connect(function(client, done) {
            client.query('SELECT * FROM admin_funds', function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
        });
    });

app.route("/funds_quarters")
    .get(function(req, res) {

        db.connect(function(client, done) {
            client.query('SELECT * FROM admin_funds_quarters', function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
        });
    })
    .post(function(req, res) {
        db.connect(function(client, done) {
            client.query({ text: "INSERT INTO admin_funds_quarters(fund_id, year, quarter, status) VALUES($1, $2, $3, 'missing')",
                           values: [req.body.fund_id, req.body.year, req.body.quarter]}, function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json({'ok': true});
            });
        });
    });

app.route("/funds_quarters/missing")
    .get(function(req, res) {

        db.connect(function(client, done) {
            client.query("SELECT * FROM admin_funds_quarters WHERE status = 'missing'", function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
        });
    });

app.route("/funds_quarters/missing/random")
    .get(function(req, res) {

        db.connect(function(client, done) {
            client.query("SELECT q.id, q.year, q. quarter, f.managing_body_heb, f.name as fund_name FROM admin_funds_quarters as q, admin_funds as f WHERE status = 'missing' and q.fund_id = f.id OFFSET random()*((SELECT COUNT(*) FROM admin_funds_quarters)-1) LIMIT 1", function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows[0]);
            });
        });
    });

app.route("/funds_quarters/:quarter_id")
    .put(function(req, res) {
        console.log(req.params);
        console.log(req.body);
        db.connect(function(client, done) {
            client.query({ text: "UPDATE admin_funds_quarters SET status='await_vaildation', user_name=$1, url=$2 WHERE id = $3 AND status = 'missing'",
                           values: [req.body.name, req.body.url, req.params.quarter_id] }, function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                // Todo: Validate file
                res.json({'ok': true});
            });
        });
    });

var server = app.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
});
