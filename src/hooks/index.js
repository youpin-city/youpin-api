'use strict';

const _ = require('lodash');

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

exports.authenticateAPI = function(options){
  return function(hook) {

    console.log(hook.params);
    console.log('Authenticated API');
  };
};


function swapLatLongHelper(data) {
  if (Array.isArray(data)) {
    data = data.map(obj => {
      if (obj.location) {
        obj.location.coordinates = [obj.location.coordinates[1], obj.location.coordinates[0]];
      }
      return obj;
    });
  } else {
    // Single object
    if (data.location) {
      data.location.coordinates =
        [data.location.coordinates[1], data.location.coordinates[0]];
    }
  }
  return data;
}

// Mongo stores as [Long,Lat] but we want [Lat, Long]. So, swap them.
exports.swapLatLong = function(options) {
  return function(hook) {
    // BeforeHook
    var data = _.get(hook, 'data');
    if (data) {
      hook.data = swapLatLongHelper(data);
      return;
    }
    data = _.get(hook, 'result');
    if (data) {
      // check if it is array -> result: { data: []}
      // or single object -> result: { id: ..., detail: ...}
      if (data.data) {
        hook.result.data = swapLatLongHelper(data.data);
      } else {
        hook.result = swapLatLongHelper(data);
      }
    }
  };
};
