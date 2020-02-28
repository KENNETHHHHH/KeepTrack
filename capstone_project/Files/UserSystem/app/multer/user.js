var path = require("path");
//add multer to manage multipart form
var multer = require("multer");

var storage = multer.diskStorage({

    destination: function (req, file, callback) {

        callback(null, './users/avatars');

    },

    filename: function (req, file, callback) {

      var filetypes = /jpeg|jpg|png/;
      var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      var mimetype = filetypes.test(file.mimetype);

      if (!mimetype && !extname) {

        var err = new Error();
        err.code = 'LIMIT_FILE_TYPE';
        return callback(err);

      } else {

        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

      }
    }
});

var upload = multer({ storage: storage, limits: { fileSize: 1000000 } }).single('avatar');

module.exports = upload;
