'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('app3rd service', function() {
  it('registered the app3rds service', () => {
    assert.ok(app.service('app3rds'));
  });
});
