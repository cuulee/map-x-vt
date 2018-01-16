var s = require('../settings');

var pg = require('pg');
exports.pool = new pg.Pool(s.pg.con);
