'use strict';

const assertTestEnv = require('../../test_helper').assertTestEnv;

const assert = require('assert');
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('app3rd service', function() {
  it('registered the app3rds service', () => {
    assert.ok(app.service('app3rds'));
  });
});
