// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const App3rd = require('../../../src/services/app3rd/app3rd-model');
const Department = require('../../../src/services/department/department-model');
const Pin = require('../../../src/services/pin/pin-model');
const User = require('../../../src/services/user/user-model');

// Fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd');
const adminUser = require('../../fixtures/admin_user');
const departmentHeadUser = require('../../fixtures/department_head_user');
const departments = require('../../fixtures/departments');
const normalUser = require('../../fixtures/normal_user');
const orgnizationAdminUser = require('../../fixtures/organization_admin_user');
const publicRelationsUser = require('../../fixtures/public_relations_user');
const superAdminUser = require('../../fixtures/super_admin_user');
const pins = require('../../fixtures/pins');

// Constants
const PIN_PENDING_ID = require('../../fixtures/constants').PIN_PENDING_ID;
const PIN_PROCESSING_ID = require('../../fixtures/constants').PIN_PROCESSING_ID;
const PROGRESS_DETAIL = require('../../fixtures/constants').PROGRESS_DETAIL;

// App stuff
const app = require('../../../src/app');
const mongoose = require('mongoose');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin - GET', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(User, adminUser),
        loadFixture(User, departmentHeadUser),
        loadFixture(User, normalUser),
        loadFixture(User, orgnizationAdminUser),
        loadFixture(User, publicRelationsUser),
        loadFixture(User, superAdminUser),
        loadFixture(App3rd, adminApp3rd),
        loadFixture(Department, departments),
        loadFixture(Pin, pins),
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
      User.remove({}),
      Pin.remove({}),
      Department.remove({}),
      App3rd.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

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
      .get(`/pins/${PIN_PENDING_ID}`)
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

  it('returns 200 + progresses and progresses.owner fields should be populated', (done) => {
    request(app)
      .get(`/pins/${PIN_PROCESSING_ID}`)
      .set('X-YOUPIN-3-APP-KEY',
        '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
      .expect(200)
      .then((res) => {
        if (!res.body) {
          return done(new Error('No data return'));
        }
        const pin = res.body;
        expect(pin.progresses).to.have.lengthOf(1);
        expect(pin.progresses[0].detail).to.equal(PROGRESS_DETAIL);
        /* eslint-disable no-underscore-dangle */
        // Make sure the owner is populated by checking its _id.
        expect(pin.progresses[0].owner._id).to.equal(adminUser._id.toString());
        // Make sure the department under owner is populated by checking its _id.
        expect(pin.progresses[0].owner.department._id).to.equal(adminUser.department.toString());
        /* eslint-enable */
        return done();
      });
  });
});
