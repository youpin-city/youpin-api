// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const DepartmentModel = require('../../../src/services/department/department-model');
const PinModel = require('../../../src/services/pin/pin-model');
const UserModel = require('../../../src/services/user/user-model');

// Fixture
const superAdminUser = require('../../fixtures/super_admin_user');
const organizationAdminUser = require('../../fixtures/organization_admin_user');
const departmentHeadUser = require('../../fixtures/department_head_user');
const departments = require('../../fixtures/departments');
const pins = require('../../fixtures/pins');

// App stuff
const app = require('../../../src/app');
const states = require('../../../src/constants/pin-states');
const roles = require('../../../src/constants/roles');
const PinTransitionService = require('../../../src/services/pin-state-transition').PinTransitionService; // eslint-disable-line max-len
const ObjectId = require('mongoose').Types.ObjectId;

// States
const UNVERIFIED = states.UNVERIFIED;
const VERIFIED = states.VERIFIED;
const ASSIGNED = states.ASSIGNED;
const PROCESSING = states.PROCESSING;
const RESOLVED = states.RESOLVED;
const REJECTED = states.REJECTED;

// Roles
const SUPER_ADMIN = roles.SUPER_ADMIN;
const ORGANIZATION_ADMIN = roles.ORGANIZATION_ADMIN;
const DEPARTMENT_HEAD = roles.DEPARTMENT_HEAD;
const USER = roles.USER;

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin state transtion service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(DepartmentModel, departments),
        loadFixture(UserModel, superAdminUser),
        loadFixture(UserModel, organizationAdminUser),
        loadFixture(UserModel, departmentHeadUser),
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
      DepartmentModel.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('registered the pin state transition service', () => {
    expect(app.service('/pins/:pinId/state_transition')).to.be.ok();
  });

  it('correctly authorizes each role for state transition', () => {
    /* eslint-disable max-len */
    const testCases = [
      { role: SUPER_ADMIN, prevState: UNVERIFIED, nextState: VERIFIED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: UNVERIFIED, nextState: ASSIGNED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: UNVERIFIED, nextState: REJECTED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: UNVERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: UNVERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: VERIFIED, nextState: UNVERIFIED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: VERIFIED, nextState: ASSIGNED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: VERIFIED, nextState: REJECTED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: VERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: VERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: UNVERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: VERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: UNVERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: VERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: UNVERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: VERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: PROCESSING, expectedResult: true },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: UNVERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: VERIFIED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: UNVERIFIED, nextState: VERIFIED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: UNVERIFIED, nextState: ASSIGNED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: UNVERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: UNVERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: UNVERIFIED, nextState: REJECTED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: VERIFIED, nextState: UNVERIFIED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: VERIFIED, nextState: ASSIGNED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: VERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: VERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: VERIFIED, nextState: REJECTED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: UNVERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: VERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: UNVERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: VERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: UNVERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: VERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: PROCESSING, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: UNVERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: VERIFIED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: UNVERIFIED, nextState: VERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: UNVERIFIED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: UNVERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: UNVERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: UNVERIFIED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: VERIFIED, nextState: UNVERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: VERIFIED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: VERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: VERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: VERIFIED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: UNVERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: VERIFIED, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: UNVERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: VERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: RESOLVED, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: UNVERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: VERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: UNVERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: VERIFIED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: UNVERIFIED, nextState: VERIFIED, expectedResult: false },
      { role: USER, prevState: UNVERIFIED, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: UNVERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: UNVERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: UNVERIFIED, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: VERIFIED, nextState: UNVERIFIED, expectedResult: false },
      { role: USER, prevState: VERIFIED, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: VERIFIED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: VERIFIED, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: VERIFIED, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: UNVERIFIED, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: VERIFIED, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: UNVERIFIED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: VERIFIED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: UNVERIFIED, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: VERIFIED, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: REJECTED, nextState: UNVERIFIED, expectedResult: false },
      { role: USER, prevState: REJECTED, nextState: VERIFIED, expectedResult: false },
      { role: USER, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
    ];
    /* eslint-enable */

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      expect(PinTransitionService.isValidStateTransition(
          testCase.prevState, testCase.nextState, testCase.role
      )).to.equal(testCase.expectedResult);
    }
  });

  describe('Transition check', () => {
    let pin;

    beforeEach(() => {
      pin = {
        _id: ObjectId('579334c75563625d62811111'), // eslint-disable-line new-cap
        detail: 'Mock Pin',
        organization: '57933111556362511181aaa1', // organization ObjectId
        owner: '579334c75563625d6281b6f1', // adminUser ObjectId
        provider: '579334c75563625d6281b6f1', // adminUser ObjectId
        location: {
          coordinates: [100.56983534303, 13.730537951109],
        },
        status: 'verified',
        is_archived: false,
      };
    });

    it('updates correct properties for `unverified` transtion', (done) => {
      pin._id = ObjectId('579334c75563625d62811111'); // eslint-disable-line no-underscore-dangle,new-cap,max-len
      pin.status = 'verified';

      new PinModel(pin).save((err, savedPin) => {
        if (err) {
          return done(err);
        }

        return request(app)
        .post('/auth/local')
        .set('Content-type', 'application/json')
        .send({
          email: 'super_admin@youpin.city',
          password: 'youpin_admin',
        })
        .then((loginResp) => {
          const token = loginResp.body.token;

          return request(app)
          .post(`/pins/${savedPin._id}/state_transition`) // eslint-disable-line no-underscore-dangle,max-len
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: 'unverified',
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal('unverified');
          expect(transition.pinId).to.equal(String(savedPin._id)); // eslint-disable-line no-underscore-dangle,max-len

          return PinModel.findOne({ _id: savedPin._id }); // eslint-disable-line no-underscore-dangle,max-len
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal('unverified');

          done();
        });
      });
    });

    it('updates correct properties for `verified` transtion', (done) => {
      pin._id = ObjectId('579334c75563625d62811112'); // eslint-disable-line no-underscore-dangle,new-cap,max-len
      pin.status = 'unverified';

      new PinModel(pin).save((err, savedPin) => {
        if (err) {
          return done(err);
        }

        return request(app)
        .post('/auth/local')
        .set('Content-type', 'application/json')
        .send({
          email: 'super_admin@youpin.city',
          password: 'youpin_admin',
        })
        .then((loginResp) => {
          const token = loginResp.body.token;

          return request(app)
          .post(`/pins/${savedPin._id}/state_transition`) // eslint-disable-line no-underscore-dangle,max-len
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: 'verified',
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal('verified');
          expect(transition.pinId).to.equal(String(savedPin._id)); // eslint-disable-line no-underscore-dangle,max-len

          return PinModel.findOne({ _id: savedPin._id }); // eslint-disable-line no-underscore-dangle,max-len
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal('verified');

          done();
        });
      });
    });

    it('updates correct properties for `rejected` transtion', (done) => {
      pin._id = ObjectId('579334c75563625d62811113'); // eslint-disable-line no-underscore-dangle,new-cap,max-len
      pin.status = 'unverified';

      new PinModel(pin).save((err, savedPin) => {
        if (err) {
          return done(err);
        }

        return request(app)
        .post('/auth/local')
        .set('Content-type', 'application/json')
        .send({
          email: 'super_admin@youpin.city',
          password: 'youpin_admin',
        })
        .then((loginResp) => {
          const token = loginResp.body.token;

          return request(app)
          .post(`/pins/${savedPin._id}/state_transition`) // eslint-disable-line no-underscore-dangle,max-len
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: 'rejected',
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal('rejected');
          expect(transition.pinId).to.equal(String(savedPin._id)); // eslint-disable-line no-underscore-dangle,max-len

          return PinModel.findOne({ _id: savedPin._id }); // eslint-disable-line no-underscore-dangle,max-len
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal('rejected');

          done();
        });
      });
    });

    it('updates correct properties for `assigned` transtion', (done) => {
      pin._id = ObjectId('579334c75563625d62811114'); // eslint-disable-line no-underscore-dangle,new-cap,max-len
      pin.status = 'unverified';

      new PinModel(pin).save((err, savedPin) => {
        if (err) {
          return done(err);
        }

        return request(app)
        .post('/auth/local')
        .set('Content-type', 'application/json')
        .send({
          email: 'super_admin@youpin.city',
          password: 'youpin_admin',
        })
        .then((loginResp) => {
          const token = loginResp.body.token;

          return request(app)
          .post(`/pins/${savedPin._id}/state_transition`) // eslint-disable-line no-underscore-dangle,max-len
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: 'assigned',
            assigned_department: '57933111556362511181ccc1',
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal('assigned');
          expect(transition.assigned_department).to.equal('57933111556362511181ccc1');
          expect(transition.pinId).to.equal(String(savedPin._id)); // eslint-disable-line no-underscore-dangle,max-len

          return PinModel.findOne({ _id: savedPin._id }); // eslint-disable-line no-underscore-dangle,max-len
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal('assigned');
          expect(String(updatedPin.assigned_department)).to.equal('57933111556362511181ccc1');

          done();
        });
      });
    });

    it('updates correct properties for `processing` transtion', (done) => {
      pin._id = ObjectId('579334c75563625d62811115'); // eslint-disable-line no-underscore-dangle,new-cap,max-len
      pin.status = 'assigned';

      new PinModel(pin).save((err, savedPin) => {
        if (err) {
          return done(err);
        }

        return request(app)
        .post('/auth/local')
        .set('Content-type', 'application/json')
        .send({
          email: 'department_head@youpin.city',
          password: 'youpin_admin',
        })
        .then((loginResp) => {
          const token = loginResp.body.token;

          return request(app)
          .post(`/pins/${savedPin._id}/state_transition`) // eslint-disable-line no-underscore-dangle,max-len
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: 'processing',
            processed_by: '579334c75553625d6281b6cc',
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal('processing');
          expect(transition.processed_by).to.equal('579334c75553625d6281b6cc');
          expect(transition.pinId).to.equal(String(savedPin._id)); // eslint-disable-line no-underscore-dangle,max-len

          return PinModel.findOne({ _id: savedPin._id }); // eslint-disable-line no-underscore-dangle,max-len
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal('processing');
          expect(String(updatedPin.processed_by)).to.equal('579334c75553625d6281b6cc');

          done();
        });
      });
    });

    it('updates correct properties for `resolved` transtion', (done) => {
      pin._id = ObjectId('579334c75563625d62811116'); // eslint-disable-line no-underscore-dangle,new-cap,max-len
      pin.status = 'processing';

      new PinModel(pin).save((err, savedPin) => {
        if (err) {
          return done(err);
        }

        return request(app)
        .post('/auth/local')
        .set('Content-type', 'application/json')
        .send({
          email: 'department_head@youpin.city',
          password: 'youpin_admin',
        })
        .then((loginResp) => {
          const token = loginResp.body.token;

          return request(app)
          .post(`/pins/${savedPin._id}/state_transition`) // eslint-disable-line no-underscore-dangle,max-len
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: 'resolved',
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal('resolved');
          expect(transition.pinId).to.equal(String(savedPin._id)); // eslint-disable-line no-underscore-dangle,max-len

          return PinModel.findOne({ _id: savedPin._id }); // eslint-disable-line no-underscore-dangle,max-len
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal('resolved');

          done();
        });
      });
    });
  });
});
