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
/* new tilesplash instance*/
var app = new Tilesplash(s.pg.con,"redis");

/* hold layers's queries */
var layers = {};

// define commone sql template for querying layers 
var sqlIntersect = dot.template(
    " SELECT ST_AsGeoJSON( {{=it.geom}},3) as the_geom_geojson, " +
    " {{=it.variables}} " +
    " FROM  {{=it.layer}} " +
    " WHERE {{=it.geom}} && !bbox_4326! " +
    "AND ST_Intersects( {{=it.geom}}, !bbox_4326!)" +
    "AND exists (" +
    "select id from mx_users where key='{{=it.key}}' and id={{=it.id}}" +
    ")"
    );


/* set app log levels */
/*app.logLevel("debug");*/

/* Set pg types parser */
types.setTypeParser(20, function(val) {
  return parseFloat(val);
});

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

  /* if the middleware "authControl" refuse access, render an error */
  if( ! tile.t || !tile.v || !tile.l || !tile.u ){
    render.empty();
  }

  /* store available layers */
  var sql = sqlIntersect({ 
    geom: "geom",
    variables: tile.v,
    layer: tile.l,
    key : tile.t,
    id : tile.u
  });

  layers[tile.l] = sql ;

  /* render layers */

  render( layers );

});

app.cache(function(tile){
  return tile.x + ':' + tile.y + ':' + tile.z + ':' + tile.l + ':' + tile.v + ':' + tile.t;
}, 1000 * 60 * 60 * 24 * 30); //ttl 30 days


app.server.listen(3030);
