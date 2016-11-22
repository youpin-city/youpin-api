// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

// Models
const UserModel = require('../../../src/services/user/user-model');
const OrganizationModel = require('../../../src/services/organization/organization-model');
const DepartmentModel = require('../../../src/services/department/department-model');

// Fixtures
const superAdminUser = require('../../fixtures/super_admin_user');
const organizationAdminUser = require('../../fixtures/organization_admin_user');
const organizations = require('../../fixtures/organizations');
const departments = require('../../fixtures/departments');

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('department service', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(UserModel, superAdminUser),
        loadFixture(UserModel, organizationAdminUser),
        loadFixture(OrganizationModel, organizations),
        loadFixture(DepartmentModel, departments),
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
    // Clear collections after finishing all tests.
    Promise.all([
      UserModel.remove({}),
      DepartmentModel.remove({}),
      OrganizationModel.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('registered the departments service', () => {
    expect(app.service('departments')).to.be.ok();
  });

  describe('POST', () => {
    it('return 401 (unauthorized) if user is not authenticated', (done) => {
      const newDepartment = {
        name: 'YouPin',
        organization: organizations[0]._id, // eslint-disable-line no-underscore-dangle
        detail: 'An awesome department', // eslint-disable-line no-underscore-dangle
      };

      request(app)
        .post('/departments')
        .set('X-YOUPIN-3-APP-KEY',
          '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
        .send(newDepartment)
        .expect(401)
        .then((res) => {
          const error = res.body;

          expect(error.code).to.equal(401);
          expect(error.name).to.equal('NotAuthenticated');
          expect(error.message).to.equal('Authentication token missing.');

          done();
        });
    });

    it('return 201 when posting by super admin user', (done) => {
      const newDepartment = {
        name: 'YouPin',
        organization: organizations[0]._id, // eslint-disable-line no-underscore-dangle
        detail: 'An awesome department', // eslint-disable-line no-underscore-dangle
      };

      request(app)
        .post('/auth/local')
        .send({
          email: 'super_admin@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .post('/departments')
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .send(newDepartment)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .then((res) => {
              const createddepartment = res.body;
              expect(createddepartment).to.contain.keys(
                ['_id', 'name', 'detail', 'organization',
                  'updated_time', 'created_time']);
              done();
            });
        });
    });

    it('return 201 when posting by organization admin user', (done) => {
      const newDepartment = {
        name: 'YouPin',
        organization: organizations[0]._id, // eslint-disable-line no-underscore-dangle
        detail: 'An awesome department', // eslint-disable-line no-underscore-dangle
      };

      request(app)
        .post('/auth/local')
        .send({
          email: 'organization_admin@youpin.city',
          password: 'youpin_admin',
        })
        .then((tokenResp) => {
          const token = tokenResp.body.token;

          if (!token) {
            done(new Error('No token returns'));
          }

          request(app)
            .post('/departments')
            .set('X-YOUPIN-3-APP-KEY',
              '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
            .send(newDepartment)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .then((res) => {
              const createddepartment = res.body;
              expect(createddepartment).to.contain.keys(
                ['_id', 'name', 'detail', 'organization',
                  'updated_time', 'created_time']);
              done();
            });
        });
    });
  });
});
