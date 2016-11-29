// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');
const _ = require('lodash');

// Models
const ActivityLogModel = require('../../../src/services/activity-log/activity-log-model');

// Fixture
const activityLogs = require('../../fixtures/activity_logs');

// App staff
const app = require('../../../src/app');
const actions = require('../../../src/constants/actions');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('summary service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Load activity log fixture
      loadFixture(ActivityLogModel, activityLogs)
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
    ActivityLogModel.remove({})
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

  it('end-to-end triggered the calculation and returned the correct summary',
    (done) => request(app)
      .get('/summaries')
      .query({ trigger: true })
      .query({ organization: 'Chulalongkorn' })
      .query({ start_date: '2016-11-25' })
      .query({ end_date: '2016-11-26' })
      .expect(200)
      .then((summaryResponse) => {
        const summaries = summaryResponse.body;
        // Expect number to be equal to number of date in this organization data.
        expect(summaries.total).to.equal(2);
        // Change array to dictionary (key is a date).
        const summaryListByDate = _.keyBy(summaries.data, 'date');
        const expectedResultNov25ChulaEngineering = {
          [actions.VERIFY]: 0,
          [actions.UNVERIFY]: 0,
          [actions.ASSIGN]: 2,
          [actions.DENY]: 0,
          [actions.PROCESS]: 1,
          [actions.RESOLVE]: 0,
          [actions.REJECT]: 0,
        };
        expect(summaryListByDate['2016-11-25'].by_department.Engineering)
          .to.deep.equal(expectedResultNov25ChulaEngineering);
        const expectedResultNov25ChulaMedicine = {
          [actions.VERIFY]: 0,
          [actions.UNVERIFY]: 0,
          [actions.ASSIGN]: 0,
          [actions.DENY]: 0,
          [actions.PROCESS]: 1,
          [actions.RESOLVE]: 0,
          [actions.REJECT]: 0,
        };
        expect(summaryListByDate['2016-11-25'].by_department.Medicine)
          .to.deep.equal(expectedResultNov25ChulaMedicine);
        const expectedResultNov26ChulaEngineering = {
          [actions.VERIFY]: 0,
          [actions.UNVERIFY]: 0,
          [actions.ASSIGN]: 2,
          [actions.DENY]: 0,
          [actions.PROCESS]: 1,
          [actions.RESOLVE]: 1,
          [actions.REJECT]: 0,
        };
        expect(summaryListByDate['2016-11-26'].by_department.Engineering)
          .to.deep.equal(expectedResultNov26ChulaEngineering);
        done();
      })
  );
});
