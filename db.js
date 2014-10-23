var fs = require('fs'),
    pg = require('pg');

var config;
try {
  config = require("./_config");
} catch (ignore){
  config = require('./config');
}

exports.connect = function(callback) {
    pg.connect(config.connection_string, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }

        callback(client, done);
    });
};
