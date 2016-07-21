const assert = require('chai').assert;
const app = require('../../../src/app');
const mongoose = require('mongoose');
const UserModel = require('../../../src/services/user/user-model.js');
const request = require('supertest-as-promised');
// bcrypt used by feathers-authentication
const crypto = require('bcryptjs');

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

function hashing(item) {
  return new Promise((resolve, reject) => {
    crypto.hash(item.password, 10, (err, hash) => {
      if (err) reject(err);
      else {
        item.password = hash;
        resolve(item);
      }
    });
  });
}

describe('user service', () => {
  let server;
  before((done) => {
    const newUser = new UserModel({
      name: 'YouPin Bot',
      phone: '081-985-2586',
      fb_id: 'youpin_bot',
      password: 'youpin_bot',
      email: 'bot@youpin.city',
      role: 'admin',
    });
    // 1. Clear User collection
    // 2. Create 1st user and do hashing
    // 3. Start server
    UserModel.remove({})
      .then(() => hashing(newUser))
      .then((hashedItem) => hashedItem.save())
      .then(() => {
        server = app.listen(9100);
        server.once('listening', () => done());
      })
      .catch((err) => {
        throw err;
      });
  });
  // Clears collection after finishing all tests.
  after((done) => {
    server.close((err) => {
      if (err) throw err;
      UserModel.remove({}, done);
    });
  });

  // Registers user service.
  it('registers the users service', () => {
    assert.ok(app.service('users'));
  });

  describe('GET', () => {
    it('return list of users', () => {
      return request(app)
        .post('/auth/local')
        .send({
          email: 'bot@youpin.city',
          password: 'youpin_bot',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            throw new Error('No token returns');
          }
          return request(app)
            .get('/users')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then((userResp) => {
              const userData = userResp.body.data[0];
              const total = userResp.body.total;
              assert.equal(total, 1, 'total user is 1');
              assert(userData.name, 'YouPin Bot', 'User\'s name is "YouPin Bot"');
              assert(userData.email, 'bot@youpin.city', 'User\'s email is "bot@youpin.city"');
            });
        });
    });
  });
});
