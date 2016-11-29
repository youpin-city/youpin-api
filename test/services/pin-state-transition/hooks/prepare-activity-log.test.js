// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;
const stub = require('../../../test_helper').stub;
const loadFixture = require('../../../test_helper').loadFixture;

// Models
const PinModel = require('../../../../src/services/pin/pin-model');

// Fixtures
const pins = require('../../../fixtures/pins');

// App stuff
const mongoose = require('mongoose');
const actions = require('../../../../src/constants/actions');

/* eslint-disable max-len */
const prepareActivityLog = require('../../../../src/services/pin-state-transition/hooks/prepare-activity-log');
/* eslint-enable */

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Prepare Activity Log Hook', () => {
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
        // pins[0] is in unverified state
        pinId: pins[0]._id, // eslint-disable-line no-underscore-dangle
        user: {
          name: 'Aunt You-pin',
          organization_and_department_pairs: [
            {
              organization: mongoose.Types.ObjectId('57933111556362511181aaa1'), // eslint-disable-line new-cap,max-len
              department: mongoose.Types.ObjectId('57933111556362511181bbb1'), // eslint-disable-line new-cap,max-len
            },
          ],
        },
      },
      result: {},
      data: {
        state: 'verified',
      },
    };
  });

  it('attaches logInfo to hook.data', (done) => {
    const pinId = pins[0]._id; // eslint-disable-line no-underscore-dangle

    const dateStub = stub(Date, 'now', () => '2016-11-25');

    prepareActivityLog()(mockHook)
    .then(() => {
      const expectedLogInfo = {
        user: 'Aunt You-pin',
        organization: mongoose.Types.ObjectId('57933111556362511181aaa1'), // eslint-disable-line new-cap,max-len
        department: [mongoose.Types.ObjectId('57933111556362511181bbb1')], // eslint-disable-line new-cap,max-len
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
