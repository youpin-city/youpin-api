'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('photo service', function() {
  it('registered the photos service', () => {
    assert.ok(app.service('photos'));
  });
});
