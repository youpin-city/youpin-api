const chai = require('chai');
const dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
const expect = chai.expect;

var loadFixture = function(ModelClass, jsonData, callback) {
  (new ModelClass(jsonData)).save((err, inst) => {
    callback();
  });
};

module.exports = {
  expect: expect,
  loadFixture: loadFixture
};
