const _ = require('lodash');

function swapLatLongHelper(data) {
  if (Array.isArray(data)) {
    data = data.map(obj => { // eslint-disable-line no-param-reassign
      if (obj.location && obj.location.coordinates) {
        obj.location.coordinates = // eslint-disable-line no-param-reassign
          [obj.location.coordinates[1], obj.location.coordinates[0]];
      }
      return obj;
    });
  } else if (data.location && data.location.coordinates) {
  // Single object
    data.location.coordinates = // eslint-disable-line no-param-reassign
      [data.location.coordinates[1], data.location.coordinates[0]];
  }
  return data;
}

// Mongo stores as [Long,Lat] but we want [Lat, Long]. So, swap them.
/* eslint-disable func-names */
function swapLatLong(options) { // eslint-disable-line no-unused-vars
  return (hook) => {
    // BeforeHook
    let data = _.get(hook, 'data');
    if (data) {
      hook.data = swapLatLongHelper(data); // eslint-disable-line no-param-reassign
      return;
    }
    data = _.get(hook, 'result');
    if (data) {
      // check if it is array -> result: { data: []}
      // or single object -> result: { id: ..., detail: ...}
      if (data.data) {
        hook.result.data = swapLatLongHelper(data.data); // eslint-disable-line no-param-reassign
      } else {
        hook.result = swapLatLongHelper(data); // eslint-disable-line no-param-reassign
      }
    }
  };
}
/* eslint-enable func-names */

module.exports = swapLatLong;
