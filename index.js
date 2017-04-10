/* load settings local and global */
var s = require('./settings/settings-local.js');
/* load tile splash object */
var Tilesplash = require('tilesplash');
var pg = require('pg');

//var app = new Tilesplash(s.pg.con,"redis");
var app = new Tilesplash(s.pg.con,"redis");

var pool = new pg.Pool(s.pg.con); 

//app.logLevel("debug");

/* Middleware : add header, copy query parameters to object tile member  */
var middleWare = function(req, res, tile, next){

  res.header({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Cache-Control': 'max-age=3600'
  });

  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    tile.view = req.query.view;
    
    //sql = 'SELECT mx_decrypt(\'' + req.query.query + '\',\''+ s.pg.con.key+'\') AS query';

    sql = 'SELECT mx_decrypt(' +
      '( SELECT data#>>\'{"source","query"}\'' +
      ' FROM mx_views '+
      ' WHERE id=\'' + tile.view + '\'' +
      ' ORDER BY date_modified DESC ' +
      ' LIMIT 1 )'+
      ' , \'' + s.pg.con.key + '\' ) AS query ';

    client.query(sql, function(err, result) {
      done();
      if(err) return console.error('error running query', err);
      tile.sql = result.rows[0].query;
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
