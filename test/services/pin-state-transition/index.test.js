// Test helper functions
const request = require('supertest-as-promised');
const {
  assertTestEnv,
  expect,
  loadFixture,
  login,
  stub,
} = require('../../test_helper');

// Models
const Department = require('../../../src/services/department/department-model');
const Pin = require('../../../src/services/pin/pin-model');
const User = require('../../../src/services/user/user-model');

// Fixture
const departmentHeadUser = require('../../fixtures/department_head_user');
const departmentsOfficerUser = require('../../fixtures/department_officer_user');
const departments = require('../../fixtures/departments');
const organizationAdminUser = require('../../fixtures/organization_admin_user');
const pins = require('../../fixtures/pins');
const superAdminUser = require('../../fixtures/super_admin_user');

// App stuff
const app = require('../../../src/app');
const PinTransitionService = require('../../../src/services/pin-state-transition').PinTransitionService; // eslint-disable-line max-len

// States
const {
  ASSIGNED,
  PENDING,
  PROCESSING,
  RESOLVED,
  REJECTED,
} = require('../../../src/constants/pin-states');

// Roles
const {
  DEPARTMENT_HEAD,
  DEPARTMENT_OFFICER,
  EXECUTIVE_ADMIN,
  ORGANIZATION_ADMIN,
  SUPER_ADMIN,
  USER,
} = require('../../../src/constants/roles');

// Fixtures' constants
const {
  PIN_PENDING_ID,
  PIN_ASSIGNED_ID,
  PIN_PROCESSING_ID,
  PIN_RESOLVED_ID,
  PIN_REJECTED_ID,
} = require('../../fixtures/constants');

