// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');
const stub = require('../../test_helper').stub;

// Models
const PhotoModel = require('../../../src/services/photo/photo-model');
const UserModel = require('../../../src/services/user/user-model');

// Fixtures
const photos = require('../../fixtures/photos');
const adminUser = require('../../fixtures/admin_user');

// App stuff
const app = require('../../../src/app');
const mongoose = require('mongoose');
const GCSUploader = require('../../../src/utils/gcs-uploader');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('photo service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(UserModel, adminUser),
        loadFixture(PhotoModel, photos),
      ])
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  after((done) => {
    // Clear collections after finishing all tests.
    Promise.all([
      UserModel.remove({}),
      PhotoModel.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('registered the photos service', () => {
    expect(app.service('photos')).to.be.ok();
  });

  describe('GET', () => {
    it('returns 404 Not Found when id is not ObjectId', (done) => {
      // Test with invalid object id
      const id = '1234';
      expect(mongoose.Types.ObjectId.isValid(id)).to.equal(false);

      request(app)
        .get('/photos/1234')
        .expect(404)
        .then((res) => {
          const error = res.body;

          expect(error.code).to.equal(404);
          expect(error.name).to.equal('NotFound');
          expect(error.message).to.equal('No record found for id \'1234\'');

          done();
        });
    });

    it('returns correct photo metadata', (done) => {
      request(app)
        .get('/photos/579331115563625d6281b111')
        .expect(200)
        .then((res) => {
          const data = res.body;

          expect(data.url).to.equal('https://youpin.city/logo.png');
          expect(data.mimetype).to.equal('image/png');
          expect(data.size).to.equal(5000);

          done();
        });
    });
  });

  describe('POST', () => {
    let dateStub;
    let uploaderStub;

    before(() => {
      dateStub = stub(Date, 'now', () => '1470415027347');

      // Stub upload function to avoid real uploading
      uploaderStub = stub(GCSUploader.prototype, 'upload', function (reqFile) { // eslint-disable-line
        return new Promise((resolve) => {
          const gcsFileName = `${Date.now()}_${reqFile.originalname}`;

          /* eslint-disable no-param-reassign */
          reqFile.cloudStorageObject = gcsFileName;
          reqFile.cloudStoragePublicUrl = this.getGCSPublicUrl(gcsFileName);
          /* eslint-enable no-param-reassign */

          resolve(reqFile);
        });
      });
    });

    after(() => {
      dateStub.restore();
      uploaderStub.restore();
    });

    it('saves file metadata to database and responds with that metadata', (done) => {
      const gcsConfig = app.get('gcs');

      request(app)
        .post('/photos')
        .attach('image', 'test/fixtures/logo.png')
        .expect(201)
        .end((err, res) => { // eslint-disable-line consistent-return
          if (err) return done(err);

          const body = res.body;
          const expectedUrl = encodeURI(
            `${gcsConfig.gcsUrl}/${gcsConfig.bucket}/1470415027347_logo.png`);

          // Check correct response
          expect(body.url).to.equal(expectedUrl);
          expect(body.mimetype).to.equal('image/png');
          expect(body.size).to.equal(4434);

          // Check file metadata is inserted into database
          PhotoModel.findById(body.id, (error, photo) => {
            if (error) return done(error);

            expect(photo).to.be.ok();
            expect(photo.url).to.equal(expectedUrl);
            expect(photo.mimetype).to.equal('image/png');
            expect(photo.size).to.equal(4434);

            return done();
          });
        });
    });
  });
});
