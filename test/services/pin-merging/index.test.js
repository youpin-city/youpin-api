// Test helper functions
const request = require('supertest-as-promised');
const {
  assertTestEnv,
  expect,
  loadFixture,
  login,
} = require('../../test_helper');

// Models
const Department = require('../../../src/services/department/department-model');
const Pin = require('../../../src/services/pin/pin-model');
const User = require('../../../src/services/user/user-model');

// Roles
const {
  DEPARTMENT_HEAD,
  DEPARTMENT_OFFICER,
  ORGANIZATION_ADMIN,
  PUBLIC_RELATIONS,
  SUPER_ADMIN,
} = require('../../../src/constants/roles');

// Fixture
const departmentHeadUser = require('../../fixtures/department_head_user');
const departmentOfficerUser = require('../../fixtures/department_officer_user');
const normalUser = require('../../fixtures/normal_user');
const organizationAdminUser = require('../../fixtures/organization_admin_user');
const publicRelationsUser = require('../../fixtures/public_relations_user');
const superAdminUser = require('../../fixtures/super_admin_user');
const departments = require('../../fixtures/departments');
const pins = require('../../fixtures/pins');
const {
  PIN_ASSIGNED_ID,
  PIN_PENDING_ID,
  USER_DEPARTMENT_HEAD_ID,
  USER_DEPARTMENT_OFFICER_ID,
  USER_ORGANIZATION_ADMIN_ID,
  USER_PUBLIC_RELATIONS_ID,
  USER_SUPER_ADMIN_ID,
} = require('../../fixtures/constants');

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
        loadFixture(User, departmentHeadUser),
        loadFixture(User, departmentOfficerUser),
        loadFixture(User, normalUser),
        loadFixture(User, organizationAdminUser),
        loadFixture(User, publicRelationsUser),
        loadFixture(User, superAdminUser),
      ])
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  beforeEach((done) => {
    loadFixture(Pin, pins)
      .then(() => done());
  });

  afterEach((done) => {
    Pin.remove({})
      .then(() => done());
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
        .post(`/pins/${PIN_PENDING_ID}/merging`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          mergedParentPin: PIN_ASSIGNED_ID,
        })
        .expect(201);
    })
    .then((mergingResp) => {
      expect(mergingResp.body.length).to.equal(2);
      const updatedChildPinResult = mergingResp.body[0];
      const updatedParentPinResult = mergingResp.body[1];

      expect(updatedChildPinResult.ok).to.equal(1);
      expect(updatedParentPinResult.ok).to.equal(1);

      return Pin.findOne({ _id: PIN_PENDING_ID }); // eslint-disable-line no-underscore-dangle
    })
    .then(updatedChildPin => {
      expect(updatedChildPin.is_merged).to.equal(true);
      expect(updatedChildPin.merged_parent_pin).to.deep.equal(ObjectId(PIN_ASSIGNED_ID)); // eslint-disable-line new-cap,max-len

      return Pin.findOne({ _id: PIN_ASSIGNED_ID }).lean();
    })
    .then(updatedParentPin => {
      expect(updatedParentPin.merged_children_pins).to.deep.equal([ObjectId(PIN_PENDING_ID)]); // eslint-disable-line new-cap,max-len

      done();
    })
    .catch(err => done(err));
  });

  describe('allows all roles except normal user to merge pin', () => {
    const allowedUpdatingUsers = [
      {
        role: DEPARTMENT_HEAD,
        id: USER_DEPARTMENT_HEAD_ID,
        email: 'department_head@youpin.city',
        password: 'youpin_admin',
      },
      {
        role: DEPARTMENT_OFFICER,
        id: USER_DEPARTMENT_OFFICER_ID,
        email: 'department_officer@youpin.city',
        password: 'youpin_department_officer',
      },
      {
        role: ORGANIZATION_ADMIN,
        id: USER_ORGANIZATION_ADMIN_ID,
        email: 'organization_admin@youpin.city',
        password: 'youpin_admin',
      },
      {
        role: PUBLIC_RELATIONS,
        id: USER_PUBLIC_RELATIONS_ID,
        email: 'public_relations@youpin.city',
        password: 'youpin_public_relations',
      },
      {
        role: SUPER_ADMIN,
        id: USER_SUPER_ADMIN_ID,
        email: 'super_admin@youpin.city',
        password: 'youpin_admin',
      },
    ];

    allowedUpdatingUsers.forEach((user) => {
      it(`allows ${user.role} to merge pin`, (done) => {
        login(app, user.email, user.password)
          .then((tokenResp) => {
            const token = tokenResp.body.token;

            if (!token) {
              return done(new Error('No token returns'));
            }

            return request(app)
              .post(`/pins/${PIN_PENDING_ID}/merging`)
              .set('Authorization', `Bearer ${token}`)
              .set('Content-type', 'application/json')
              .send({
                mergedParentPin: PIN_ASSIGNED_ID,
              })
              .expect(201);
          })
          .then((mergingResp) => {
            expect(mergingResp.body.length).to.equal(2);
            const updatedChildPinResult = mergingResp.body[0];
            const updatedParentPinResult = mergingResp.body[1];

            expect(updatedChildPinResult.ok).to.equal(1);
            expect(updatedParentPinResult.ok).to.equal(1);

            return Pin.findOne({ _id: PIN_PENDING_ID }); // eslint-disable-line no-underscore-dangle
          })
          .then(updatedChildPin => {
            expect(updatedChildPin.is_merged).to.equal(true);
            expect(updatedChildPin.merged_parent_pin).to.deep.equal(ObjectId(PIN_ASSIGNED_ID)); // eslint-disable-line new-cap,max-len

            return Pin.findOne({ _id: PIN_ASSIGNED_ID }).lean();
          })
          .then(updatedParentPin => {
            expect(updatedParentPin.merged_children_pins).to.deep.equal([ObjectId(PIN_PENDING_ID)]); // eslint-disable-line new-cap,max-len

            done();
          })
          .catch(err => done(err));
      });
    });

    it('returns 401 not allowing normal user to update pin', (done) => (
      request(app)
        .post('/auth/local')
        .send({
          email: 'user@youpin.city',
          password: 'youpin_user',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            return done(new Error('No token returns'));
          }
          return request(app)
            .post(`/pins/${PIN_PENDING_ID}/merging`)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-type', 'application/json')
            .send({
              mergedParentPin: PIN_ASSIGNED_ID,
            });
        })
        .then((res) => {
          const error = res.body;

          expect(error.code).to.equal(403);
          expect(error.name).to.equal('Forbidden');
          expect(error.message).to.equal(
            'You do not have valid permissions to access this.');
          done();
        })
        .catch(error => console.log(error))
    ));
  });
});
