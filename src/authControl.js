//s = require("../vt/settings/settings-local.js")
var pg = require('pg');
var dot = require('dot');

var sqlDecryptRequest = dot.template(
    "select mx_decrypt('{{=it.request}}','{{=it.key}}') as req"
    );
/*     var sql = sqlAllowRequest({*/
//user:tile.user,
//layer:tile.lay
/*});*/



var container = function(s){
  var authControl = function(req, res, tile, next){

    var out = {};
    /* SET HEADER */

    res.header( {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Cache-Control': 'max-age=3600',
    });

    /*  // store requested arg in tile for use in main*/
    for(var q in req.query){
      out[q] = req.query[q];
    }
    // default : refuse access 

    out.sql = sqlDecryptRequest({
      request:out.t,
      key:s.pg.key
    });

    // get a pg client from the connection pool
    pg.connect(s.pg.con, function(err, client, done) {
      // handle error 
      var handleError = function(err) {

      //console.log(err);
        // all good, continue
        if(!err) return false;
        // return client to con pool
        if(client){
          done(client);
        }
        console.log(err);
        res.end('An error occurred');
        // stop here, return the message
        return true;
      };

      // stop here ?
      if(handleError(err)) return;

      client.query(out.sql, function(err, result) {
        if(handleError(err)) return ;
        tile.data = JSON.parse(result.rows[0].req);
        done();
        next();
      });
    });
  };
  /*};*/
return(authControl);
};

module.exports = container ;
