const errors = require('feathers-errors');
const Promise = require('bluebird');
const hooks = require('./hooks');
const GCSUploader = require('../../utils/gcs-uploader');
const Video = require('./video-model');

// Middleware for handling file upload
const VIDEO_SIZE = 20 * 1024 * 1024;
const prepareMultipart = require('../../middleware/prepare-multipart')('video', VIDEO_SIZE);
const attachFileToFeathers = require('../../middleware/attach-file-to-feathers')();

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
  setup(app) {
    this.app = app;
  }

  get(id) {
    return Video.findById(id, (err, video) => {
      if (err) {
        return Promise.reject(err);
      }

      return Promise.resolve(video);
    });
  }

  create(data, params) {
    const gcsConfig = this.app.get('gcs');
    const gcsUploader = new GCSUploader(gcsConfig);

    return gcsUploader.upload(params.file)
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
