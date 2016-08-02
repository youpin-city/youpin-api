// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;

// Models
const VideoModel = require('../../../src/services/video/video-model.js');;

// App stuff
const app = require('../../../src/app');
const mongoose = require('mongoose')

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('video service', function() {
  let server;

  before((done) => {
    server = app.listen(9100);
    server.once('listening', () => {
      done()
    });
  });

  after((done) => {
    // Clears collection after finishing all tests.
    VideoModel.remove({})
    .then((_) => {
      server.close((err) => {
        if (err) return done(err);

        done();
      });
    });
  });

  it('registered the videos service', () => {
    expect(app.service('videos')).to.be.ok();
  });
});
