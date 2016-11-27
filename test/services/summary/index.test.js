// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;

// App staff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('summary service', () => {
  it('registered the summaries service', () => {
    expect(app.service('summaries')).to.be.ok();
  });
});
