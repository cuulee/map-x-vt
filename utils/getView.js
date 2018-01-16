/**
* Helpers
*/
var pool = require.main.require("./db").pool;
var u = require("./utils.js");
var t = require("../templates");

exports.get =  function(idView,idRow,res){

  if( idView ){

    var sql = u.parseTemplate(
      t.viewFull,
      { 
        idView: idView, 
        idRow: idRow 
      }
    );

    pool.connect(function(err, client, done) {
      client.query(sql, function(err, result) {      
        if(err){
          out = err;
        } else if (result && result.rows) {
          out = result.rows[0];
        }
        res.send(out);
        done(); 
      });
    });
  }else{
    res.send(out);
    done(); 
  }
};

/**
* Get config values
*/
exports.getTilesConfig = function(req, res, tile, next){

  pool.connect(function(err, client, done) {
    if(err) done(err);
    var data = { idView : req.query.view };
    
    var sql = u.parseTemplate(
      t.viewData,
      data
    );
    client.query(sql, function(err, result) {
      if(err) return done(err);
      done();
      /*
       * Get view data. Keys ;
       * layer
       * variable
       * mask (optional)
       * geom (set after)
       * zoom (set after)
       */
      data =  result.rows[0];
      data.geom = "geom";
      data.zoom = tile.z;
      if( !data.layer || data.layer.constructor === Object ) return next();
      if(data.mask && data.mask.constructor !== Object ){
        sql = t.geojsonMask;
      }else{
        sql = t.geojsonSimple;
      }
      data.attributes = u.attrToPgCol(data.attribute,data.attributes);
      tile.sql = u.parseTemplate(sql,data);
      tile.view = req.query.view;
      tile.date = req.query.date;
      tile.attributes = data.attributes;
      next();
    });
  });
};

