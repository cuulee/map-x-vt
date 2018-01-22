var s = require("./../settings");
var auth = require("./authentification.js");
var multer  = require('multer');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var md5File = require('md5-file');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var pathTemp = s.images.paths.temporary; 
    cb(null, pathTemp);
  },
  filename: function (req, file, cb) {

  var fileHash = crypto
    .createHash('md5')
    .update(Date.now()+"")
    .digest("hex");

    cb(null, fileHash );
  }
});

var upload = multer({ storage: storage }).single('image');


var uploadHandler = function(req,res,next){
  upload(req,res,function(){
    next();
  });
};

var moveFiles = function(req,res,next){

  var userFolder = req.body.idUser;
  var oldPath = req.file.path;
  var imgFolder = s.images.paths.permanent;
  var imgUrl = s.images.paths.url;
  var dir = path.resolve(imgFolder,userFolder);

  md5File(oldPath,function(err,fileHash){
    if (err) throw err;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    var newPath = path.resolve(dir,fileHash);

    var url = path.resolve(imgUrl,userFolder,fileHash);

    copyFile(oldPath, newPath).then(function(){
      req.file.url = url;
      next();
    });
  });

};

module.exports.middleware = [
  uploadHandler,
  auth.validateUserToken,
  moveFiles
];

function copyFile(source, target) {
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  return new Promise(function(resolve, reject) {
    rd.on('error', reject);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  }).catch(function(error) {
    rd.destroy();
    wr.end();
    throw error;
  });
}

