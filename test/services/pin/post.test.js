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
const Department = require('../../../src/services/department/department-model');
const Pin = require('../../../src/services/pin/pin-model');
const User = require('../../../src/services/user/user-model');

// Fixtures
const adminApp3rd = require('../../fixtures/admin_app3rd');
const adminUser = require('../../fixtures/admin_user');
const departmentHeadUser = require('../../fixtures/department_head_user');
const departments = require('../../fixtures/departments');
const normalUser = require('../../fixtures/normal_user');
const orgnizationAdminUser = require('../../fixtures/organization_admin_user');
const publicRelationsUser = require('../../fixtures/public_relations_user');
const superAdminUser = require('../../fixtures/super_admin_user');
const pins = require('../../fixtures/pins');

// Fixtures' constants
const {
  DEPARTMENT_SUPER_ADMIN_ID,
  ORGANIZATION_ID,
} = require('../../fixtures/constants');

// State constants
const { PENDING, ASSIGNED } = require('../../../src/constants/pin-states');

// App stuff
const app = require('../../../src/app');
const DEFAULT_LAT_LONG = require('../../../src/constants/defaults').DEFAULT_LAT_LONG;

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin - POST', () => {
  let server;

  before((done) => {
    server = app.listen(app.get('port'));
    server.once('listening', () => {
      // Create admin user and app3rd for admin
      Promise.all([
        loadFixture(User, adminUser),
        loadFixture(User, departmentHeadUser),
        loadFixture(User, normalUser),
        loadFixture(User, orgnizationAdminUser),
        loadFixture(User, publicRelationsUser),
        loadFixture(User, superAdminUser),
        loadFixture(App3rd, adminApp3rd),
        loadFixture(Department, departments),
        loadFixture(Pin, pins),
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
      User.remove({}),
      Pin.remove({}),
      Department.remove({}),
      App3rd.remove({}),
    ])
    .then(() => {
      server.close((err) => {
        if (err) return done(err);

        return done();
      });
    });
  });

  it('return 401 (unauthorized) if user is not authenticated', (done) => {
    const newPin = {
      detail: casual.text,
      owner: adminUser._id, // eslint-disable-line no-underscore-dangle
      provider: adminUser._id, // eslint-disable-line no-underscore-dangle
      location: {
        coordinates: [10.733626, 10.5253153],
      },
    };

    request(app)
      .post('/pins')
      .set('X-YOUPIN-3-APP-KEY',
        '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
      .send(newPin)
      .expect(401)
      .then((res) => {
        const error = res.body;

        expect(error.code).to.equal(401);
        expect(error.name).to.equal('NotAuthenticated');
        expect(error.message).to.equal('Authentication token missing.');

        done();
      });
  });

  it('return 401 (unauthorized) if an authenticated user posts using other user id', (done) => {
    const newPin = {
      detail: casual.text,
      owner: '1234',
      provider: '1234',
      location: {
        coordinates: [10.733626, 10.5253153],
      },
    };

    login(app, 'contact@youpin.city', 'youpin_admin')
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          return done(new Error('No token returns'));
        }

        return request(app)
          .post('/pins')
          .set('X-YOUPIN-3-APP-KEY',
            '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
          .send(newPin)
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .then((res) => {
            const error = res.body;

            expect(error.code).to.equal(401);
            expect(error.name).to.equal('NotAuthenticated');
            expect(error.message).to.equal(
              'Owner field (id) does not matched with the token owner id.');

            done();
          });
      });
  });

  it('return 201 when posting by authenticated user, ' +
    'using correct owner id, and filling all required fields', (done) => {
    const newPin = {
      detail: casual.text,
      organization: ORGANIZATION_ID,
      owner: adminUser._id, // eslint-disable-line no-underscore-dangle
      provider: adminUser._id, // eslint-disable-line no-underscore-dangle
      location: {
        coordinates: [10.733626, 10.5253153],
      },
    };

    login(app, 'contact@youpin.city', 'youpin_admin')
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          return done(new Error('No token returns'));
        }

        return request(app)
          .post('/pins')
          .set('X-YOUPIN-3-APP-KEY',
            '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
          .send(newPin)
          .set('Authorization', `Bearer ${token}`)
          .expect(201)
          .then((res) => {
            const createdPin = res.body;
            expect(createdPin).to.contain.keys(
              ['_id', 'detail', 'owner', 'provider',
                'videos', 'voters', 'comments', 'tags',
                'location', 'photos', 'neighborhood', 'mentions', 'organization',
                'followers', 'updated_time', 'created_time', 'categories',
                'is_archived', 'is_featured', 'is_merged']);

            done();
          });
      });
  });

  it('creates pin with `pending` status as default status', (done) => {
    const newPin = {
      detail: casual.text,
      organization: ORGANIZATION_ID,
      owner: adminUser._id, // eslint-disable-line no-underscore-dangle
      provider: adminUser._id, // eslint-disable-line no-underscore-dangle
      location: {
        coordinates: [10.733626, 10.5253153],
      },
    };

    login(app, 'contact@youpin.city', 'youpin_admin')
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          done(new Error('No token returns'));
        }

        request(app)
          .post('/pins')
          .set('X-YOUPIN-3-APP-KEY',
            '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
          .send(newPin)
          .set('Authorization', `Bearer ${token}`)
          .expect(201)
          .then((res) => {
            const createdPin = res.body;
            expect(createdPin.status).to.equal(PENDING);

            done();
          });
      });
  });

  it('can creates pin with `assigned` state', (done) => {
    const newPin = {
      detail: casual.text,
      organization: ORGANIZATION_ID,
      owner: adminUser._id, // eslint-disable-line no-underscore-dangle
      provider: adminUser._id, // eslint-disable-line no-underscore-dangle
      location: {
        coordinates: [10.733626, 10.5253153],
      },
      status: ASSIGNED,
      assigned_department: DEPARTMENT_SUPER_ADMIN_ID,
    };

    login(app, 'contact@youpin.city', 'youpin_admin')
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          done(new Error('No token returns'));
        }

        request(app)
          .post('/pins')
          .set('X-YOUPIN-3-APP-KEY',
            '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
          .send(newPin)
          .set('Authorization', `Bearer ${token}`)
          .expect(201)
          .then((res) => {
            const createdPin = res.body;
            expect(createdPin.status).to.equal(ASSIGNED);
            expect(createdPin.assigned_department).to.equal(DEPARTMENT_SUPER_ADMIN_ID);

            done();
          });
      });
  });

  it('creates pin without provided location.coordinates', (done) => {
    const newPin = {
      detail: casual.text,
      organization: ORGANIZATION_ID,
      owner: adminUser._id, // eslint-disable-line no-underscore-dangle
      provider: adminUser._id, // eslint-disable-line no-underscore-dangle
      location: {},
    };

    login(app, 'contact@youpin.city', 'youpin_admin')
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          done(new Error('No token returns'));
        }

        request(app)
          .post('/pins')
          .set('X-YOUPIN-3-APP-KEY',
            '579b04ac516706156da5bba1:ed545297-4024-4a75-89b4-c95fed1df436')
          .send(newPin)
          .set('Authorization', `Bearer ${token}`)
          .expect(201)
          .then((res) => {
            const createdPin = res.body;
            expect(createdPin.status).to.equal(PENDING);
            expect(createdPin.location.coordinates).to.deep.equal(DEFAULT_LAT_LONG);
            done();
          });
      });
  });
});
