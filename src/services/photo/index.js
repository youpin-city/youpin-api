'use strict';

const Promise = require('bluebird');
const errors = require('feathers-errors');
const request = require('superagent');
const gcloud = require('gcloud');
const fs = require('fs');
const urlparser = require('url');
const multer = require('multer');
const Photo = require('./photo-model');

const CLOUD_BUCKET = 'staging.you-pin.appspot.com';

const gcs = gcloud.storage({
  projectId: 'You-pin',
  keyFilename: './youpin_gcs_credentials.json'
});

const bucket = gcs.bucket(CLOUD_BUCKET);

const uploader = multer({
  inMemory: true,
  fileSize: 5 * 1024 * 1024, // no larger than 5MB
  rename: function(fieldname, filename) {
    // generate a unique filename
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  }
});

function getPublicUrl (filename) {
  return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}

function uploadToGCS(reqFile) {
  return new Promise(function (resolve, reject) {
    if (!reqFile) {
      return reject(new Error('No file provided'));
    }

    const gcsname = Date.now() + '_' + reqFile.originalname;
    const bucketFile = bucket.file(gcsname);
    const stream = bucketFile.createWriteStream();

    stream.on('error', function (err) {
      reqFile.cloudStorageError = err;

      return reject(err);
    });

    stream.on('finish', function () {
      const publicUrl = getPublicUrl(gcsname);

      reqFile.cloudStorageObject = gcsname;
      reqFile.cloudStoragePublicUrl = publicUrl;

      return resolve(reqFile);
    });

    stream.end(reqFile.buffer);
  });
}

function getMetadataFromUrl(url) {
  return new Promise((resolve, reject) => {
    request
      .head(url)
      .end((err, photoHeaderResp) => {
        if (err) {
          return reject(err);
        }

        // Get metadata
        const pathArray = urlparser.parse(url).pathname.split('/');
        const filename = pathArray[pathArray.length - 1];
        const mimetype = photoHeaderResp.header['content-type'];
        const size = photoHeaderResp.header['content-length'];

        return resolve({
          filename: filename,
          mimetype: mimetype,
          size: size
        });
      });
  });
}

// Get metadata and download a file from URL, then, upload it to GCS
function uploadToGCSByUrl(url) {
  return getMetadataFromUrl(url)
    .then((metadata) => {
      return new Promise((resolve, reject) => {
        const gcsname = Date.now() + '_' + metadata.filename;
        const gcsfile = bucket.file(gcsname);
        const filePublicUrl = getPublicUrl(gcsname);

        console.log('Downloading photo...');
        console.log('Name: ' + metadata.filename);
        console.log('Mimetype: ' + metadata.mimetype);
        console.log('Size: ' + metadata.size);
        console.log('To: ' + filePublicUrl);

        // Download and pipe it to GCS
        var uploadPipe = request.get(url).pipe(gcsfile.createWriteStream());

        uploadPipe.on('error', function(err) {
          return reject(err);
        });

        uploadPipe.on('finish', function() {
          const file = {
            cloudStoragePublicUrl: filePublicUrl,
            mimetype: metadata.mimetype,
            size: metadata.size
          };
          return resolve(file);
        });
      });
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

// Save photo metadata to database
function savePhotoMetadata(file) {
  return new Promise(function (resolve, reject) {
    const photo = new Photo({
      url: file.cloudStoragePublicUrl,
      mimetype: file.mimetype,
      size: file.size
    });

    photo.save(function (err, photoDoc) {
      if (err) {
        return reject(err);
      }

      return resolve(photoDoc);
    });
  });
}

function respondWithPhotoMetadata(photoDocument) {
  return new Promise(function (resolve, reject) {
    if (!photoDocument) {
      return reject(new errors.GeneralError('No photo provided'));
    }

    if (!photoDocument.url) {
      return reject(new errors.GeneralError('No photo URL provided'));
    }

    if (!photoDocument.mimetype) {
      return reject(new errors.GeneralError('No photo MIME type provided'));
    }

    if (!photoDocument.size) {
      return reject(new errors.GeneralError('No photo size provided'));
    }

    return resolve({
      id: photoDocument._id,
      url: photoDocument.url,
      mimetype: photoDocument.mimetype,
      size: photoDocument.size
    });
  });
}

class PhotosService {
  get(id) {
    return Photo.findById(id, (err, photo) => {
      if (err) {
        return Promise.reject(err);
      }

      return Promise.resolve(photo);
    });
  }

  create(data, params) {
    return uploadToGCS(params.file)
    .then((file) => {
      return savePhotoMetadata(file);
    })
    .then((photoDoc) => {
      return respondWithPhotoMetadata(photoDoc);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
  }
}

class UploadPhotoFromUrlService {
  create(data, params) {
    if (typeof data !== 'object') {
      return Promise.reject(new errors.BadRequest('Data must be a JSON object'));
    }

    var photoUrls = [];

    if (Array.isArray(data.urls)) {
      photoUrls = data;
      return Promise.reject(new errors.NotImplemented('Array is not supported yet'));
    } else {
      photoUrls.push(data.urls);
    }

    const url = photoUrls[0];

    return uploadToGCSByUrl(url)
      .then((file) => {
        return savePhotoMetadata(file);
      })
      .then((photoDoc) => {
        return respondWithPhotoMetadata(photoDoc);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }
}

// Middleware to handle file uploading
function prepareMultipart(req, res, next) {
  // Bypass this middleware if it's not a POST request
  if (req.method.toLowerCase() === 'post') {
    return uploader.single('image')(req, res, next);
  }

  next();
}

// Middle to attach file from multer (uploader) to the req object
function attachFileToFeathers(req, res, next) {
  // Bypass this middleware if it's not a POST request or file is not available
  if (req.method.toLowerCase() === 'post' && req.file) {
    req.feathers.file = req.file;
  }

  next();
}

module.exports = function(){
  const app = this;
  //TODO(A): Need id and need to support multiple photos uplaod
  //TODO(A): Also need to support photo url and download it instead of 3rd party app
  app.use('/photos', prepareMultipart, attachFileToFeathers, new PhotosService());

  // This service receives image url. Then, it downloads and stores image for you.
  // TODO(A): support downloading multiple urls
  app.use('/photos/upload_from_url', new UploadPhotoFromUrlService());
};
