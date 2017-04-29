// Test helper functions
const {
  assertTestEnv,
  expect,
} = require('../../test_helper');

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin service', () => {
  it('registered the pins service', () => {
    expect(app.service('pins')).to.be.ok();
  });
});
