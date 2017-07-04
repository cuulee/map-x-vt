/* load settings local and global */
var s = require('./settings/settings-local.js');
/* node postgres and node pg pool */
var fs = require('fs');
var pg = require('pg');
var pool = new pg.Pool(s.pg.con);
var crypto = require('crypto');
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

var getDistinct = function(arr){
  var test = {};
  var out = [];
  arr.forEach(function(v){
    if(!test[v]){  
      test[v] = true;
      out.push(v);
    }
  });
  return out ;
};

var toPgColumn = function(arr){
  return  '"'+arr.join('","')+'"' ;
};

var attrToPgCol = function(attribute,attributes){
   if(!attribute || attribute.constructor == Object) attribute = [];
   if(!attributes || attributes.constructor == Object) attributes = []; 
   if(attribute.constructor !== Array ) attribute = [attribute];
   if(attributes.constructor !== Array ) attributes = [attributes];
   var attr = getDistinct(attribute.concat(attributes));
   return toPgColumn(attr);
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
      if( !data.layer || data.layer.constructor === Object ) return next();
      if(data.mask && data.mask.constructor !== Object ){
        sql = templates.mask;
      }else{
        sql = templates.simple;
      }
      data.attributes = attrToPgCol(data.attribute,data.attributes);
      tile.sql = parseTemplate(sql,data);
      tile.view = req.query.view;
      tile.date = req.query.date;
      tile.attributes = data.attributes;
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
    var str = tile.view + "_" + tile.x + "_" + tile.y + "_" + tile.z + "_" + tile.date; 
    cache = crypto
      .createHash('md5')
      .update(str)
      .digest("hex");

    return cache;
  }, s.cache.ttl ); // time to live

  app.server.listen(3030);
