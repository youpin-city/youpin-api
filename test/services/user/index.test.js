// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const casual = require('casual');
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const App3rdModel = require('../../../src/services/app3rd/app3rd-model');
const UserModel = require('../../../src/services/user/user-model');

// Fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd');
const adminUser = require('../../fixtures/admin_user');

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('user service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      Promise.all([
        loadFixture(UserModel, adminUser),
        loadFixture(App3rdModel, adminApp3rd),
      ])
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  after((done) => {
    // Clear all collections after finishing all tests.
    Promise.all([
      UserModel.remove({}),
      App3rdModel.remove({}),
    ])
    .then(() => {
      // Close the server
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  // Registers user service.
  it('registers the users service', () => {
    expect(app.service('users')).to.be.ok();
  });

  describe('GET /users', () => {
    it('return user array conatining only admin user', (done) =>
      request(app)
        // Login with existing admin account
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            return done(new Error('No token returns'));
          }
          // Get list of users
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

              done();
            });
        })
    );
  });

  describe('GET /users/:id', () => {
    it('return 404 NotFound when user does not exist', (done) => {
      // Login with existing admin account
      request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          const notExistingUserId = '111';

          request(app)
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

              done();
            });
        });
    });

    it('return an admin user object', (done) => {
      // Login with existing admin account
      request(app)
        .post('/auth/local')
        .send({
          email: 'contact@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .get(`/users/${adminUser._id}`) // eslint-disable-line no-underscore-dangle
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

              done();
            })
            .catch(done);
        });
    });
  });

  describe('POST /users', () => {
    it('return errors when posting an incomplete required field', (done) => {
      const newUser = {
        name: casual.name,
      };

      request(app)
        .post('/users')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .send(newUser)
        .expect(400, done);
    });

    it('return 201 when posting a complete required field' +
      ' and "pasword" should not be returned', (done) => {
      const newUser = {
        name: casual.name,
        email: casual.email,
        password: casual.password,
        role: 'user',
      };

      request(app)
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

          done();
        })
        .catch(done);
    });
  });
});
