const app = require('../../../src/app');
const casual = require('casual');
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const mongoose = require('mongoose');
const request = require('supertest-as-promised');

const App3rdModel = require('../../../src/services/app3rd/app3rd-model.js');
const UserModel = require('../../../src/services/user/user-model.js');
// load fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd.js');
const adminUser = require('../../fixtures/admin_user.js');

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

describe('user service', () => {
  let server;
  before((done) => {
    server = app.listen(9100);
    server.once('listening', () => done());
  });
  beforeEach((done) => {
    UserModel
      .remove({})
      .then(() => App3rdModel.remove({}, done));
  });
  // Clears collection after finishing all tests.
  after((done) => {
    server.close((err) => {
      if (err) { throw err; }
      UserModel
        .remove({})
        .then(() => App3rdModel.remove({}, done));
    });
  });

  // Registers user service.
  it('registers the users service', () => {
    expect(app.service('users')).to.be.ok();
  });

  describe('GET /users', () => {
    beforeEach((done) => {
      // Create admin user
      loadFixture(UserModel, adminUser, () => {
        loadFixture(App3rdModel, adminApp3rd, done);
      });
    });

    it('return user array conatining only admin user', () =>
      request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            throw new Error('No token returns');
          }
          return request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .expect(200)
            .then((userResp) => {
              const body = userResp.body;
              expect(body).to.have.all.keys(['total', 'limit', 'skip', 'data']);
              expect(body.total).to.equal(1);
              const userDataList = userResp.body.data;
              expect(userDataList).to.be.a('array');
              expect(userDataList).to.have.lengthOf(1);
              expect(userDataList[0]).to.contain.all.keys(
                ['_id', 'name', 'phone', 'email', 'role', 'owner_app_id',
                'customer_app_id', 'updated_time', 'created_time']);
              expect(userDataList[0].email).to.equal('contact@youpin.city');
              // also check response does not contain password
              expect(userDataList).to.not.have.keys('password');
            });
        })
    );
  });

  describe('GET /users/:id', () => {
    beforeEach((done) => {
      // Create admin user
      loadFixture(UserModel, adminUser, () => {
        loadFixture(App3rdModel, adminApp3rd, done);
      });
    });

    it('return 404 NotFound when user does not exist', () => {
      return request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            throw new Error('No token returns');
          }

          const notExistingUserId = '111';
          return request(app)
            .get(`/users/${notExistingUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .expect(404)
            .then((res) => {
              const error = res.body;
              expect(error.code).to.equal(404);
              expect(error.name).to.equal('NotFound');
              expect(error.message).to.equal(`No record found for id '${notExistingUserId}'`);
            });
        });
    });

    it('return an admin user object', () => {
      return request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            throw new Error('No token returns');
          }

          return request(app)
            .get(`/users/${adminUser._id}`)
            .set('Authorization', `Bearer ${token}`)
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .expect(200)
            .then((userResp) => {
              const body = userResp.body;
              expect(body).to.not.be.a('array');
              expect(body).to.contain.all.keys(
                ['_id', 'name', 'phone', 'email', 'role', 'owner_app_id',
                'customer_app_id', 'updated_time', 'created_time']);
              expect(body.email).to.equal('contact@youpin.city');
              // also check response does not contain password
              expect(body).to.not.have.keys('password');
            });
        });
    });
  });

  describe('POST /users', () => {
    beforeEach((done) => {
      // Create admin 3rd-party app
      loadFixture(App3rdModel, adminApp3rd, done);
    });

    it('return errors when posting an incomplete required field', () => {
      const newUser = {
        name: casual.name,
      };
      return request(app)
        .post('/users')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .send(newUser)
        .expect(400);
    });
    it('return 201 when posting a complete required field' +
      ' and "pasword" should not be returned', () => {
      const newUser = {
        name: casual.name,
        email: casual.email,
        password: casual.password,
        role: 'user',
      };
      return request(app)
        .post('/users')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /json/)
        .then((res) => {
          const createdUser = res.body;
          expect(createdUser).to.contain.keys(
            ['_id', 'email', 'name', 'role', 'created_time',
            'updated_time', 'owner_app_id', 'customer_app_id']);
          expect(createdUser).to.not.contain.keys('password');
        });
    });
  });
});
