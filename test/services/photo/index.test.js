'use strict';

const assertTestEnv = require('../../test_helper').assertTestEnv;

const assert = require('assert');
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('photo service', function() {
  it('registered the photos service', () => {
    assert.ok(app.service('photos'));
  });
});
