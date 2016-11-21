// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;

// Models
const UserModel = require('../../../src/services/user/user-model');
const PinModel = require('../../../src/services/pin/pin-model');
const request = require('supertest-as-promised');

// Fixtures
const adminUser = require('../../fixtures/admin_user');
const pins = require('../../fixtures/pins');

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('searchnearby service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      Promise.all([
        loadFixture(UserModel, adminUser),
        loadFixture(PinModel, pins),
      ])
      .then(() => {
        done();
      });
    });
  });

  after((done) => {
    // Clears collection after finishing all tests.
    Promise.all([
      PinModel.remove({}),
      UserModel.remove({}),
    ])
    .then(() => {
      // Close the server
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    })
    .catch((err) => {
      done(err);
    });
  });

  it('registered the searchnearby service', () => {
    expect(app.service('searchnearby')).to.be.ok();
  });

  it('returns coordinates in [lat, long] format', (done) => {
    request(app)
      // request in [lat, long] format
      .get('/searchnearby?$center=[13.730537951109,100.56983534303]&$radius=0&limit=3')
      .expect(200)
      .then((res) => {
        if (!res || !res.body.data || res.body.data.length <= 0) {
          return done(new Error('No data return'));
        }

        const expectedCoordinates = [
          [13.730537951109, 100.56983534303],
          [13.730537951108, 100.56983534304],
          [13.730537951107, 100.56983534305],
        ];

        res.body.data.forEach((pin) => {
          expect(expectedCoordinates).to.deep.include.members([pin.location.coordinates]);
        });

        return done();
      })
      .catch(done);
  });

  it('limits a number of results', (done) => {
    request(app)
      // request in [lat, long] format
      .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000&limit=2')
      .expect(200)
      .then((res) => {
        if (!res || !res.body.data || res.body.data.length <= 0) {
          return done(new Error('No data return'));
        }

        expect(res.body.data.length).to.equal(2);

        return done();
      });
  });

  it('does not allow limit as a string', (done) => {
    request(app)
      // request in [lat, long] format
      .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000&limit=abc')
      .expect(400)
      .then((res) => {
        const error = res.body;

        expect(error.code).to.equal(400);
        expect(error.name).to.equal('BadRequest');
        expect(error.message).to.equal('`limit` must be integer');

        done();
      });
  });

  it('does not allow limit as a float number', (done) => {
    request(app)
      // request in [lat, long] format
      .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000&limit=1.1')
      .expect(400)
      .then((res) => {
        const error = res.body;

        expect(error.code).to.equal(400);
        expect(error.name).to.equal('BadRequest');
        expect(error.message).to.equal('`limit` must be integer');

        done();
      });
  });

  it('does not allow $radius as a string', (done) => {
    request(app)
      // request in [lat, long] format
      .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=abc&limit=2')
      .expect(400)
      .then((res) => {
        const error = res.body;

        expect(error.code).to.equal(400);
        expect(error.name).to.equal('BadRequest');
        expect(error.message).to.equal('`$radius` must be numeric');

        done();
      });
  });
});
