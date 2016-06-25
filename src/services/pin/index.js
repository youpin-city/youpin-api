'use strict';

const hooks = require('./hooks');

const Promise = require('bluebird');
const firebase = require('firebase');
const Geofire = require('geofire');
const errors = require('feathers-errors');

class Service {
  constructor(options) {
    this.options = options || {};
    this.geofire = new Geofire(firebase.database().ref("pin_geofires"));
    this.fdb = firebase.database();
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    const self = this;
    const cache = {};
    return self.fdb.ref("pin_infos/" + id).once("value")
    .then(function(snapshot) {
      console.log("retrieving pin_infos data...1");
      cache.pin_infos = snapshot.val();
      return self.fdb.ref("pin_geofires/" +id).once("value");
    })
    .then(function(snapshot) {
      console.log("retrieving pin_geofires data...2");
      cache.pin_geofires= snapshot.val();
      return {
        pin_info: cache.pin_infos,
        location: cache.pin_geofires,
      };
    })
    .catch(function(err) {
      console.log(err);
      return new errors.NotImplemented(err);
    });
  }
  // POST /pins
  create(data, params) {
    const self = this;
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }
    var locationData;
    if (data.location) {
      locationData = data.location;
      delete data.location;
    } else {
      locationData = [0, 0];
    }
    var newChild = self.fdb.ref("pin_infos").push();
    return newChild.set(data)
    .then(function() {
      console.log("Created pin_infos with key " + newChild.key);
      return self.geofire.set(newChild.key, locationData);
    })
    .then(function() {
      console.log("Created pin_geofires with key " + newChild.key);
      return {name: newChild.key};
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  update(id, data, params) {
    const self = this;
    return self.fdb.ref("pin_infos").child(id).set(data)
      .then(function() {
        return {name: id};
      })
      .catch(function(err) {
      });
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/pins', new Service());

  // Get our initialize service to that we can bind hooks
  const pinService = app.service('/pins');

  // Set up our before hooks
  pinService.before(hooks.before);

  // Set up our after hooks
  pinService.after(hooks.after);
};

module.exports.Service = Service;
