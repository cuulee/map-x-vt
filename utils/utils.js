
var path = require("path");

/**
 * Simple template parsing
 */
exports.parseTemplate = function(template, data){
  
  return template
    .replace(/{{([^{}]+)}}/g, 
      function(matched, key) {
        return data[key] ;
      });
};

exports.getDistinct = getDistinct;

exports.readTxt = function(p){
  var fs = require("fs");
  p = path.resolve(p);
  return fs.readFileSync(p,endoding="UTF-8");
};

exports.attrToPgCol = function(attribute,attributes){
  if(!attribute || attribute.constructor == Object) attribute = [];
  if(!attributes || attributes.constructor == Object) attributes = []; 
  if(attribute.constructor !== Array ) attribute = [attribute];
  if(attributes.constructor !== Array ) attributes = [attributes];
  var attr = getDistinct(attribute.concat(attributes));
  return toPgColumn(attr);
};

function toPgColumn(arr){
  // add gid in all request
  arr.push("gid");
  return  '"'+arr.join('","')+'"' ;
}

function getDistinct(arr){
  var test = {};
  var out = [];
  arr.forEach(function(v){
    if(!test[v]){  
      test[v] = true;
      out.push(v);
    }
  });
  return out ;
}

exports.view = require('./getView.js');
exports.uploadImage = require('./uploadImage.js');

