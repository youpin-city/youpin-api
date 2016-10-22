const assert = require('assert');
const app = require('../../../src/app');

describe('department service', () => {
  it('registered the departments service', () => {
    assert.ok(app.service('departments'));
  });
});
