/* load settings local and global */
var s = require('./settings/settings-local.js');
/* crate sql templates */
var dot = require('dot');

/* load tile splash object */
var Tilesplash = require('tilesplash');
/* load pg type
   To get every possible oid of types :
   psql -c "select typname, oid, typarray from pg_type order by oid" */
var types = require('pg').types;
/* middleware to configure requested tiles */
var authControl = require('./src/authControl.js')(s);
/* new tilesplash instance*/
var app = new Tilesplash(s.pg.con);
/* hold layers's queries */
var layers = {};
/* define commone sql template for querying layers */
var sqlIntersect = dot.template(`
    SELECT ST_AsGeoJSON( {{=it.geom}} ) as the_geom_geojson, 
    {{=it.vars}}
    FROM  {{=it.layer}} 
    WHERE ST_Intersects( {{=it.geom}}, !bbox_4326!)
    `);
/* set app log levels */
//app.logLevel("debug");
/* Set pg types parser */
types.setTypeParser(20, function(val) {
  return parseFloat(val);
});
/* define app layers and middleware */
app.layer('tiles', authControl, function(tile, render){

  /* if the middleware "authControl" refuse access, render an error */
  if( ! tile.allow ){
    render.raw(401);
  }

  /* if there is no variables requested return everything  */
  if( tile.vars === undefined ){
    tile.vars="*";
  }else{
    tile.vars= '"' + tile.vars.split(",").join('", "') + '"';
  }
/* store available layers */
  var sql = sqlIntersect({ 
    geom: tile.geom,
    vars: tile.vars,
    layer: tile.lay 
  });
  layers[tile.lay] = sql ;

  /* render layers */

  render( layers );

});

app.cache(function(tile){
  return app.defaultCacheKeyGenerator(tile) + ':' + tile.token; //cache by tile.token
}, 1000 * 60 * 60 * 24 * 30); //ttl 30 days


app.server.listen(3030);
