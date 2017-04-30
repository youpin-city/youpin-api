// Test helper functions
const casual = require('casual');
const request = require('supertest-as-promised');
const {
  assertTestEnv,
  expect,
  loadFixture,
  login,
} = require('../../test_helper');

// Models
const App3rd = require('../../../src/services/app3rd/app3rd-model');
const User = require('../../../src/services/user/user-model');

// Fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd');
const departmentOfficerUser = require('../../fixtures/department_officer_user');
const departmentHeadUser = require('../../fixtures/department_head_user');
const normalUser = require('../../fixtures/normal_user');
const organizationAdminUser = require('../../fixtures/organization_admin_user');
const superAdminUser = require('../../fixtures/super_admin_user');

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

let totalUsers = 0;

describe('user service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {

      let userFixtures = [
        loadFixture(User, departmentOfficerUser),
        loadFixture(User, departmentHeadUser),
        loadFixture(User, organizationAdminUser),
        loadFixture(User, superAdminUser)
      ];

      totalUsers = userFixtures.length;

      let otherFixtures = [
        loadFixture(App3rd, adminApp3rd)
      ];

      let allFixtures = userFixtures.concat(otherFixtures);

      Promise.all(allFixtures)
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
      User.remove({}),
      App3rd.remove({}),
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
    it('allows super_admin role to retrive data', (done) =>
      login(app, 'super_admin@youpin.city', 'youpin_admin')
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
              expect(body.total).to.equal(totalUsers);

              const userDataList = userResp.body.data;
              expect(userDataList).to.be.a('array');
              expect(userDataList).to.have.lengthOf(totalUsers);

              const userEmails = [
                'department_officer@youpin.city',
                'department_head@youpin.city',
                'organization_admin@youpin.city',
                'super_admin@youpin.city',
              ];

              for (let i = 0; i < userDataList.length; i++) {
                expect(userEmails).to.include(userDataList[i].email);
              }
              // also check response does not contain password
              expect(userDataList).to.not.have.keys('password');

              done();
            });
        })
    );

    it('allows organization_admin role to retrive data', (done) =>
      login(app, 'organization_admin@youpin.city', 'youpin_admin')
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
              expect(body.total).to.equal(totalUsers);

              const userDataList = userResp.body.data;
              expect(userDataList).to.be.a('array');
              expect(userDataList).to.have.lengthOf(totalUsers);
              const userEmails = [
                'department_officer@youpin.city',
                'department_head@youpin.city',
                'organization_admin@youpin.city',
                'super_admin@youpin.city',
              ];

              for (let i = 0; i < userDataList.length; i++) {
                expect(userEmails).to.include(userDataList[i].email);
              }
              // also check response does not contain password
              expect(userDataList).to.not.have.keys('password');

              done();
            });
        })
    );

    it('allows department_head role to retrive data', (done) =>
      login(app, 'department_head@youpin.city', 'youpin_admin')
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
              expect(body.total).to.equal(totalUsers);

              const userDataList = userResp.body.data;
              expect(userDataList).to.be.a('array');
              expect(userDataList).to.have.lengthOf(totalUsers);
              const userEmails = [
                'department_officer@youpin.city',
                'department_head@youpin.city',
                'organization_admin@youpin.city',
                'super_admin@youpin.city',
              ];

              for (let i = 0; i < userDataList.length; i++) {
                expect(userEmails).to.include(userDataList[i].email);
              }
              // also check response does not contain password
              expect(userDataList).to.not.have.keys('password');

              done();
            });
        })
    );

    it('allows department_officer role to retrive data', (done) =>
      login(app, 'department_officer@youpin.city', 'youpin_department_officer')
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
              expect(body.total).to.equal(totalUsers);

              const userDataList = userResp.body.data;
              expect(userDataList).to.be.a('array');
              expect(userDataList).to.have.lengthOf(totalUsers);
              const userEmails = [
                'department_officer@youpin.city',
                'department_head@youpin.city',
                'organization_admin@youpin.city',
                'super_admin@youpin.city',
              ];

              for (let i = 0; i < userDataList.length; i++) {
                expect(userEmails).to.include(userDataList[i].email);
              }
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
      login(app, 'super_admin@youpin.city', 'youpin_admin')
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

    it('return a super_admin user object', (done) => {
      // Login with existing admin account
      login(app, 'super_admin@youpin.city', 'youpin_admin')
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .get(`/users/${superAdminUser._id}`) // eslint-disable-line no-underscore-dangle
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
              expect(body.email).to.equal('super_admin@youpin.city');
              // also check response does not contain password
              expect(body).to.not.have.keys('password');

              done();
            })
            .catch(done);
        });
    });
  });

  describe('DELETE /users', () => {
    beforeEach((done) => {
      // Add a normal user before each test.
      loadFixture(User, normalUser)
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    afterEach((done) => {
      // Delete the normal user after each test.
      User.remove({ _id: normalUser._id }) // eslint-disable-line no-underscore-dangle
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('return 401 "Unauthorized" errors ' +
      'when an unauthorized user attempts to delete other user', (done) => {
      request(app)
        .delete(`/users/${normalUser._id}`) // eslint-disable-line no-underscore-dangle
        .expect(401, done);
    });

    it('return 200 ' +
      'when a normal user attempts to delete his/her own user', (done) => {
      login(app, 'user@youpin.city', 'youpin_user')
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .delete(`/users/${normalUser._id}`) // eslint-disable-line no-underscore-dangle
            .set('Authorization', `Bearer ${token}`)
            .expect(200, done);
        });
    });

    it('return 200 ' +
      'when a super-admin user attempts to delete other user', (done) => {
      login(app, 'super_admin@youpin.city', 'youpin_admin')
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .delete(`/users/${normalUser._id}`) // eslint-disable-line no-underscore-dangle
            .set('Authorization', `Bearer ${token}`)
            .expect(200, done);
        });
    });

    it('return 403 "Forbidden" ' +
      'when a normal user attempts to delete other user', (done) => {
      login(app, 'user@youpin.city', 'youpin_user')
        .then((tokenResp) => {
          const token = tokenResp.body.token;
          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .delete(`/users/${superAdminUser._id}`) // eslint-disable-line no-underscore-dangle
            .set('Authorization', `Bearer ${token}`)
            .expect(403, done);
        });
    });
  });

  describe('POST /users', () => {
    it('return errors when posting an incomplete required field', (done) => {
      const newUser = {
        email: casual.email,
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
            ['_id', 'name', 'role', 'created_time',
              'updated_time', 'owner_app_id', 'customer_app_id']);
          expect(createdUser).to.not.contain.keys('password');

          done();
        })
        .catch(done);
    });
  });
});
