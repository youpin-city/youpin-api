'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('searchnearby service', function() {
  it('registered the searchnearbies service', () => {
    assert.ok(app.service('searchnearbies'));
  });
});
