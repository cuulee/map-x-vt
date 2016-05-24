//s = require("../vt/settings/settings-local.js")
var pg = require('pg');
var dot = require('dot');

var sqlAllowRequest = dot.template(`
    select exists (
      select ln from
      (
       SELECT un, ug
       FROM   
       ( 
        SELECT data->>'name'::text AS un,
        json_array_elements( data -> 'group')::text::int AS ug
        FROM   tmp_users 
       ) t
       WHERE  t.un::text = '{{=it.user}}'
      ) usr INNER JOIN
      (
       SELECT ln, lg
       FROM   
       (
        SELECT data->>'layer'::text AS ln,
        jsonb_array_elements(data -> 'group')::text::int AS lg 
        FROM tmp_layers 
       ) l
       WHERE l.ln = '{{=it.layer}}'
      ) lay  
ON (
    usr.ug = lay.lg) 
);
`)

var container = function(s){
  var authControl = function(req, res, tile, next){

    /* SET HEADER */

    res.header( {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Cache-Control': 'max-age=3600',
    });

    /* store requested arg in tile for use in main  */
    for(q in req.query){
      tile[q] = req.query[q];
    }
    /* default : refuse access */
    tile.allow = false;

    // get a pg client from the connection pool
    pg.connect(s.pg.con, function(err, client, done) {
      // handle error 
      var handleError = function(err) {
        // all good, continue
        if(!err) return false;
        // return client to con pool
        if(client){
          done(client);
        }
        res.end('An error occurred');
        // stop here, return the message
        return true;
      };

      // stop here ?
      if(handleError(err)) return;

      var sql = sqlAllowRequest({
        user:tile.user,
        layer:tile.lay
      })

      client.query(sql, function(err, result) {
        if(handleError(err)) return ;
        tile.allow = result.rows[0].exists;
        done();
        next();
      });
    });

  };
  return(authControl);
};

module.exports = container ;
