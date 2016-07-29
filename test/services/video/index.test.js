'use strict';

const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;

const app = require('../../../src/app');
const mongoose = require('mongoose')
const VideoModel = require('../../../src/services/video/video-model.js');;

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('video service', function() {
  let server;

  before((done) => {
    server = app.listen(9100);
    server.once('listening', () => done());
  });

  beforeEach((done) => {
    VideoModel.remove({}, done);
  });

  after((done) => {
    // Clears collection after finishing all tests.
    server.close((err) => {
      if (err) { throw err; }
      VideoModel
        .remove({})
        .then(() => VideoModel.remove({}, done));
    });
  });

  it('registered the videos service', () => {
    expect(app.service('videos')).to.be.ok();
  });
});
