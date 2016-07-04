'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('tempuser service', function() {
  it('registered the tempusers service', () => {
    assert.ok(app.service('tempusers'));
  });
});
