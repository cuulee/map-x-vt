/* load settings local and global */
var s = require('./settings/settings-local.js');
/* crate sql templates. (there is also a built ) */
var dot = require('dot');
/* load tile splash object */
var Tilesplash = require('tilesplash');
/* load pg type
   To get every possible oid of types :
   psql -c "select typname, oid, typarray from pg_type order by oid" */
var types = require('pg').types;

/* Set pg types parser */
types.setTypeParser(20, function(val) {
  return parseFloat(val);
});

/* new tilesplash instance*/
var app = new Tilesplash(s.pg.con,"redis");

/* define sql template for querying layers */
var sqlIntersect = dot.template(
    //" SELECT ST_AsGeoJSON(ST_SimplifyPreserveTopology({{=it.geom}},(select (2000/(256*2^{{=it.z}})))),10) as the_geom_geojson, " +
    " SELECT ST_AsGeoJSON({{=it.geom}) as the_geom_geojson, " +
    " {{=it.variables}} " +
    " FROM  {{=it.layer}} " +
    " WHERE {{=it.geom}} && !bbox_4326! " +
    " AND ST_Intersects( {{=it.geom}}, !bbox_4326!)" +
    " AND exists (" +
    " select id from mx_users where key='{{=it.key}}' and id={{=it.id}}" +
    ")"
    );

/* set app log levels */
/*app.logLevel("debug");*/

/* Middleware : add header, copy query parameters to object tile member  */
midWar = function(req, res, tile, next){

  res.header( {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Cache-Control': 'max-age=3600',
  });


  /*  // store requested arg in tile for use in main*/
  for(var q in req.query){
    val = req.query[q];
    tile[q] = val;
  }

  next();
};




/* define app layers and middleware */
app.layer('tile', midWar, function(tile, render){

  /* check query parameters for each tile*/
  if( ! tile.t || !tile.v || !tile.l || !tile.u ){
    render.empty();
  }

  /* object to store multiple query. Key = layer name */
  var layers = {};

  /* store available layers */
  var sql = sqlIntersect({ 
    variables: tile.v,
    layer: tile.l,
    geom: "geom",
    key : tile.t,
    id : tile.u,
    z : tile.z
  });

  layers[tile.l] = sql ;

  /* render layers */
  render( layers );

});

app.cache(function(tile){
  return tile.x + ':' + tile.y + ':' + tile.z + ':' + tile.l + ':' + tile.v + ':' + tile.t;
}, 1000 * 60 * 60 * 24 * 30); //ttl 30 days


app.server.listen(3030);
