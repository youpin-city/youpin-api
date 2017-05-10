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

// Constants
const {
  DEPARTMENT_GENERAL_ID,
  ORGANIZATION_ID,
  PIN_PENDING_ID,
} = require('../../../fixtures/constants');
const DEPARTMENT_GENERAL_OBJECT = require('../../../fixtures/departments')[1];

// App stuff
const ObjectId = require('mongoose').Types.ObjectId;
const actions = require('../../../../src/constants/actions');
const prepareActivityLog = require('../../../../src/services/pin-state-transition/hooks/prepare-activity-log'); // eslint-disable-line max-len
// Constants
const { EMAIL_NOTI_NON_ASSIGNED_TEXT } = require('../../../../src/constants/strings');

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
        // pins[0] is in pending state
        pinId: ObjectId(PIN_PENDING_ID), // eslint-disable-line new-cap
        user: {
          name: 'Aunt You-pin',
          department: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap,max-len
        },
      },
      result: {},
      data: {
        state: 'assigned',
        assigned_department: DEPARTMENT_GENERAL_ID,
      },
    };
  });

  it('attaches logInfo to hook.data', (done) => {
    const pinId = ObjectId(PIN_PENDING_ID); // eslint-disable-line new-cap

    const dateStub = stub(Date, 'now', () => '2016-11-25');

    prepareActivityLog()(mockHook)
    .then(() => {
      const expectedLogInfo = {
        user: 'Aunt You-pin',
        organization: ObjectId(ORGANIZATION_ID), // eslint-disable-line new-cap,max-len
        department: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap,max-len
        actionType: actions.types.STATE_TRANSITION,
        action: actions.ASSIGN,
        pin_id: pinId,
        changed_fields: ['status', 'assigned_department'],
        previous_values: ['pending', EMAIL_NOTI_NON_ASSIGNED_TEXT],
        updated_values: ['assigned', DEPARTMENT_GENERAL_OBJECT], // eslint-disable-line new-cap,max-len
        description: `Aunt You-pin assigned pin #${PIN_PENDING_ID} ` +
                     'to department Department of Nerds',
        timestamp: Date.now(),
      };
      const actualLogInfo = mockHook.data.logInfo;
      expect(actualLogInfo.user).to.deep.equal(expectedLogInfo.user);
      expect(actualLogInfo.organization).to.deep.equal(expectedLogInfo.organization);
      expect(actualLogInfo.department).to.deep.equal(expectedLogInfo.department);
      expect(actualLogInfo.actionType).to.deep.equal(expectedLogInfo.actionType);
      expect(actualLogInfo.action).to.deep.equal(expectedLogInfo.action);
      expect(actualLogInfo.pin_id).to.deep.equal(expectedLogInfo.pin_id);
      expect(actualLogInfo.changed_fields).to.have.length(2);
      expect(actualLogInfo.changed_fields).to.deep.equal(expectedLogInfo.changed_fields);
      expect(actualLogInfo.previous_values).to.have.length(2);
      expect(actualLogInfo.previous_values).to.deep.equal(expectedLogInfo.previous_values);
      expect(actualLogInfo.updated_values).to.have.length(2);
      expect(actualLogInfo.updated_values[0]).to.deep.equal(expectedLogInfo.updated_values[0]);
      expect(actualLogInfo.updated_values[1]._id) // eslint-disable-line no-underscore-dangle
        .to.deep.equal(expectedLogInfo.updated_values[1]._id); // eslint-disable-line no-underscore-dangle,max-len
      expect(actualLogInfo.updated_values[1].name)
        .to.deep.equal(expectedLogInfo.updated_values[1].name);
      expect(actualLogInfo.description).to.deep.equal(expectedLogInfo.description);
      expect(actualLogInfo.timestamp).to.deep.equal(expectedLogInfo.timestamp);
      expect(actualLogInfo.pin_id).to.deep.equal(expectedLogInfo.pin_id);

      dateStub.restore();
      done();
    })
    .catch(err => done(err));
  });

  it('attaches previous status to hook.data', (done) => {
    prepareActivityLog()(mockHook)
    .then(() => {
      expect(mockHook.data.previousState).to.equal('pending');

      done();
    })
    .catch(err => done(err));
  });
});
