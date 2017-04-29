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
const PIN_ASSIGNED_ID = require('../../../fixtures/constants').PIN_ASSIGNED_ID;
const PIN_PENDING_ID = require('../../../fixtures/constants').PIN_PENDING_ID;

// App stuff
const mongoose = require('mongoose');
const actions = require('../../../../src/constants/actions');
const prepareActivityLog = require('../../../../src/services/pin-merging/hooks/prepare-activity-log'); // eslint-disable-line max-len

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Prepare Activity Log Hook for Pin Merging', () => {
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
        pinId: PIN_PENDING_ID,
        user: {
          name: 'Aunt You-pin',
          department: mongoose.Types.ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap,max-len
        },
      },
      result: {},
      data: {
        mergedParentPin: PIN_ASSIGNED_ID,
      },
    };
  });

  it('attaches logInfo to hook.data', (done) => {
    const dateStub = stub(Date, 'now', () => '2016-12-24');

    prepareActivityLog()(mockHook)
    .then(() => {
      const expectedLogInfo = {
        user: 'Aunt You-pin',
        organization: mongoose.Types.ObjectId(ORGANIZATION_ID), // eslint-disable-line new-cap
        department: mongoose.Types.ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap
        actionType: actions.types.MERGING,
        action: actions.MERGE_PIN,
        pin_id: PIN_PENDING_ID,
        changed_fields: ['is_merged', 'merged_parent_pin'],
        previous_values: [false, undefined],
        updated_values: [true, PIN_ASSIGNED_ID],
        description: `Aunt You-pin merged pin #${PIN_PENDING_ID} ` +
                     `into #${PIN_ASSIGNED_ID}`,
        timestamp: Date.now(),
      };

      expect(mockHook.data.logInfo).to.deep.equal(expectedLogInfo);

      dateStub.restore();
      done();
    });
  });
});
