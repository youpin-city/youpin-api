const gcloud = require('google-cloud');
const request = require('superagent');
const urlparser = require('url');

function getGCSBucketFile(gcsFileName, gcsConfig) {
  const gcs = gcloud.storage({
    projectId: gcsConfig.projectId,
    keyFilename: gcsConfig.keyFile,
  });
  const bucket = gcs.bucket(gcsConfig.bucket);
  const bucketFile = bucket.file(gcsFileName);

  return bucketFile;
}

function getMetadataFromUrl(url) {
  return new Promise((resolve, reject) => {
    request
      .head(url)
      .end((err, photoHeaderResp) => {
        if (err) return reject(err);
        // Get metadata
        const pathArray = urlparser.parse(url).pathname.split('/');
        const filename = pathArray[pathArray.length - 1];
        const mimetype = photoHeaderResp.header['content-type'];
        const size = photoHeaderResp.header['content-length'];

        return resolve({
          filename,
          mimetype,
          size,
        });
      });
  });
}

// Google Cloud Storage Uploader
class GCSUploader {
  constructor(gcsConfig) {
    this.gcsConfig = gcsConfig;
  }

  getGCSPublicUrl(gcsFileName) {
    return `${this.gcsConfig.gcsUrl}/${this.gcsConfig.bucket}/${gcsFileName}`;
  }

  /*
   * Upload a file
   * @param reqFile A file attached with the request object
   */
  upload(reqFile) {
    return new Promise((resolve, reject) => {
      if (!reqFile) return reject(new Error('No file provided'));

      const gcsFileName = `${Date.now()}_${reqFile.originalname}`;
      const bucketFile = getGCSBucketFile(gcsFileName, this.gcsConfig);
      const stream = bucketFile.createWriteStream();

      stream.on('error', (err) => {
        reqFile.cloudStorageError = err; // eslint-disable-line no-param-reassign

        return reject(err);
      });

      stream.on('finish', () => {
        const publicUrl = this.getGCSPublicUrl(gcsFileName, this.gcsConfig);

        /* eslint-disable no-param-reassign */
        reqFile.cloudStorageObject = gcsFileName;
        reqFile.cloudStoragePublicUrl = publicUrl;
        /* eslint-enable no-param-reassign */

        return resolve(reqFile);
      });

      return stream.end(reqFile.buffer);
    });
  }

  /*
   * Get metadata and download a file from URL, then, upload it to GCS
   * @param url URL to download file and upload to GCS
   */
  uploadFromUrl(url) {
    return getMetadataFromUrl(url)
      .then((metadata) => new Promise((resolve, reject) => {
        const gcsFileName = `${Date.now()}_${metadata.filename}`;
        const bucketFile = getGCSBucketFile(gcsFileName, this.gcsConfig);
        const filePublicUrl = this.getGCSPublicUrl(gcsFileName, this.gcsConfig);

        console.log('Downloading photo...');
        console.log(`Name: ${metadata.filename}`);
        console.log(`Mimetype: ${metadata.mimetype}`);
        console.log(`Size: ${metadata.size}`);
        console.log(`To: ${filePublicUrl}`);

        // Download and pipe it to GCS
        const uploadPipe = request.get(url).pipe(bucketFile.createWriteStream());

        uploadPipe.on('error', (err) => reject(err));

        uploadPipe.on('finish', () => {
          const file = {
            cloudStoragePublicUrl: filePublicUrl,
            mimetype: metadata.mimetype,
            size: metadata.size,
          };
          return resolve(file);
        });
      }))
      .catch((error) => Promise.reject(error));
  }
}

module.exports = GCSUploader;
