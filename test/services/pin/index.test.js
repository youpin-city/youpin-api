const app = require('../../../src/app');
const casual = require('casual');
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const mongoose = require('mongoose');
const request = require('supertest-as-promised');

const App3rdModel = require('../../../src/services/app3rd/app3rd-model.js');
const PinModel = require('../../../src/services/pin/pin-model.js');
const UserModel = require('../../../src/services/user/user-model.js');
// load fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd.js');
const adminUser = require('../../fixtures/admin_user.js');

// Makes sure that this is actually TEST environment
console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'test') {
  console.log('Woops, you want NODE_ENV=test before you try this again!');
  process.exit(1);
}

// Makes sure that db is youpin-test
if (mongoose.connection.db.s.databaseName !== 'youpin-test') {
  console.log('Woops, it seems you are using not-for-testing database. Change it now!');
  process.exit(1);
}

describe('pin service', () => {
  let server;
  before((done) => {
    server = app.listen(9100);
    server.once('listening', () => done());
  });
  beforeEach((done) => {
    PinModel
      .remove({})
      .then(() => App3rdModel.remove({}, done));
  });
  // Clears collection after finishing all tests.
  after((done) => {
    server.close((err) => {
      if (err) { throw err; }
      UserModel
        .remove({})
        .then(() => PinModel.remove({}))
        .then(() => App3rdModel.remove({}, done));
    });
  });
  it('registered the pins service', () => {
    expect(app.service('pins')).to.be.ok();
  });

  describe('GET', () => {
    beforeEach((done) => {
      // Create admin 3rd-party app
      loadFixture(App3rdModel, adminApp3rd, done);
    });

    it('returns 404 Not Found when id is not ObjectId', () => {
      const id = '1234';
      expect(mongoose.Types.ObjectId.isValid(id)).to.equal(false);
      return request(app)
        .get('/pins/1234')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .expect(404)
        .then((res) => {
          const error = res.body;
          expect(error.code).to.equal(404);
          expect(error.name).to.equal('NotFound');
          expect(error.message).to.equal('No record found for id \'1234\'');
        });
    });
  });

  describe('POST', () => {
    beforeEach((done) => {
      // Create admin user
      loadFixture(UserModel, adminUser, () => {
        loadFixture(App3rdModel, adminApp3rd, done);
      });
    });

    it('return 401 (unauthorized) if user is not authenticated', () => {
      const newPin = {
        detail: casual.text,
        owner: adminUser._id, // eslint-disable-line no-underscore-dangle
        provider: adminUser._id, // eslint-disable-line no-underscore-dangle
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };
      return request(app)
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
        });
    });

    it('return 401 (unauthorized) if an authenticated user posts using other user id', () => {
      const newPin = {
        detail: casual.text,
        owner: '1234',
        provider: '1234',
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };
      return request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            throw new Error('No token returns');
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
            });
        });
    });

    it('return 201 when posting by authenticated user, ' +
      'using correct owner id, and filling all required fields', () => {
      const newPin = {
        detail: casual.text,
        owner: adminUser._id, // eslint-disable-line no-underscore-dangle
        provider: adminUser._id, // eslint-disable-line no-underscore-dangle
        location: {
          coordinates: [10.733626, 10.5253153],
        },
      };
      return request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            throw new Error('No token returns');
          }
          return request(app)
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
            });
        });
    });
  });
});
