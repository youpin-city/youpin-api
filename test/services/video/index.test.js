'use strict';

const app = require('../../../src/app');
const expect = require('../../test_helper').expect;
const mongoose = require('mongoose')
const VideoModel = require('../../../src/services/video/video-model.js');;

// Makes sure that this is actually TEST environment
console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'test') {
  console.log('Woops, you want NODE_ENV=test before you try this again!');
  process.exit(1);
}

// Makes sure that db is youpin-test
if (mongoose.connection.db.s.databaseName !== 'youpin-test') {
  console.log('Woops, it seems you are using not-for-testing database. Change it now!');
  process.exit(1);
}

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
