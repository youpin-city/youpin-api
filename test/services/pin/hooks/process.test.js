'use strict';

const assertTestEnv = require('../../../test_helper').assertTestEnv;

const assert = require('assert');
const process = require('../../../../src/services/pin/hooks/process.js');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('pin process hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    process()(mockHook);

    assert.ok(mockHook.process);
  });
});
