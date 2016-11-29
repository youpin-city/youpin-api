// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const casual = require('casual');
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const App3rdModel = require('../../../src/services/app3rd/app3rd-model');
const PinModel = require('../../../src/services/pin/pin-model');
const UserModel = require('../../../src/services/user/user-model');

// Fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd');
const adminUser = require('../../fixtures/admin_user');
const pins = require('../../fixtures/pins');

// App stuff
const app = require('../../../src/app');
const mongoose = require('mongoose');
const UNVERIFIED = require('../../../src/constants/pin-states').UNVERIFIED;

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('pin service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(UserModel, adminUser),
        loadFixture(App3rdModel, adminApp3rd),
        loadFixture(PinModel, pins),
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
      PinModel.remove({}),
      App3rdModel.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('registered the pins service', () => {
    expect(app.service('pins')).to.be.ok();
  });

  describe('GET', () => {
    it('returns 404 Not Found when id is not ObjectId', (done) => {
      // Test with invalid object id
      const id = '1234';
      expect(mongoose.Types.ObjectId.isValid(id)).to.equal(false);

      request(app)
        .get('/pins/1234')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .expect(404)
        .then((res) => {
          const error = res.body;

          expect(error.code).to.equal(404);
          expect(error.name).to.equal('NotFound');
          expect(error.message).to.equal('No record found for id \'1234\'');

          done();
        });
    });

    it('returns 200 w/ swapped lat-long by requesting using the correct id', (done) => {
      request(app)
        .get('/pins/579334c75563625d6281b6f6')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .expect(200)
        .then((res) => {
          if (!res.body) {
            return done(new Error('No data return'));
          }
          const foundCoordinates = res.body.location.coordinates;

          expect(foundCoordinates).to.deep.equal([13.730537951109, 100.56983534303]);

          return done();
        });
    });
  });

  describe('POST', () => {
    it('return 401 (unauthorized) if user is not authenticated', (done) => {
      const newPin = {
        detail: casual.text,
        owner: adminUser._id, // eslint-disable-line no-underscore-dangle
        provider: adminUser._id, // eslint-disable-line no-underscore-dangle
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };

      request(app)
        .post('/pins')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .send(newPin)
        .expect(401)
        .then((res) => {
          const error = res.body;

          expect(error.code).to.equal(401);
          expect(error.name).to.equal('NotAuthenticated');
          expect(error.message).to.equal('Authentication token missing.');

          done();
        });
    });

    it('return 401 (unauthorized) if an authenticated user posts using other user id', (done) => {
      const newPin = {
        detail: casual.text,
        owner: '1234',
        provider: '1234',
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };

      request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            return done(new Error('No token returns'));
          }

          return request(app)
            .post('/pins')
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .send(newPin)
            .set('Authorization', `Bearer ${token}`)
            .expect(401)
            .then((res) => {
              const error = res.body;

              expect(error.code).to.equal(401);
              expect(error.name).to.equal('NotAuthenticated');
              expect(error.message).to.equal(
                'Owner field (id) does not matched with the token owner id.');

              done();
            });
        });
    });

    it('return 201 when posting by authenticated user, ' +
      'using correct owner id, and filling all required fields', (done) => {
      const newPin = {
        detail: casual.text,
        organization: '57933111556362511181aaa1',
        owner: adminUser._id, // eslint-disable-line no-underscore-dangle
        provider: adminUser._id, // eslint-disable-line no-underscore-dangle
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };

      request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .post('/pins')
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .send(newPin)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .then((res) => {
              const createdPin = res.body;
              expect(createdPin).to.contain.keys(
                ['_id', 'detail', 'owner', 'provider',
                  'videos', 'voters', 'comments', 'tags',
                  'location', 'photos', 'neighborhood', 'mentions',
                  'followers', 'updated_time', 'created_time', 'categories']);

              done();
            });
        });
    });

    it('craetes pin with `unverified` status as default status', (done) => {
      const newPin = {
        detail: casual.text,
        organization: '57933111556362511181aaa1',
        owner: adminUser._id, // eslint-disable-line no-underscore-dangle
        provider: adminUser._id, // eslint-disable-line no-underscore-dangle
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };

      request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .post('/pins')
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .send(newPin)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .then((res) => {
              const createdPin = res.body;
              expect(createdPin.status).to.equal(UNVERIFIED);

              done();
            });
        });
    });
  });
});
