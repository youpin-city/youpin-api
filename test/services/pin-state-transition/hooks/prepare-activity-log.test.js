// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;
const loadFixture = require('../../../test_helper').loadFixture;
const stub = require('../../../test_helper').stub;

// Models
const Department = require('../../../../src/services/department/department-model');
const Pin = require('../../../../src/services/pin/pin-model');

// Fixtures
const departments = require('../../../fixtures/departments');
const pins = require('../../../fixtures/pins');
const DEPARTMENT_GENERAL_ID = require('../../../fixtures/constants').DEPARTMENT_GENERAL_ID;
const ORGANIZATION_ID = require('../../../fixtures/constants').ORGANIZATION_ID;
const PIN_UNVERIFIED_ID = require('../../../fixtures/constants').PIN_UNVERIFIED_ID;

// App stuff
const ObjectId = require('mongoose').Types.ObjectId;
const actions = require('../../../../src/constants/actions');
const prepareActivityLog = require('../../../../src/services/pin-state-transition/hooks/prepare-activity-log'); // eslint-disable-line max-len

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Prepare Activity Log Hook for State Transition', () => {
  let mockHook;

  before((done) => {
    Promise.all([
      loadFixture(Department, departments),
      loadFixture(Pin, pins),
    ])
    .then(() => done())
    .catch(err => done(err));
  });

  after((done) => {
    Promise.all([
      Pin.remove({}),
      Department.remove({}),
    ])
    .then(() => done())
    .catch(err => done(err));
  });

  beforeEach(() => {
    mockHook = {
      type: 'before',
      app: {},
      params: {
        // pins[0] is in unverified state
        pinId: ObjectId(PIN_UNVERIFIED_ID), // eslint-disable-line new-cap
        user: {
          name: 'Aunt You-pin',
          department: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap,max-len
        },
      },
      result: {},
      data: {
        state: 'verified',
      },
    };
  });

  it('attaches logInfo to hook.data', (done) => {
    const pinId = ObjectId(PIN_UNVERIFIED_ID); // eslint-disable-line new-cap

    const dateStub = stub(Date, 'now', () => '2016-11-25');

    prepareActivityLog()(mockHook)
    .then(() => {
      const expectedLogInfo = {
        user: 'Aunt You-pin',
        organization: ObjectId(ORGANIZATION_ID), // eslint-disable-line new-cap,max-len
        department: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap,max-len
        actionType: actions.types.STATE_TRANSITION,
        action: actions.VERIFY,
        pin_id: pinId,
        changed_fields: ['status'],
        previous_values: ['unverified'],
        updated_values: ['verified'],
        description: `Aunt You-pin verified pin ${pins[0].detail.substring(0, 20)}...`,
        timestamp: Date.now(),
      };

      expect(mockHook.data.logInfo).to.deep.equal(expectedLogInfo);

      dateStub.restore();
      done();
    });
  });

  it('attaches previous status to hook.data', (done) => {
    prepareActivityLog()(mockHook)
    .then(() => {
      expect(mockHook.data.previousState).to.equal('unverified');

      done();
    });
  });
});
