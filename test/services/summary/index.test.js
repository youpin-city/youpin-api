const assert = require('assert');
const app = require('../../../src/app');

describe('summary service', () => {
  it('registered the summaries service', () => {
    assert.ok(app.service('summaries'));
  });
});
