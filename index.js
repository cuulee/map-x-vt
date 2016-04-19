/* load settings local and global */
var s = require('./settings/settings-local.js')
/* load tile splash object */
var Tilesplash = require('tilesplash');
/* load pg type
   To get every possible oid of types :
   psql -c "select typname, oid, typarray from pg_type order by oid" */
var types = require('pg').types;
/* middleware to configure requested tiles */
var middleware = require('./src/middleware.js');
/* new tilesplash instance*/
var app = new Tilesplash(
    'postgres://'+
    s.pg.user + ':' +
    s.pg.pwd + '@' +
    s.pg.host + ':' +
    s.pg.port + '/' +
    s.pg.db
    );

/* redfine stringify protobuf (should be put in tilesplash index.js)*/
function stringifyProtobuf(layers, tile) {
  var vtile = new mapnik.VectorTile(tile.z, tile.x, tile.y);
  var opt = {
    simplify_distance : 5,
    area_threshold : 10
  };



/* Set pg types parser */
types.setTypeParser(20, function(val) {
  return parseFloat(val)
});

app.layer('tiles', middleware, function(tile, render){

  if( tile.vars == undefined ){
    tile.vars="*"
  }else{
    tile.vars= '"' + tile.vars.split(",").join('", "') + '"'
  }


  if( tile.token != "b" || tile.lay == undefined ){
    console.log(tile.token);
    render.raw(404);
  }else{

    var sql  = 'SELECT ST_AsGeoJSON('+ tile.geom +') as the_geom_geojson, '+
      tile.vars +
      ' FROM '+ tile.lay +
      ' WHERE ST_Intersects(' + tile.geom + ', !bbox_4326!)';
    render({mapx:[sql]});

  }
});

app.cache(function(tile){
  return app.defaultCacheKeyGenerator(tile) + ':' + tile.token; //cache by tile.token
}, 1000 * 60 * 60 * 24 * 30); //ttl 30 days


app.server.listen(3030);
