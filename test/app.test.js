// Test helper functions
const assertTestEnv = require('./test_helper').assertTestEnv;
const expect = require('./test_helper').expect;
const request = require('request');

// App stuff
const app = require('../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Feathers application tests', function() {
  before(function(done) {
    this.server = app.listen(3030);
    this.server.once('listening', () => done());
  });

  after(function(done) {
    this.server.close(done);
  });

  it('starts and shows the index page', function(done) {
    request('http://localhost:3030', function(err, res, body) {
      expect(body.indexOf('<html>') !== -1).to.be.ok();
      done(err);
    });
  });

  describe('404', function() {
    it('shows a 404 HTML page', function(done) {
      request({
        url: 'http://localhost:3030/path/to/nowhere',
        headers: {
          'Accept': 'text/html'
        }
      }, function(err, res, body) {
        expect(res.statusCode).to.equal(404);
        expect(body.indexOf('<html>') !== -1).to.be.ok();
        done(err);
      });
    });

    it('shows a 404 JSON error without stack trace', function(done) {
      request({
        url: 'http://localhost:3030/path/to/nowhere',
        json: true
      }, function(err, res, body) {
        expect(res.statusCode).to.equal(404);
        expect(body.code).to.equal(404);
        expect(body.message).to.equal('Page not found');
        expect(body.name).to.equal('NotFound');
        done(err);
      });
    });
  });
});
