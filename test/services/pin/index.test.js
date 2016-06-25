'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('pin service', function() {
  it('registered the pins service', () => {
    assert.ok(app.service('pins'));
  });
});
