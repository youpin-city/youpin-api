const errors = require('feathers-errors');
const gcloud = require('gcloud');
const Promise = require('bluebird');
const hooks = require('./hooks');
const Video = require('./video-model');

// Middleware for handling file upload
const VIDEO_SIZE = 5 * 1024 * 1024;
const prepareMultipart = require('../../middleware/prepare-multipart')('video', VIDEO_SIZE);
const attachFileToFeathers = require('../../middleware/attach-file-to-feathers')();

const CLOUD_BUCKET = 'staging.you-pin.appspot.com';

const gcs = gcloud.storage({
  projectId: 'You-pin',
  keyFilename: './youpin_gcs_credentials.json',
});

const bucket = gcs.bucket(CLOUD_BUCKET);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

function uploadToGCS(reqFile) {
  return new Promise((resolve, reject) => { // eslint-disable-line consistent-return
    if (!reqFile) {
      return reject(new Error('No file provided'));
    }

    const gcsname = `${Date.now()}_${reqFile.originalname}`;
    const bucketFile = bucket.file(gcsname);
    const stream = bucketFile.createWriteStream();

    stream.on('error', (err) => {
      /* eslint-disable no-param-reassign */
      reqFile.cloudStorageError = err;
      /* eslint-enable no-param-reassign */

      return reject(err);
    });

    stream.on('finish', () => {
      const publicUrl = getPublicUrl(gcsname);

      /* eslint-disable no-param-reassign */
      reqFile.cloudStorageObject = gcsname;
      reqFile.cloudStoragePublicUrl = publicUrl;
      /* eslint-enable no-param-reassign */

      return resolve(reqFile);
    });

    stream.end(reqFile.buffer);
  });
}

// Save video metadata to database
function saveVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const video = new Video({
      url: file.cloudStoragePublicUrl,
      mimetype: file.mimetype,
      size: file.size,
    });

    video.save((err, videoDoc) => {
      if (err) return reject(err);

      return resolve(videoDoc);
    });
  });
}

function respondWithVideoMetadata(videoDocument) {
  return new Promise((resolve, reject) => {
    if (!videoDocument) {
      return reject(new errors.GeneralError('No video provided'));
    }

    if (!videoDocument.url) {
      return reject(new errors.GeneralError('No video URL provided'));
    }

    if (!videoDocument.mimetype) {
      return reject(new errors.GeneralError('No video MIME type provided'));
    }

    if (!videoDocument.size) {
      return reject(new errors.GeneralError('No video size provided'));
    }

    return resolve({
      id: videoDocument._id, // eslint-disable-line no-underscore-dangle
      url: videoDocument.url,
      mimetype: videoDocument.mimetype,
      size: videoDocument.size,
    });
  });
}


class VideosService {
  get(id) {
    return Video.findById(id, (err, video) => {
      if (err) {
        return Promise.reject(err);
      }

      return Promise.resolve(video);
    });
  }

  create(data, params) {
    return uploadToGCS(params.file)
    .then((file) => saveVideoMetadata(file))
    .then((videoDoc) => respondWithVideoMetadata(videoDoc))
    .catch((err) => Promise.reject(err));
  }
}

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  app.use('/videos', prepareMultipart, attachFileToFeathers, new VideosService());
  const videosService = app.service('/videos');
  videosService.before(hooks.before);
  videosService.after(hooks.after);
};
