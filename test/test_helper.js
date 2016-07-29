const chai = require('chai');
const dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
const expect = chai.expect;
const mongoose = require('mongoose');

var loadFixture = function(ModelClass, jsonData, callback) {
  (new ModelClass(jsonData)).save((err, inst) => {
    callback();
  });
};

var checkTestEnv = function() {
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
};


module.exports = {
  checkTestEnv: checkTestEnv,
  expect: expect,
  loadFixture: loadFixture,
};
