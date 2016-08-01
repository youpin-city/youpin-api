const chai = require('chai');
const dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
const expect = chai.expect;
const mongoose = require('mongoose');

var loadFixture = function(ModelClass, data) {
    return new Promise((resolve, reject) => {
      if (Array.isArray(data)) {
        let results = [];

        data.forEach((json) => {
          (new ModelClass(json)).save((err, inst) => {
            if (err) reject(err);

            results.push(inst);
          });

          resolve(results);
        });
      } else {
        // Load single json data
        (new ModelClass(data)).save((err, inst) => {
          if (err) {
            reject(err);
          }

          resolve(inst);
        });
      }
    });
};

var assertTestEnv = function() {
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


module.exports = {
  assertTestEnv: assertTestEnv,
  expect: expect,
  loadFixture: loadFixture,
};
