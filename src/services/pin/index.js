'use strict';

const hooks = require('./hooks');

const Promise = require('bluebird');
const firebase = require('firebase');
const Geofire = require('geofire');
const errors = require('feathers-errors');
const stormpath = require('express-stormpath');

module.exports = function() {
  const app = this;
  const fdb = firebase.database();
  const geofire = new Geofire(firebase.database().ref('pin_geofires'));
  // Route for nearby search
  // /pins/nearbysearch?location=<number>,<number>&radius=<number>
  // /pins/ will return maybe just 10 first results accordings to some limited params
  app.get('/pins/nearbysearch', stormpath.apiAuthenticationRequired, function(req, res, next) {
    var self = this;
    // check location format is '<number>,<number>'
    if (!req.query.location && !req.query.radius) {
      return res.send(new errors.BadRequest('Location or radius data is missing'));
    }
    var location_array = req.query.location.split(',');
    if (location_array.length != 2
        || isNaN(location_array[0]) || isNaN(location_array[1])) {
        // return incorrect format
        return res.send(new errors.BadRequest('Invalid location format'));
    }
    var latitude, longitude;
    latitude = parseFloat(location_array[0]);
    longitude = parseFloat(location_array[1]);
    // check radius is number
    if (isNaN(req.query.radius)) {
        // return incorrect format
        return res.send(new errors.BadRequest('radius is not a number'));
    }
    var radius = parseFloat(req.query.radius);
    var geoquery = geofire.query({
      center: [latitude, longitude],
      radius: radius
    });
    console.log(geoquery.radius());
    console.log(geoquery.center());
    // TODO(A): make it searchable using geohash
    // geohash might help but we still need more implementation
    res.json('To be implemented');
  });

  // /pins returns N results accordings to limit parameter (default: 10)
  app.get('/pins', function(req, res, next) {
    const self = this;
    const limit = req.query.limit || 10;
    const cache = {};
    fdb.ref('pin_infos').limitToFirst(10).once('value')
      .then(function(snapshot) {
        console.log('Retrieving pin_infos data...');
        cache.pin_infos = snapshot.val();
        res.json({
          pin_info: cache.pin_infos
        });
      })
      // TODO(A): add geofire (locations) to all pins
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented(err));
      });
  });

  app.get('/pins/:id', function(req, res, next) {
    const self = this;
    const cache = {};
    const id = req.params.id;
    fdb.ref('pin_infos/' + id).once('value')
      .then(function(snapshot) {
        console.log('Retrieving pin_infos of id - ' + id);
        cache.pin_infos = snapshot.val();
        return fdb.ref('pin_geofires/' + id).once('value');
      })
      .then(function(snapshot) {
        console.log('Retrieving pin_geofires of id -' + id);
        cache.pin_geofires= snapshot.val();
        res.json({
          pin_info: cache.pin_infos,
          location: cache.pin_geofires,
        });
      })
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented(err));
      });
  });

  app.post('/pins', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const data = req.body;
    // TODO(A): Make it work with Array
    console.log(data);
    var locationData;
    if (data.location) {
      locationData = data.location;
      delete data.location;
    } else {
      // TODO(A): Try returning null instead
      locationData = [0, 0];
    }
    var newChild = fdb.ref('pin_infos').push();
    newChild.set(data)
      .then(function() {
        console.log('Created pin_infos with key ' + newChild.key);
        return geofire.set(newChild.key, locationData);
      })
      .then(function() {
        console.log('Created pin_geofires with key ' + newChild.key);
        res.json({name: newChild.key});
      })
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented(err));
      });
  });

  app.delete('/pins/:id', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const self = this;
    const id = req.params.id;
    fdb.ref('pin_infos/' + id)
      .set(null)
      .then(function() {
        console.log('Removed pin_infos with id ' + id);
        return geofire.set(id, null);
      })
      .then(function() {
        console.log('Removed pin_geofires with id ' + id);
        res.json({name: id});
      })
      .catch(function(err) {
        res.send(new errors.NotImplemented(err));
      });
  });

  app.put('/pins/:id', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const self = this;
    const id = req.params.id;
    fdb.ref('pin_infos/' + id).once('value')
      .then(function(snapshot) {
        if (snapshot.val() == null) {
          throw 'Pin does not exist; key ' + id;
        }
        console.log('Checked pin_infos key does exists ' + id);
        return self.fdb.ref('pin_infos').child(id).set(data);
      })
      .then(function() {
        console.log('Updated pin_infos with key ' + id);
        res.json({name: id});
      })
      .catch(function(err) {
        console.log(err);
        res.send(errors.NotImplemented(err));
      });

  });
};
