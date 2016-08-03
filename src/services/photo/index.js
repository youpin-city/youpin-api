const errors = require('feathers-errors');
const GCSUploader = require('../../utils/gcs-uploader');
const hooks = require('./hooks');
const Photo = require('./photo-model');
const Promise = require('bluebird');

// Middleware for handling file upload
const IMAGE_SIZE = 5 * 1024 * 1024;
const prepareMultipart = require('../../middleware/prepare-multipart')('image', IMAGE_SIZE);
const attachFileToFeathers = require('../../middleware/attach-file-to-feathers')();

// Save photo metadata to database
function savePhotoMetadata(file) {
  return new Promise((resolve, reject) => {
    const photo = new Photo({
      url: file.cloudStoragePublicUrl,
      mimetype: file.mimetype,
      size: file.size,
    });

    photo.save((err, photoDoc) => {
      if (err) return reject(err);

      return resolve(photoDoc);
    });
  });
}

function respondWithPhotoMetadata(photoDocument) {
  return new Promise((resolve, reject) => {
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
      id: photoDocument._id, // eslint-disable-line no-underscore-dangle
      url: photoDocument.url,
      mimetype: photoDocument.mimetype,
      size: photoDocument.size,
    });
  });
}

function uploadSaveResponse(reqFile, gcsConfig) {
  const gcsUploader = new GCSUploader(gcsConfig);

  return gcsUploader.upload(reqFile)
  .then((file) => savePhotoMetadata(file))
  .then((photoDoc) => respondWithPhotoMetadata(photoDoc))
  .catch((err) => Promise.reject(err));
}

function uploadSaveRespondFromUrl(url, gcsConfig) {
  const gcsUploader = new GCSUploader(gcsConfig);

  return gcsUploader.uploadFromUrl(url)
    .then((file) => savePhotoMetadata(file))
    .then((photoDoc) => respondWithPhotoMetadata(photoDoc))
    .catch((error) => Promise.reject(error));
}

class PhotosService {
  setup(app) {
    this.app = app;
  }

  get(id) {
    return Photo.findById(id, (err, photo) => {
      if (err) return Promise.reject(err);

      return Promise.resolve(photo);
    });
  }

  create(data, params) {
    const gcsConfig = this.app.get('gcs');

    return uploadSaveResponse(params.file, gcsConfig);
  }
}

class UploadPhotoFromUrlService {
  setup(app) {
    this.app = app;
  }

  create(data, params) { // eslint-disable-line no-unused-vars
    if (!data.url) {
      return Promise.reject(new errors.BadRequest('No URL provided'));
    }

    const gcsConfig = this.app.get('gcs');

    return uploadSaveRespondFromUrl(data.url, gcsConfig);
  }
}

class BulkUploadPhotosFromUrlsService {
  setup(app) {
    this.app = app;
  }

