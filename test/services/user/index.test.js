const app = require('../../../src/app');
const crypto = require('bcryptjs');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const Promise = require('bluebird');
// bcrypt used by feathers-authentication
const UserModel = require('../../../src/services/user/user-model.js');

chai.use(dirtyChai);
const expect = chai.expect;

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
      const hashedItem = item;
      if (err) {
        reject(err);
      } else {
        hashedItem.password = hash;
        resolve(hashedItem);
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
      if (err) { throw err; }
      UserModel.remove({}, done);
    });
  });

  // Registers user service.
  it('registers the users service', () => {
    expect(app.service('users')).to.be.ok();
  });

  describe('GET', () => {
    it('return list of only one user', () =>
      request(app)
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
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((userResp) => {
              const body = userResp.body;
              expect(body).to.have.all.keys(['total', 'limit', 'skip', 'data']);
              expect(body.total).to.equal(1);
              const userDataList = userResp.body.data;
              expect(userDataList).to.have.lengthOf(1);
              expect(userDataList[0]).to.contain.all.keys(
                ['_id', 'name', 'phone', 'email', 'role', 'owner_app_id',
                'customer_app_id', 'updated_time', 'created_time']);
              expect(userDataList[0].email).to.equal('bot@youpin.city');
              // also check response does not contain password
              expect(userDataList).to.not.have.keys('password');
            });
        })
    );
  });
});
