
var express = require('express'),
    db      = require('./db.js'),
    auth = require('basic-auth');


var adminCredentials = { user: 'admin',
                         password: 'opsecretadminpassword' };

var noCache = function(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
};

var requireAuth = function(req, res, next){
    var credentials = auth(req);
    if (!credentials || credentials.name !== adminCredentials.user || credentials.pass !== adminCredentials.password) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="example"' });
        res.end();
    } else {
        next();
    }
};

var router = express.Router();

router.route("/funds")
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

var fundsQuartersBasicSelect = "SELECT q.id, q.year, q.quarter, q.url, q.status, f.managing_body_heb, f.id as fund_id, f.name as fund_name, f.url as fund_url FROM admin_funds_quarters as q, admin_funds as f WHERE q.fund_id = f.id ";

router.route("/funds_quarters")
    .get(noCache, function(req, res) {

        db.connect(function(client, done) {
            client.query(fundsQuartersBasicSelect, function(err, result) {
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

router.route("/funds_quarters/missing")
    .get(noCache, function(req, res) {

        db.connect(function(client, done) {
            client.query(fundsQuartersBasicSelect + " AND status = 'missing'", function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
        });
    });


router.route("/funds_quarters/await_vaildation")
    .get(noCache, function(req, res) {

        db.connect(function(client, done) {
            client.query(fundsQuartersBasicSelect + " AND status = 'await_vaildation'", function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
        });
    });

router.route("/funds_quarters/validated")
    .get(noCache, function(req, res) {

        db.connect(function(client, done) {
            client.query(fundsQuartersBasicSelect + " AND status = 'validated'", function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                res.json(result.rows);
            });
        });
    });


var countMissing = function(client, fundId, managing_body_heb, callback) {
    var addConstraints = "";
    if (managing_body_heb !== undefined && managing_body_heb !== "") {
        addConstraints = "AND managing_body_heb = '" + managing_body_heb + "'";
    }
    if (fundId !== undefined && Number(fundId) > 0) {
        addConstraints = "AND fund_id = " + fundId;
    }
    client.query("(SELECT COUNT(*) FROM admin_funds_quarters WHERE status = 'missing'  " + addConstraints + " )", function(err, result) {
        if (result === undefined || result.rows[0].count === 0) {
            if (fundId !== undefined) {
                countMissing(client, undefined, managing_body_heb, callback);
            } else if (managing_body_heb !== undefined) {
                countMissing(client, undefined, undefined, callback);
            } else {
                callback(client, 0);
            }
        } else {
            callback(client, result.rows[0].count, addConstraints);
        }
    });
};

var getMissingQuartersSQL = function(addConstraints, count) {
    return fundsQuartersBasicSelect + " AND status = 'missing'" + addConstraints + " OFFSET random()*(" + (Number(count) - 1) + ") LIMIT 1";
};

router.route("/funds_quarters/missing/random")
    .get(noCache, function(req, res) {
        db.connect(function(client, done) {
            var addConstraints = "";

            if (req.query['managing_body_heb'] !== undefined) {
                addConstraints += "AND managing_body_heb = '" + req.query.managing_body_heb + "' ";
            }
            countMissing(client, req.query.fund_id, req.query.managing_body_heb, function(client, count, addConstraints) {
                if (count <= 0) {
                    res.json({});
                } else {
                    client.query(getMissingQuartersSQL(addConstraints, count), function(err, result) {
                        done();

                        if(err) {
                            return console.error('error running query', err);
                        }

                        console.log("Returning random quarter: " + result.rows[0].id + "(managing_body_heb=" + req.query.managing_body_heb + ", fund_id=" + req.query.fund_id + ")");
                        res.json(result.rows[0]);
                    });
                }
            });
        });
    });

router.route("/funds_quarters/:quarter_id")
    .put(function(req, res) {
        console.log("Getting quarter data: " + req.params.quarter_id);
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

router.route("/admin/funds_quarters/:quarter_id")
    .put(requireAuth, function(req, res) {
        console.log("Updating quarter " + req.params.quarter_id + " with status: " + req.body.status);
        db.connect(function(client, done) {
            client.query({ text: "UPDATE admin_funds_quarters SET status=$1 WHERE id = $2 AND status = 'await_vaildation'",
                           values: [req.body.status, req.params.quarter_id] }, function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                // Todo: Validate file
                res.json({'ok': true});
            });
        });
    });


exports.router = router;
