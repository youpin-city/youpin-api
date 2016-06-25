'use strict';

const assert = require('assert');
const process = require('../../../../src/services/pin/hooks/process.js');

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
