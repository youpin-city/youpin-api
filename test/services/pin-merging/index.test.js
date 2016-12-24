// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const Department = require('../../../src/services/department/department-model');
const Pin = require('../../../src/services/pin/pin-model');
const User = require('../../../src/services/user/user-model');

// Fixture
const departmentHeadUser = require('../../fixtures/department_head_user');
const departments = require('../../fixtures/departments');
const organizationAdminUser = require('../../fixtures/organization_admin_user');
const pins = require('../../fixtures/pins');
const superAdminUser = require('../../fixtures/super_admin_user');
const ASSIGNED_PIN_ID = require('../../fixtures/constants').ASSIGNED_PIN_ID;
const VERIFIED_PIN_ID = require('../../fixtures/constants').VERIFIED_PIN_ID;

// App stuff
const app = require('../../../src/app');
const ObjectId = require('mongoose').Types.ObjectId;

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin merging service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(Department, departments),
        loadFixture(User, superAdminUser),
        loadFixture(User, organizationAdminUser),
        loadFixture(User, departmentHeadUser),
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
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('registered the pin merging service', () => {
    expect(app.service('/pins/:pinId/merging')).to.be.ok();
  });

  it('updates correct pin properties', (done) => {
    request(app)
    .post('/auth/local')
    .set('Content-type', 'application/json')
    .send({
      email: 'super_admin@youpin.city',
      password: 'youpin_admin',
    })
    .then((loginResp) => {
      const token = loginResp.body.token;

      return request(app)
      .post(`/pins/${VERIFIED_PIN_ID}/merging`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-type', 'application/json')
      .send({
        mergedParentPin: ASSIGNED_PIN_ID,
      })
      .expect(201);
    })
    .then((mergingResp) => {
      expect(mergingResp.body.length).to.equal(2);
      const updatedChildPinResult = mergingResp.body[0];
      const updatedParentPinResult = mergingResp.body[1];

      expect(updatedChildPinResult.ok).to.equal(1);
      expect(updatedParentPinResult.ok).to.equal(1);

      return Pin.findOne({ _id: VERIFIED_PIN_ID }); // eslint-disable-line no-underscore-dangle
    })
    .then(updatedChildPin => {
      expect(updatedChildPin.is_merged).to.equal(true);
      expect(updatedChildPin.merged_parent_pin).to.deep.equal(ObjectId(ASSIGNED_PIN_ID)); // eslint-disable-line new-cap,max-len

      return Pin.findOne({ _id: ASSIGNED_PIN_ID }).lean();
    })
    .then(updatedParentPin => {
      expect(updatedParentPin.merged_children_pins).to.deep.equal([ObjectId(VERIFIED_PIN_ID)]); // eslint-disable-line new-cap,max-len

      done();
    })
    .catch(err => done(err));
  });
});