// Stubs
const STUBBED_DATE = '2017-01-29';

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin state transtion service', () => {
  let server;
  let dateStub;

  beforeEach((done) => {
    // enable role permission
    app.set('enableStateTransitionCheck', true);
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(Department, departments),
        loadFixture(User, superAdminUser),
        loadFixture(User, organizationAdminUser),
        loadFixture(User, departmentHeadUser),
        loadFixture(User, departmentsOfficerUser),
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

  afterEach((done) => {
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

  it('registered the pin state transition service', () => {
    expect(app.service('/pins/:pinId/state_transition')).to.be.ok();
  });

  it('correctly authorizes each role for state transition', () => {
    /* eslint-disable max-len */
    const testCases = [
      { role: SUPER_ADMIN, prevState: PENDING, nextState: ASSIGNED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: PENDING, nextState: REJECTED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: PENDING, nextState: PROCESSING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PENDING, nextState: RESOLVED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: PENDING, expectedResult: true },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: true },
      { role: SUPER_ADMIN, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: PENDING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: PROCESSING, nextState: RESOLVED, expectedResult: true },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: PENDING, expectedResult: true },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: RESOLVED, nextState: PROCESSING, expectedResult: true },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: PENDING, expectedResult: true },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: SUPER_ADMIN, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PENDING, nextState: ASSIGNED, expectedResult: true },
      { role: EXECUTIVE_ADMIN, prevState: PENDING, nextState: PROCESSING, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PENDING, nextState: RESOLVED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PENDING, nextState: REJECTED, expectedResult: true },
      { role: EXECUTIVE_ADMIN, prevState: ASSIGNED, nextState: PENDING, expectedResult: true },
      { role: EXECUTIVE_ADMIN, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PROCESSING, nextState: PENDING, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: RESOLVED, nextState: PENDING, expectedResult: true },
      { role: EXECUTIVE_ADMIN, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: RESOLVED, nextState: PROCESSING, expectedResult: true },
      { role: EXECUTIVE_ADMIN, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: REJECTED, nextState: PENDING, expectedResult: true },
      { role: EXECUTIVE_ADMIN, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: EXECUTIVE_ADMIN, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PENDING, nextState: ASSIGNED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: PENDING, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PENDING, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PENDING, nextState: REJECTED, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: PENDING, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: PENDING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: PENDING, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: PROCESSING, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: PENDING, expectedResult: true },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: ORGANIZATION_ADMIN, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PENDING, nextState: ASSIGNED, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: PENDING, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PENDING, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PENDING, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: PENDING, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: PENDING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: RESOLVED, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: PENDING, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: PENDING, expectedResult: true },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_HEAD, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PENDING, nextState: ASSIGNED, expectedResult: true },
      { role: DEPARTMENT_OFFICER, prevState: PENDING, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PENDING, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PENDING, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: ASSIGNED, nextState: PENDING, expectedResult: true },
      { role: DEPARTMENT_OFFICER, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PROCESSING, nextState: PENDING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: RESOLVED, nextState: PENDING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: RESOLVED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: REJECTED, nextState: PENDING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: REJECTED, nextState: ASSIGNED, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: REJECTED, nextState: PROCESSING, expectedResult: false },
      { role: DEPARTMENT_OFFICER, prevState: REJECTED, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: PENDING, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: PENDING, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: PENDING, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: PENDING, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: PENDING, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: ASSIGNED, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: PENDING, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: RESOLVED, expectedResult: false },
      { role: USER, prevState: PROCESSING, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: PENDING, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: ASSIGNED, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: PROCESSING, expectedResult: false },
      { role: USER, prevState: RESOLVED, nextState: REJECTED, expectedResult: false },
      { role: USER, prevState: REJECTED, nextState: PENDING, expectedResult: false },
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
    it('test incorrect transition', (done) =>
      login(app, 'super_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;
        return request(app)
        .post(`/pins/${PIN_PENDING_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: RESOLVED,
        })
        .expect(400);
      })
      .then((stateResp) => {
        expect(stateResp.body.message)
          .to.equal('Cannot change state from pending to resolved with role super_admin');
        done();
      })
    );

    it('updates correct properties for `rejected` transtion ' +
       'from `pending` to `rejected` state', (done) =>
      login(app, 'super_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;
        dateStub = stub(Date, 'now', () => STUBBED_DATE);

        return request(app)
        .post(`/pins/${PIN_PENDING_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: REJECTED,
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(REJECTED);
        expect(transition.pinId).to.equal(String(PIN_PENDING_ID));

        return Pin.findOne({ _id: PIN_PENDING_ID });
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(REJECTED);
        expect(updatedPin.rejected_time.toISOString().split('T')[0])
          .to.equal(STUBBED_DATE);

        dateStub.restore();
        done();
      })
    );

    it('updates correct properties for `assigned` transtion ' +
       'from `pending` to `assigned` state', (done) =>
      login(app, 'super_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;
        dateStub = stub(Date, 'now', () => STUBBED_DATE);

        return request(app)
        .post(`/pins/${PIN_PENDING_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: ASSIGNED,
          assigned_department: '57933111556362511181ccc1',
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(ASSIGNED);
        expect(transition.assigned_department).to.equal('57933111556362511181ccc1');
        expect(transition.pinId).to.equal(String(PIN_PENDING_ID));

        return Pin.findOne({ _id: PIN_PENDING_ID });
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(ASSIGNED);
        expect(String(updatedPin.assigned_department._id)) // eslint-disable-line no-underscore-dangle,max-len
          .to.equal('57933111556362511181ccc1');
        expect(updatedPin.assigned_time.toISOString().split('T')[0])
          .to.equal(STUBBED_DATE);

        dateStub.restore();
        done();
      })
    );

    it('updates correct properties for `deny` transtion ' +
       'from `assigned` to `pending` state', (done) =>
      login(app, 'super_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;

        return request(app)
        .post(`/pins/${PIN_ASSIGNED_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: PENDING,
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(PENDING);
        expect(transition.assigned_department).to.equal(null);
        expect(transition.pinId).to.equal(String(PIN_ASSIGNED_ID));

        return Pin.findOne({ _id: PIN_ASSIGNED_ID });
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(PENDING);
        expect(updatedPin.assigned_department)
          .to.equal(null);

        // It should not remove previously assigned time
        expect(updatedPin.assigned_time.toISOString().split('T')[0])
          .to.equal('2015-12-04');

        dateStub.restore();
        done();
      })
    );

    it('updates correct properties for `process` transtion ' +
       'from `assigned` to `processing` state', (done) =>
      login(app, 'department_head@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;
        dateStub = stub(Date, 'now', () => STUBBED_DATE);

        return request(app)
        .post(`/pins/${PIN_ASSIGNED_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: 'processing',
          processed_by: '579334c75553625d6281b6cc',
          assigned_users: [
            '579334c75553625d6281b6cc',
            '579334c75553625d6281b6cd',
            '579334c75553625d6281b6ce',
          ],
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(PROCESSING);
        expect(transition.processed_by).to.equal('579334c75553625d6281b6cc');
        expect(transition.assigned_users).to.deep.equal([
          '579334c75553625d6281b6cc',
          '579334c75553625d6281b6cd',
          '579334c75553625d6281b6ce',
        ]);
        expect(transition.pinId).to.equal(String(PIN_ASSIGNED_ID));

        return Pin.findOne({ _id: PIN_ASSIGNED_ID });
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(PROCESSING);
        expect(String(updatedPin.processed_by)).to.equal('579334c75553625d6281b6cc');
        expect(updatedPin.processing_time.toISOString().split('T')[0])
          .to.equal(STUBBED_DATE);

        dateStub.restore();
        done();
      })
    );

    it('updates correct properties for `re-process` transtion ' +
       'from `resolved` to `processing` state', (done) =>
      login(app, 'organization_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;

        return request(app)
        .post(`/pins/${PIN_RESOLVED_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: PROCESSING,
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(PROCESSING);
        expect(transition.pinId).to.equal(String(PIN_RESOLVED_ID));

        return Pin.findOne({ _id: PIN_RESOLVED_ID });
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(PROCESSING);
        expect(updatedPin.resolved_time).to.equal(null);

        done();
      })
    );

    it('updates correct properties for `resolved` transtion ' +
       'from `processing` to `resolved` state', (done) =>
        login(app, 'department_head@youpin.city', 'youpin_admin')
        .then((loginResp) => {
          const token = loginResp.body.token;
          dateStub = stub(Date, 'now', () => STUBBED_DATE);

          return request(app)
          .post(`/pins/${PIN_PROCESSING_ID}/state_transition`)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send({
            state: RESOLVED,
          })
          .expect(201);
        })
        .then((transitionResp) => {
          const transition = transitionResp.body;

          expect(transition.status).to.equal(RESOLVED);
          expect(transition.pinId).to.equal(String(PIN_PROCESSING_ID));

          return Pin.findOne({ _id: PIN_PROCESSING_ID });
        })
        .then(updatedPin => {
          expect(updatedPin.status).to.equal(RESOLVED);
          expect(updatedPin.resolved_time.toISOString().split('T')[0])
            .to.equal(STUBBED_DATE);

          dateStub.restore();
          done();
        })
    );

    it('updates correct properties for `redo` transtion ' +
       'from `resolved` to `pending` state', (done) =>
      login(app, 'organization_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;

        return request(app)
        .post(`/pins/${PIN_RESOLVED_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: PENDING,
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(PENDING);
        expect(transition.pinId).to.equal(String(PIN_RESOLVED_ID));

        return Pin.findOne({ _id: PIN_RESOLVED_ID }); // eslint-disable-line no-underscore-dangle
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(PENDING);
        expect(updatedPin.assigned_department).to.equal(null);
        expect(updatedPin.assigned_users).to.equal(null);
        expect(updatedPin.resolved_time).to.equal(null);

        done();
      })
    );

    it('updates correct properties for `redo` transtion ' +
       'from `rejected` to `pending` state', (done) =>
      login(app, 'organization_admin@youpin.city', 'youpin_admin')
      .then((loginResp) => {
        const token = loginResp.body.token;

        return request(app)
        .post(`/pins/${PIN_REJECTED_ID}/state_transition`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-type', 'application/json')
        .send({
          state: PENDING,
        })
        .expect(201);
      })
      .then((transitionResp) => {
        const transition = transitionResp.body;

        expect(transition.status).to.equal(PENDING);
        expect(transition.pinId).to.equal(String(PIN_REJECTED_ID));

        return Pin.findOne({ _id: PIN_REJECTED_ID }); // eslint-disable-line no-underscore-dangle
      })
      .then(updatedPin => {
        expect(updatedPin.status).to.equal(PENDING);
        expect(updatedPin.assigned_department).to.equal(undefined);
        expect(updatedPin.rejected_time).to.equal(null);

        done();
      })
    );
  });
});
