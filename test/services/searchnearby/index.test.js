// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const casual = require('casual');
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;

// Models
const UserModel = require('../../../src/services/user/user-model.js');
const PinModel = require('../../../src/services/pin/pin-model.js');
const request = require('supertest-as-promised');

// Load fixtures
const adminUser = require('../../fixtures/admin_user.js');

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('searchnearby service', () => {
  let server;

  before((done) => {
    server = app.listen(9100);
    server.once('listening', () => {
      UserModel.remove({}, () => {
        loadFixture(UserModel, adminUser, done);
      });
    });
  });

  beforeEach((done) => {
    PinModel.remove({}, done);
  });

  // Clears collection after finishing all tests.
  after((done) => {
    server.close((err) => {
      if (err) {
        return done(err);
      }

      PinModel.remove({})
        .then(() => {
          done();
        });
    });
  });


  it('registered the searchnearby service', () => {
    expect(app.service('searchnearby')).to.be.ok();
  });

  it('returns coordinates in [lat, long] format', (done) => {
    const pin = {
      detail: casual.text,
      owner: '579334c75563625d6281b6f1', // adminUser ObjectId
      provider: '579334c75563625d6281b6f1', // adminUser ObjectId
      location: {
        // MongoDB stores in [long, lat]
        coordinates: [100.56983534303, 13.730537951109],
      },
    };

    loadFixture(PinModel, pin, () => {
      request(app)
        // request in [lat, long] format
        .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000')
        .expect(200)
        .then((res) => {
          if (!res || !res.body.data || res.body.data.length <= 0) {
            return done(new Error('No data return'));
          }

          const foundCoordinates = res.body.data[0].location.coordinates;
          expect(foundCoordinates).to.deep.equal([13.730537951109, 100.56983534303]);

          done();
        });
    });
  });

  it('limits a number of results', (done) => {
    const pin1 = {
      detail: casual.text,
      owner: '579334c75563625d6281b6f1', // adminUser ObjectId
      provider: '579334c75563625d6281b6f1', // adminUser ObjectId
      location: {
        coordinates: [100.56983534303, 13.730537951109],
      },
    };
    const pin2 = {
      detail: casual.text,
      owner: '579334c75563625d6281b6f1', // adminUser ObjectId
      provider: '579334c75563625d6281b6f1', // adminUser ObjectId
      location: {
        coordinates: [100.56983534303, 13.730537951109],
      },
    }
    const pin3 = {
      detail: casual.text,
      owner: '579334c75563625d6281b6f1', // adminUser ObjectId
      provider: '579334c75563625d6281b6f1', // adminUser ObjectId
      location: {
        coordinates: [100.56983534303, 13.730537951109],
      },
    };;
    loadFixture(PinModel, pin1, () => {
      loadFixture(PinModel, pin2, () => {
        loadFixture(PinModel, pin3, () => {
          request(app)
            // request in [lat, long] format
            .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000&limit=2')
            .expect(200)
            .then((res) => {
              if (!res || !res.body.data || res.body.data.length <= 0) {
                return done(new Error('No data return'));
              }

              expect(res.body.data.length).to.equal(2);

              done();
            });
        });
      });
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
