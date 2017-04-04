// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const Department = require('../../../src/services/department/department-model');
const Organization = require('../../../src/services/organization/organization-model');
const Pin = require('../../../src/services/pin/pin-model');
const User = require('../../../src/services/user/user-model');

// Fixture
const departmentHeadUser = require('../../fixtures/department_head_user');
const departments = require('../../fixtures/departments');
const organizations = require('../../fixtures/organizations');
const pins = require('../../fixtures/pins');

// App staff
const app = require('../../../src/app');
const pinStates = require('../../../src/constants/pin-states');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('state summary service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Load activity log fixture
      Promise.all([
        loadFixture(Organization, organizations),
        loadFixture(Department, departments),
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
      Pin.remove({}),
      User.remove({}),
      Department.remove({}),
      Organization.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('registered the summaries service', () => {
    expect(app.service('summaries')).to.be.ok();
  });

  it('summarizes states for Chula within 1 week (2016-12-01 -> 2016-12-07)',
    (done) => request(app)
      .get('/summarize-states')
      .query({ organization: 'YouPin' })
      .query({ start_date: '2016-12-01' })
      .query({ end_date: '2016-12-07' })
      .expect(200)
      .then((summaryResponse) => {
        const summaries = summaryResponse.body;
        // Change array to dictionary (key is a department).
        const expectedResult = {
          'Department of Nerds': {
            total: {
              [pinStates.PENDING]: 0,
              [pinStates.ASSIGNED]: 1,
              [pinStates.PROCESSING]: 0,
              [pinStates.RESOLVED]: 0,
              [pinStates.REJECTED]: 0,
            },
            [departmentHeadUser.name]: {
              [pinStates.PENDING]: 0,
              [pinStates.ASSIGNED]: 1,
              [pinStates.PROCESSING]: 0,
              [pinStates.RESOLVED]: 0,
              [pinStates.REJECTED]: 0,
            },
          },
          'Admin Department': {
            total: {
              [pinStates.PENDING]: 0,
              [pinStates.ASSIGNED]: 0,
              [pinStates.PROCESSING]: 1,
              [pinStates.RESOLVED]: 1,
              [pinStates.REJECTED]: 0,
            },
            'YouPin Department Head': {
              [pinStates.PENDING]: 0,
              [pinStates.ASSIGNED]: 0,
              [pinStates.PROCESSING]: 1,
              [pinStates.RESOLVED]: 1,
              [pinStates.REJECTED]: 0,
            },
          },
          None: {
            total: {
              [pinStates.PENDING]: 1,
              [pinStates.ASSIGNED]: 0,
              [pinStates.PROCESSING]: 0,
              [pinStates.RESOLVED]: 0,
              [pinStates.REJECTED]: 1,
            },
            unassigned: {
              [pinStates.PENDING]: 1,
              [pinStates.ASSIGNED]: 0,
              [pinStates.PROCESSING]: 0,
              [pinStates.RESOLVED]: 0,
              [pinStates.REJECTED]: 1,
            },
          },
        };
        expect(summaries).to.deep.equal(expectedResult);
        done();
      })
  );
});