  create(data, params) { // eslint-disable-line no-unused-vars
    if (!data.urls) {
      return Promise.reject(new errors.BadRequest('No URLs provided'));
    }

    if (!Array.isArray((data.urls))) {
      return Promise.reject(new errors.BadRequest('Value of urls is not an array'));
    }

    const gcsConfig = this.app.get('gcs');

    return Promise.all(
      data.urls.map((url) => uploadSaveRespondFromUrl(url, gcsConfig))
    );
  }
}

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  /**
   * @api {get} /photos/:id Get info
   * @apiDescription Get a photo info from a photo id.
   * @apiVersion 0.1.0
   * @apiName GetPhotos
   * @apiGroup Photo
   *
   * @apiExample Example usage:
   * curl -i https://api.youpin.city/photos/5798bf8e24a5998715bde505
   *
   * @apiParam {Number} id unique id.
   *
   * @apiSuccess (Success 200) {String} _id Photo ID.
   * @apiSuccess (Success 200) {String} url Photo URL.
   * @apiSuccess (Success 200) {String} mimetype MIME type.
   * @apiSuccess (Success 200) {Number} size File size (bytes).
   *
   * @apiSuccessExample Success Response:
   *    HTTP/1.1 201 Created
   *    {
   *      "_id": "578fafba3855de9d00dc3c61",
   *      "url": "https://storage.googleapis.com/you-pin.appspot.com/1469034415861_hello.png",
   *      "mimetype": "image/png",
   *      "size": 138890
   *    }
   *
   * @apiError NotFound   The <code>id</code> of the Photo was not found.
   *
   * @apiErrorExample Error Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "name":"NotFound",
   *       "message":"No record found for id '1'",
   *       "code":404,
   *       "className":"not-found",
   *       "errors":{}
   *     }
   */

  /**
   * @api {post} /photos Upload
   * @apiDescription Upload a photo from a file.
   * @apiVersion 0.1.0
   * @apiName PostPhotos
   * @apiGroup Photo
   *
   * @apiExample Example usage:
   * curl -i -X POST -F "image=@/Users/youpin/Desktop/hello.png" https://api.youpin.city/photos
   *
   * @apiHeader Content-length File size.
   * @apiHeader Content-type="multipart/form-data; boundary=----WebKitFormBoundarygGYlBDNsxqSuYl2b"
   *
   * @apiParam {File} image File content.
   *
   * @apiSuccess (Created 201) {String} id Photo ID.
   * @apiSuccess (Created 201) {String} url Photo URL.
   * @apiSuccess (Created 201) {String} mimetype MIME type.
   * @apiSuccess (Created 201) {Number} size File size (bytes).

   * @apiSuccessExample Success Response:
   *    HTTP/1.1 201 Created
   *    {
   *      "id": "578fafba3855de9d00dc3c61",
   *      "url": "https://storage.googleapis.com/you-pin.appspot.com/1469034415861_hello.png",
   *      "mimetype": "image/png",
   *      "size": 138890
   *    }
   *
   * @apiError GeneralError   No file provided.
   *
   * @apiErrorExample Error Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "name":"GeneralError",
   *       "message":"No file provided",
   *       "code":500,
   *       "className":"general-error",
   *       "data": {},
   *       "errors":{}
   *     }
   */
  app.use('/photos', prepareMultipart, attachFileToFeathers, new PhotosService());
  const photosService = app.service('/photos');
  photosService.before(hooks.before);
  photosService.after(hooks.after);

  /**
   * @api {post} /photos/upload_from_url Upload from URL
   * @apiDescription Download a photo from a provided URL and upload it for you.
   * @apiVersion 0.1.0
   * @apiName PostPhotosUploadFromUrl
   * @apiGroup Photo
   *
   * @apiExample Example usage:
   * curl -i -X POST -H 'Content-type: application/json' -d '{"url": "http://image.flaticon.com/icons/png/128/62/62516.png"}' https://api.youpin.city/photos/upload_from_url
   *
   * @apiHeader Content-type=application/json
   *
   * @apiParam {String} url Photo URL to be uploaded
   *
   * @apiSuccess (Created 201) {String} id Photo ID.
   * @apiSuccess (Created 201) {String} url Photo URL.
   * @apiSuccess (Created 201) {String} mimetype MIME type.
   * @apiSuccess (Created 201) {Number} size File size (bytes).
   *
   * @apiSuccessExample Success Response:
   *    HTTP/1.1 201 Created
   *    {
   *      "id": "578fafba3855de9d00dc3c61",
   *      "url": "https://storage.googleapis.com/you-pin.appspot.com/1469034415861_hello.png",
   *      "mimetype": "image/png",
   *      "size": 138890
   *    }
   *
   * @apiError BadRequest   No URLs provided.
   * @apiError NotFound   File not found on given URL.
   *
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "name":"BadRequest",
   *       "message":"No URLs provided",
   *       "code":400,
   *       "className":"bad-request",
   *       "errors":{}
   *     }
   */
  app.use('/photos/upload_from_url', new UploadPhotoFromUrlService());

  /**
   * @api {post} /photos/bulk_upload_from_urls Bulk upload from multiple URLs
   * @apiDescription Download multple photos from provided URLs and upload them for you.
   * @apiVersion 0.1.0
   * @apiName PostPhotosBulkUploadFromUrls
   * @apiGroup Photo
  *
   * @apiExample Example usage:
   * curl -i -X POST -H 'Content-type: application/json' -d '{"urls": ["https://youpin.city/public/image/logo-l.png", "https://youpin.city/public/image/winner@2x.png"]}' https://api.youpin.city/photos/bulk_upload_from_urls
   *
   *
   * @apiParam {String[]} urls Array of photo URLs to be uploaded
   *
   * @apiHeader Content-type=application/json
   *
   * @apiSuccess (Created 201) {Object[]} photos Array of photo metadata
   * @apiSuccess (Created 201) {String} photos.id Photo ID.
   * @apiSuccess (Created 201) {String} photos.url Photo URL.
   * @apiSuccess (Created 201) {String} photos.mimetype MIME type.
   * @apiSuccess (Created 201) {Number} photos.size File size (bytes).

   * @apiSuccessExample Success Response:
   *    HTTP/1.1 201 Created
   *    {
   *      "urls": [
   *        {
   *          "id": "578fafba3855de9d00dc3c61",
   *          "url": "https://storage.googleapis.com/you-pin.appspot.com/1469034415861_hello.png",
   *          "mimetype": "image/png",
   *          "size": 138890
   *        },
   *        {
   *          "id": "578fafb39fi5de9d04817u87",
   *          "url": "https://storage.googleapis.com/you-pin.appspot.com/9069039183882_world.png",
   *          "mimetype": "image/png",
   *          "size": 151281
   *        }
   *      ]
   *    }
   *
   * @apiError BadRequest   No URLs provided.
   * @apiError GeneralError Provided URLs are not reachable.
   *
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "name":"BadRequest",
   *       "message":"No URLs provided",
   *       "code":400,
   *       "className":"bad-request",
   *       "errors":{}
   *     }
   */
  app.use('/photos/bulk_upload_from_urls', new BulkUploadPhotosFromUrlsService());
};
