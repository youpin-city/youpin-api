const chai = require('chai');
const dirtyChai = require('dirty-chai');
const loadFixture = require('mongoose-fixture-loader');
const mongoose = require('mongoose');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('supertest-as-promised');

const expect = chai.expect;
const spy = sinon.spy;
const stub = sinon.stub;

chai.use(dirtyChai);
chai.use(sinonChai);

const assertTestEnv = () => {
  // Makes sure that this is actually TEST environment
  if (process.env.NODE_ENV !== 'test') {
    console.log('Woops, you want NODE_ENV=test before you try this again!');
    process.exit(1);
  }

  // Makes sure that db is youpin-test
  if (mongoose.connection.db.s.databaseName !== 'youpin-test') {
    console.log('Woops, it seems you are using not-for-testing database. Change it now!');
    process.exit(1);
  }
};

const login = (app, email, password) => (
  request(app)
   .post('/auth/local')
   .set('Content-type', 'application/json')
   .send({
     email,
     password,
   })
);


module.exports = {
  assertTestEnv,
  expect,
  loadFixture,
  spy,
  stub,
  login,
};
