var middleware = function(req, res, tile, next){

  res.header( {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Cache-Control': 'max-age=3600',
  });


  for(q in req.query){
    tile[q] = req.query[q]
  }
  next();
};


module.exports = middleware ;
