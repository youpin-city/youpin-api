'use strict';

const expect = require('chai').expect;
const assert = require('assert');
const errors = require('feathers-errors');
const mongoose = require('mongoose');
const app = require('../../../src/app');

const pins = app.service('pins');

describe('pin service', function() {

  it('registered the pins service', () => {
    assert.ok(pins);
  });

  describe('GET', function() {
    it('returns 404 Not Found when id is not ObjectId', function(done) {
      const id = '1234';
      expect(mongoose.Types.ObjectId.isValid(id)).to.equal(false);

      pins.get('1234', {})
      .then(() => done(new Error('Should not be successful')))
      .catch(error => {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal('NotFound');
        expect(error.message).to.equal('No record found for id \'1234\'');
        done();
      });
    });
  });
});
