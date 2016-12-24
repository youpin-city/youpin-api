// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;
const loadFixture = require('../../../test_helper').loadFixture;
const stub = require('../../../test_helper').stub;

// Models
const PinModel = require('../../../../src/services/pin/pin-model');

// Fixtures
const pins = require('../../../fixtures/pins');
const adminUser = require('../../../fixtures/admin_user');

// App stuff
const mongoose = require('mongoose');
const actions = require('../../../../src/constants/actions');
const prepareActivityLog = require('../../../../src/services/pin/hooks/prepare-activity-log'); // eslint-disable-line max-len

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
      id: pins[0]._id, // eslint-disable-line no-underscore-dangle
      params: {
        user: {
          name: adminUser.name,
        },
      },
      result: {},
      data: {
        $push: {
          progresses: {
            photos: ['New progress photo url'],
            detail: 'New progress',
          },
        },
        owner: adminUser._id, // eslint-disable-line no-underscore-dangle
        detail: 'Updated pin detail',
        location: {
          coordinates: [15, 15.9],
          type: ['Point'],
        },
      },
    };
  });

  it('attaches logInfo to hook.data', (done) => {
    const pinId = pins[0]._id; // eslint-disable-line no-underscore-dangle

    const dateStub = stub(Date, 'now', () => '2016-11-25');

    prepareActivityLog()(mockHook)
    .then(() => {
      // location
      const previousLocation = pins[0].location.coordinates.toString();
      const newLocation = mockHook.data.location.coordinates.toString();
      // detail
      const previousDetail = pins[0].detail;
      const newDetail = mockHook.data.detail;
      // progress detail
      const newProgressDetail = mockHook.data.$push.progresses.detail;
      // description
      const expectedDescription =
        `${adminUser.name} edited following field:\n` +
        ` - Edit [detail] from "${previousDetail}" to "${newDetail}"\n` +
        ` - Edit [location] from "${previousLocation}" to "${newLocation}"\n` +
        `${adminUser.name} added more data to following field:\n` +
        ` - Add [progresses] with "${newProgressDetail}"`;
      const expectedLogInfo = {
        user: adminUser.name,
        organization: mongoose.Types.ObjectId(pins[0].organization), // eslint-disable-line new-cap,max-len
        department: mongoose.Types.ObjectId(pins[0].assigned_department), // eslint-disable-line new-cap,max-len
        actionType: actions.types.METADATA,
        action: actions.UPDATE_PIN,
        pin_id: pinId,
        changed_fields: ['detail', 'location', 'progresses'],
        previous_values: [previousDetail, previousLocation, ''],
        updated_values: [newDetail, newLocation, newProgressDetail],
        description: expectedDescription,
        timestamp: Date.now(),
      };
      expect(mockHook.data.logInfo).to.deep.equal(expectedLogInfo);

      dateStub.restore();
      done();
    });
  });
});

