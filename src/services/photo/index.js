'use strict';

const Promise = require('bluebird');
const firebase = require('firebase');
const errors = require('feathers-errors');
const gcloud = require('gcloud');
const fdb = firebase.database();
const gcs = gcloud.storage({
  projectId: 'You-pin',
  keyFilename: './youpin_gcs_credentials.json'
});
const multer = require('multer');

var CLOUD_BUCKET = 'staging.you-pin.appspot.com';

const uploader = multer({
  inMemory: true,
      fileSize: 5 * 1024 * 1024, // no larger than 5MB
      rename: function (fieldname, filename) {
        // generate a unique filename
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
      }
});
const bucket = gcs.bucket(CLOUD_BUCKET);
function getPublicUrl (filename) {
  return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}
function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }

  var gcsname = Date.now() + req.file.originalname;
  var file = bucket.file(gcsname);
  var stream = file.createWriteStream();

  stream.on('error', function (err) {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', function () {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.file.buffer);
}

module.exports = function(){
  const app = this;
  //TODO(A): Need id and need to support multiple photos uplaod
  //TODO(A): Also need to support photo url and download it instead of 3rd party app
  app.post('/photos', uploader.single('image'),
      sendUploadToGCS,
      function(req, res, next) {
        // we don't care req.body for now.
        // (care only file content)
        var imageUrl;
        if (req.file && req.file.cloudStoragePublicUrl) {
          imageUrl = req.file.cloudStoragePublicUrl;
        }
        res.json({
          url: imageUrl,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      });
};
