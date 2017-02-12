// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;

// App stuff
const process = require('../../../../src/services/pin/hooks/process');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin process hook', () => {
  it('hook can be used', () => {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {},
    };

    process()(mockHook);

    expect(mockHook.process).to.be.ok();
  });
});
