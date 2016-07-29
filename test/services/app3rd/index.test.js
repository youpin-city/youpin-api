// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('app3rd service', () => {
  it('registered the app3rds service', () => {
    expect(app.service('app3rds')).to.be.ok();
  });
});
