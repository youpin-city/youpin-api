'use strict';

const Promise = require('bluebird');
const firebase = require('firebase');
const errors = require('feathers-errors');
const request = require('superagent');
const gcloud = require('gcloud');
const fs = require('fs');
const fdb = firebase.database();
const urlparser = require('url');
const gcs = gcloud.storage({
  projectId: 'You-pin',
  keyFilename: './youpin_gcs_credentials.json'
});
const multer = require('multer');

const CLOUD_BUCKET = 'staging.you-pin.appspot.com';

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

  const gcsname = Date.now() + '_' + req.file.originalname;
  const file = bucket.file(gcsname);
  const stream = file.createWriteStream();

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
  app.post('/photos',
      uploader.single('image'),
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

  // This service receives image url. Then, it downloads and stores image for you.
  // TODO(A): support downloading multiple urls
  app.post('/photos/uploadfromurl',
      function (req, res, next) {
        const data = req.body;
        var photoUrls = [];
        console.log(data);
        if (Array.isArray(data)) {
          photoUrls = data;
          return res.send(new errors.NotImplemented('Array is not supported yet'));
        } else {
          photoUrls.push(data);
        }
        const url = photoUrls[0];
        // TODO(A): Change to promise and ES6 style
        request
          .head(url)
          .end(function (err, photoHeaderResp) {
            if (err) {
              return res.send(err);
            }
            const pathArray = urlparser.parse(url).pathname.split('/');
            const filename = pathArray[pathArray.length - 1];
            const mimetype = photoHeaderResp.header['content-type'];
            const size = photoHeaderResp.header['content-length'];
            const gcsname = Date.now() + '_' + filename;
            const gcsfile = bucket.file(gcsname);
            const filePublicUrl = getPublicUrl(gcsname);
            console.log('Downloading photo...');
            console.log('Name: ' + filename);
            console.log('Mimetype: ' + mimetype);
            console.log('Size: ' + size);
            console.log('To: ' + filePublicUrl);
            var uploadPipe = request.get(url).pipe(gcsfile.createWriteStream());
            uploadPipe.on('error', function(err) {
              console.log(err);
              res.send(err);
            });
            uploadPipe.on('finish', function() {
              console.log('Uploading to the cloud starge is complete!');
              res.json({
                url: filePublicUrl,
                mimetype: mimetype,
                size: size
              });
            });
          });
      });
};
