/* load settings local and global */
var Tilesplash = require('tilesplash');
var crypto = require('crypto');
var s = require('./settings');
var u = require('./utils');
var app = new Tilesplash(s.pg.con,"redis");

/*app.server.use(function(req, res, next){*/
  //next();
//});

app.server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/* Get view object */
app.server.get('/vt/view/:idViewRow', function(req, res){
  var idViewParts = req.params.idViewRow.split("@");
  var idView = idViewParts[0];
  var idRow = idViewParts[1];
  u.view.get(idView,idRow,res);
});

/* Get view object TODO: old route to remove ) */
app.server.get('/vt/view/:idView/row/:idRow', function(req, res){
  var out = {};
  var idView = req.params.idView;
  var idRow = req.params.idRow;
  u.view.get(idView,idRow,res);
});


app.server.post('/vt/upload/image/', u.uploadImage.middleware, function(req, res, next){
  var data = {
    url :  req.file.url,
    size : [req.body.width,req.body.height]
  };
  res.send(data);
});

/* define app layers and middleware */
app.layer('vt/tile', u.view.getTilesConfig, { simplify_distance: 4 }, function(tile, render){
  var toRender = {};
  toRender[tile.view] = tile.sql;
  render(toRender);
});

/* Set cache key strategy */
app.cache(function(tile){ 
  var str = tile.view + "_" + tile.x + "_" + tile.y + "_" + tile.z + "_" + tile.date; 
  cache = crypto
    .createHash('md5')
    .update(str)
    .digest("hex");

  return cache;
}, s.cache.ttl ); // time to live

app.server.listen(3030);





