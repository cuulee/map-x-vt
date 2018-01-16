/**
 * Helpers
 */
var pool = require.main.require("./db").pool;
var u = require("./utils.js");
var t = require("../templates");

function validateUserToken(idUser,token,onValidated){

  var sql = u.parseTemplate(
    t.userValidation,
    { 
      idUser: +idUser, 
      token: token 
    }
  );

  pool.connect(function(err, client, done) {
    client.query(sql, function(err, result) {      
      var out = false;
      if( !err && result && result.rows instanceof Array ){
        out = result.rows[0].valid === true;
      }
      onValidated(out);
    });
  });
}


exports.validateUserToken = function(req, res, next){

  var idUser = req.body.idUser;
  var token = req.body.token;

  validateUserToken(idUser,token,function(valid){

    if(valid){
      next();
    }else{
      res.status(401).send("invalid session token : another session is openend for this user or the token is not valid anymore");
    }
  });
};
