// Test helper functions
const assertTestEnv = require('../../test_helper').assertTestEnv;
const expect = require('../../test_helper').expect;
const loadFixture = require('../../test_helper').loadFixture;
const request = require('supertest-as-promised');

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
const PIN_ASSIGNED_ID = require('../../fixtures/constants').PIN_ASSIGNED_ID;
const PIN_PROCESSING_ID = require('../../fixtures/constants').PIN_PROCESSING_ID;
const PIN_PENDING_ID = require('../../fixtures/constants').PIN_PENDING_ID;
const PROGRESS_DETAIL = require('../../fixtures/constants').PROGRESS_DETAIL;
const USER_DEPARTMENT_HEAD_ID = require('../../fixtures/constants').USER_DEPARTMENT_HEAD_ID;
const USER_ADMIN_ID = require('../../fixtures/constants').USER_ADMIN_ID;

// App stuff
const app = require('../../../src/app');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Pin - PATCH', () => {
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

  it('logs activities when update/add to fields', (done) => {
    const newData = {
      $push: {
        progresses: {
          owner: USER_ADMIN_ID,
          photos: ['New progress photo url'],
          detail: 'New progress',
        },
      },
      owner: USER_ADMIN_ID, // eslint-disable-line no-underscore-dangle
      detail: 'Updated pin detail',
    };
    request(app)
      .post('/auth/local')
      .send({
        email: 'contact@youpin.city',
        password: 'youpin_admin',
      })
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        return request(app)
          .patch(`/pins/${PIN_PROCESSING_ID}`) // eslint-disable-line no-underscore-dangle
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send(newData)
          .expect(200);
      })
      .then((res) => {
        const updatedPin = res.body;
        expect(updatedPin.progresses).to.have.lengthOf(2);
        expect(updatedPin.progresses[0].detail).to.equal(PROGRESS_DETAIL);
        expect(updatedPin.progresses[1].detail).to.equal('New progress');
        expect(updatedPin.progresses[1].owner._id)  // eslint-disable-line no-underscore-dangle
          .to.equal(USER_ADMIN_ID);
        expect(updatedPin.detail).to.equal('Updated pin detail');
        done();
      });
  });

  it('returns 200 allowing super-admin to update other user\'s pin.', (done) => {
    const newData = {
      $push: {
        progresses: {
          owner: USER_ADMIN_ID,
          photos: ['New progress photo url'],
          detail: 'New progress',
        },
      },
      detail: 'Updated pin detail',
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

        return request(app)
          .patch(`/pins/${PIN_PENDING_ID}`) // eslint-disable-line no-underscore-dangle
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send(newData)
          .expect(200);
      })
      .then((res) => {
        const updatedPin = res.body;
        expect(updatedPin.progresses).to.have.lengthOf(1);
        expect(updatedPin.progresses[0].detail).to.equal('New progress');
        expect(updatedPin.progresses[0].owner._id)  // eslint-disable-line no-underscore-dangle
          .to.equal(USER_ADMIN_ID);
        expect(updatedPin.detail).to.equal('Updated pin detail');
        done();
      });
  });

  it('returns 200 allowing department head to update his/her own assigned pin', (done) => {
    const newData = {
      $push: {
        progresses: {
          owner: USER_DEPARTMENT_HEAD_ID,
          photos: ['New progress photo url'],
          detail: 'New progress',
        },
      },
    };

    request(app)
      .post('/auth/local')
      .send({
        email: 'department_head@youpin.city',
        password: 'youpin_admin',
      })
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          done(new Error('No token returns'));
        }
        return request(app)
          .patch(`/pins/${PIN_ASSIGNED_ID}`)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send(newData)
          .expect(200);
      })
      .then(res => {
        const updatedPin = res.body;
        expect(updatedPin.progresses).to.have.lengthOf(1);
        expect(updatedPin.progresses[0].detail).to.equal('New progress');
        expect(updatedPin.progresses[0].owner._id)  // eslint-disable-line no-underscore-dangle
          .to.equal(USER_DEPARTMENT_HEAD_ID);
        done();
      });
  });

  it('returns 200 allowing organization_admin to update a pin in pending state', (done) => {
    const newData = {
      level: 'Urgent',
      tags: [
        'footpath',
        'safety',
      ],
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
          return done(new Error('No token returns'));
        }
        return request(app)
          .patch(`/pins/${PIN_PENDING_ID}`)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send(newData)
          .expect(200);
      })
      .then(res => {
        const updatedPin = res.body;
        expect(updatedPin.level).to.equal('Urgent');
        expect(updatedPin.tags).to.deep.equal(['footpath', 'safety']);
        done();
      });
  });

  it('returns 401 not allowing normal user to update other user\'s  pin', (done) => {
    const newData = {
      owner: normalUser._id, // eslint-disable-line no-underscore-dangle
      $push: {
        progresses: {
          photos: ['New progress photo url'],
          detail: 'New progress',
        },
      },
    };

    request(app)
      .post('/auth/local')
      .send({
        email: 'user@youpin.city',
        password: 'youpin_user',
      })
      .then((tokenResp) => {
        const token = tokenResp.body.token;

        if (!token) {
          done(new Error('No token returns'));
        }
        return request(app)
          .patch(`/pins/${PIN_ASSIGNED_ID}`)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-type', 'application/json')
          .send(newData)
          .expect(401);
      })
      .then((res) => {
        const error = res.body;

        expect(error.code).to.equal(401);
        expect(error.name).to.equal('NotAuthenticated');
        expect(error.message).to.equal(
          'Owner field (id) does not matched with the token owner id.');
        done();
      })
      .catch(error => console.log(error));
  });
});
