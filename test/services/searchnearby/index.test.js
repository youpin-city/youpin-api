'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('searchnearby service', function() {
  it('registered the searchnearby service', () => {
    assert.ok(app.service('searchnearby'));
  });
});
