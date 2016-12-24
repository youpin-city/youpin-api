// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;
const loadFixture = require('../../../test_helper').loadFixture;
const stub = require('../../../test_helper').stub;

// Models
const PinModel = require('../../../../src/services/pin/pin-model');

// Fixtures
const pins = require('../../../fixtures/pins');
const ASSIGNED_PIN_ID = require('../../../fixtures/constants').ASSIGNED_PIN_ID;
const ASSIGNED_PIN_DETAIL = require('../../../fixtures/constants').ASSIGNED_PIN_DETAIL;
const VERIFIED_PIN_ID = require('../../../fixtures/constants').VERIFIED_PIN_ID;
const VERIFIED_PIN_DETAIL = require('../../../fixtures/constants').VERIFIED_PIN_DETAIL;
const ORGANIZATION_ID = require('../../../fixtures/constants').ORGANIZATION_ID;
const NORMAL_DEPARTMENT_ID = require('../../../fixtures/constants').NORMAL_DEPARTMENT_ID;

// App stuff
const mongoose = require('mongoose');
const actions = require('../../../../src/constants/actions');
const prepareActivityLog = require('../../../../src/services/pin-merging/hooks/prepare-activity-log'); // eslint-disable-line max-len

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Prepare Activity Log Hook for Pin Merging', () => {
  let mockHook;

  before((done) => {
    loadFixture(PinModel, pins)
    .then(() => done())
    .catch(err => done(err));
  });

  after((done) => {
    PinModel.remove({})
    .then(() => done())
    .catch(err => done(err));
  });

  beforeEach(() => {
    mockHook = {
      type: 'before',
      app: {},
      params: {
        pinId: VERIFIED_PIN_ID,
        user: {
          name: 'Aunt You-pin',
          departments: [mongoose.Types.ObjectId(NORMAL_DEPARTMENT_ID)], // eslint-disable-line new-cap,max-len
        },
      },
      result: {},
      data: {
        mergedParentPin: ASSIGNED_PIN_ID,
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
        department: [mongoose.Types.ObjectId(NORMAL_DEPARTMENT_ID)], // eslint-disable-line new-cap
        actionType: actions.types.MERGING,
        action: actions.MERGE_PIN,
        pin_id: VERIFIED_PIN_ID,
        changed_fields: ['is_merged', 'merged_parent_pin'],
        previous_values: [false, undefined],
        updated_values: [true, ASSIGNED_PIN_ID],
        description: `Aunt You-pin merged pin ${VERIFIED_PIN_DETAIL.substring(0, 20)}... ` +
                     `to ${ASSIGNED_PIN_DETAIL.substring(0, 20)}...`,
        timestamp: Date.now(),
      };

      expect(mockHook.data.logInfo).to.deep.equal(expectedLogInfo);

      dateStub.restore();
      done();
    });
  });
});
