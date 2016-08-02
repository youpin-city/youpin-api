// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('photo service', () => {
  it('registered the photos service', () => {
    expect(app.service('photos')).to.be.ok();
  });
});
