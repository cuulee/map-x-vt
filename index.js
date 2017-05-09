/* load settings local and global */
var s = require('./settings/settings-local.js');
/* node postgres and node pg pool */
var fs = require('fs');
var pg = require('pg');
var pool = new pg.Pool(s.pg.con);

/* load tile splash object */
var Tilesplash = require('tilesplash');
var app = new Tilesplash(s.pg.con,"redis");

//app.logLevel("debug");


var templates = {
  simple : fs.readFileSync("templates/getGeojsonSimple.sql",encoding="UTF-8"),
  mask : fs.readFileSync("templates/getGeojsonMask.sql",encoding="UTF-8"),
  view : fs.readFileSync("templates/getViewData.sql",endoding="UTF-8")
};

var parseTemplate = function(template, data){
  return template
    .replace(/{{([^{}]+)}}/g, 
      function(matched, key) {
        return data[key] ;
      });
};


/* Middleware : add header, copy query parameters to object tile member  */
var middleWare = function(req, res, tile, next){

  res.header({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Cache-Control': 'max-age=3600'
  });

  pool.connect(function(err, client, done) {
    if(err) done(err);
    var data = { idView : req.query.view };
    var sql = parseTemplate(
      templates.view,
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
      if(data.mask){
        sql = templates.mask;
      }else{
        sql = templates.simple;
      }
      tile.sql = parseTemplate(sql,data);
      tile.view = req.query.view;
      next();
    });
  });
};

  /* define app layers and middleware */
  app.layer('tile', middleWare, function(tile, render){
    toRender = {};
    toRender[tile.view] = tile.sql;
    render(toRender);
  });

  app.cache(function(tile){ 
    cache = tile.view + ":" + tile.x + ":" + ":" + tile.y + ":" + tile.z + ":" + tile.sql;
    return cache;
  }, s.cache.ttl ); // time to live

  app.server.listen(3030);
