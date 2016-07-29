'use strict';

const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;

const app = require('../../../src/app');
const casual = require('casual');
const UserModel = require('../../../src/services/user/user-model.js');
const PinModel = require('../../../src/services/pin/pin-model.js');
const request = require('supertest-as-promised');

// load fixtures
const adminUser = require('../../fixtures/admin_user.js');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('searchnearby service', function() {
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
        throw err;
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

  it('returns coordinates in [lat, long] format', () => {
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
      return request(app)
        // request in [lat, long] format
        .get('/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000')
        .expect(200)
        .then((res) => {
          if (!res || !res.body.data || res.body.data.length <= 0) {
            throw new Error('No data return');
          }

          const foundCoordinates = res.body.data[0].location.coordinates;
          expect(foundCoordinates).to.deep.equal([13.730537951109, 100.56983534303]);
        });
    });
  });
});
