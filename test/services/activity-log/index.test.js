// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('ActivityLog service', () => {
  it('registered the app3rds service', () => {
    expect(app.service('activity_logs')).to.be.ok();
  });
});
