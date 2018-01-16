var u = require("./../utils/utils.js");
exports.geojsonSimple = u.readTxt("./templates/sql/getGeojsonSimple.sql");
exports.geojsonMask = u.readTxt("./templates/sql/getGeojsonMask.sql");
exports.viewData = u.readTxt("./templates/sql/getViewData.sql");
exports.userValidation = u.readTxt("./templates/sql/getUserValidation.sql");
exports.viewFull = u.readTxt("./templates/sql/getViewFull.sql");

