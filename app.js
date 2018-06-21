'use strict';
// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');// call express
var app = express();// define our app using express

var bodyParser = require('body-parser');
var db = require('./queries.js');
var VerifyToken = require('./verify');
var HttpStatus = require('http-status-codes');
var multer = require('multer');

// configure mult storage parameters
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './comment_uploads/');
  },
  filename: function(req, file, cb) {
    var fileFormat = (file.originalname).split('.');
    cb(
      null,
      file.fieldname +
      '-' +
      Date.now() +
      '.' +
      fileFormat[fileFormat.length - 1]
    );
  },
});

var upload = multer({ storage: storage });


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();// get an instance of the express Router

router.get('/toponimspartnom', VerifyToken, db.getToponimsPartNom);
router.get('/tipustoponim', VerifyToken, db.getTipusToponims);
router.get('/toponimsgeo', VerifyToken, db.getToponimsGeo);
router.get('/toponim', VerifyToken, db.getToponim);
router.post('/comment_new', VerifyToken, upload.single('file'), db.postComment);
router.post(
  '/comment_edit',
  VerifyToken,
  upload.single('file'),
  db.editComment
);
router.post('/comment_delete', VerifyToken, db.deleteComment);
router.get('/comment', VerifyToken, db.getComment);
router.get('/arbre', VerifyToken, db.getArbre);
router.get('/auth', db.getAuth);


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

var errorCodeIsHttpValid = function(code){
  for (var key in HttpStatus){
    if (code === HttpStatus[key]){
      return true;
    }
  }
  return false;
};

// ERROR HANDLERS ------------------------------------

app.use(function(err, req, res, next) {
  var status = 500;
  if (errorCodeIsHttpValid(err.code)){
    status = err.code;
  }
  res.status(status)
    .json({
      success: false,
      message: err,
    });
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on port ' + port);


module.exports = router;
