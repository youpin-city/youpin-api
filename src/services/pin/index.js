'use strict';

const hooks = require('./hooks');

const Promise = require('bluebird');
const firebase = require('firebase');
const Geofire = require('geofire');
const errors = require('feathers-errors');

class Service {
  constructor(options) {
    this.options = options || {};
    this.geofire = new Geofire(firebase.database().ref('pin_geofires'));
    this.fdb = firebase.database();
  }
  // /pins returns N results accordings to limit parameter (default: 10)
  find(params) {
    const self = this;
    const limit = params.query.limit || 10;
    const cache = {};
    return self.fdb.ref('pin_infos').limitToFirst(10).once('value')
      .then(function(snapshot) {
        console.log('Retrieving pin_infos data...');
        cache.pin_infos = snapshot.val();
        return {
          pin_info: cache.pin_infos
        };
      })
      // TODO(A): add geofire (locations) to all pins
      .catch(function(err) {
        console.log(err);
        return new errors.NotImplemented(err);
      });
  }

  get(id, params) {
    const self = this;
    const cache = {};
    return self.fdb.ref('pin_infos/' + id).once('value')
    .then(function(snapshot) {
      console.log('Retrieving pin_infos of id - ' + id);
      cache.pin_infos = snapshot.val();
      return self.fdb.ref('pin_geofires/' +id).once('value');
    })
    .then(function(snapshot) {
      console.log('Retrieving pin_geofires of id -' + id);
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
      // TODO(A): Try to return null instead
      locationData = [0, 0];
    }
    var newChild = self.fdb.ref('pin_infos').push();
    return newChild.set(data)
    .then(function() {
      console.log('Created pin_infos with key ' + newChild.key);
      return self.geofire.set(newChild.key, locationData);
    })
    .then(function() {
      console.log('Created pin_geofires with key ' + newChild.key);
      return {name: newChild.key};
    })
    .catch(function(err) {
      console.log(err);
      return new errors.NotImplemented(err);
    });
  }

  update(id, data, params) {
    const self = this;
    return self.fdb.ref('pin_infos/' + id).once('value')
      .then(function(snapshot) {
        if (snapshot.val() == null) {
          throw 'Pin does not exist; key ' + id;
        }
        console.log('Checked pin_infos key does exists ' + id);
        return self.fdb.ref('pin_infos').child(id).set(data);
      })
      .then(function() {
        console.log('Updated pin_infos with key ' + id);
        return {name: id};
      })
      .catch(function(err) {
        console.log(err);
        throw new errors.NotImplemented(err);
      });
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    const self = this;
    return self.fdb.ref('pin_infos/' + id)
      .set(null)
      .then(function() {
        console.log('Removed pin_infos with id ' + id);
        return self.geofire.set(id, null);
      })
      .then(function() {
        console.log('Removed pin_geofires with id ' + id);
        return {name: id};
      })
      .catch(function(err) {
      });
    return Promise.resolve({ id });
  }
}

class AdditionalService {
  constructor(options) {
    this.options = options || {};
    this.geofire = new Geofire(firebase.database().ref('pin_geofires'));
    this.fdb = firebase.database();
  }
  // Route for nearby search
  // /pins/nearbysearch?location=<number>,<number>&radius=<number>
  // /pins/ will return maybe just 10 first results accordings to some limited params
  find(params) {
    var self = this;
    // check location format is '<number>,<number>'
    if (!params.query.location && !params.query.radius) {
      throw new errors.BadRequest('Location or radius data is missing');
    }
    var location_array = params.query.location.split(',');
    if (location_array.length != 2
        || isNaN(location_array[0]) || isNaN(location_array[1])) {
        // return incorrect format
        throw new errors.BadRequest('Invalid location format');
    }
    var latitude, longitude;
    latitude = parseFloat(location_array[0]);
    longitude = parseFloat(location_array[1]);
    // check radius is number
    if (isNaN(params.query.radius)) {
        // return incorrect format
        throw new errors.BadRequest('radius is not a number');
    }
    var radius = parseFloat(params.query.radius);
    var geoquery = self.geofire.query({
      center: [latitude, longitude],
      radius: radius
    });
    console.log(geoquery.radius());
    console.log(geoquery.center());
    // TODO(A): make it searchable using geohash
    // ngeohash might help but we still need more implementation
    return geoquery.on('ready', function() {
    })
    return Promise.resolve([]);
  }
}

module.exports = function(){
  const app = this;

  // Initialize additional routes
  app.use('/pins/nearbysearch', new AdditionalService());

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
