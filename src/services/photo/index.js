'use strict';

const hooks = require('./hooks');

const Promise = require('bluebird');
const firebase = require('firebase');
const errors = require('feathers-errors');
const gcloud = require('gcloud');

class Service {
  constructor(options) {
    this.options = options || {};
    this.fdb = firebase.database();
    this.gcs = gcloud.storage({
      projectId: 'You-pin',
      keyFilename: './youpin_gcs_credentials.json'
    });
  }

  find(params) {
    const self = this;
    return new Promise(function(resolve, reject) {
      self.gcs.createBucket('test', function(err, bucket) {
        if (err) return reject(err);
        resolve([]);
      });
    });
    /*self.gcs.createBucket('test', function(err, bucket) {
      if (err) {
        console.log(err);
      }
      return Promise.resolve([]);
    });*/
  }

  get(id, params) {
    /*gcs.createbucket('test', function(err, bucket) {
      if (err) {
        console.log(err);
      }
      return promise.resolve({
        id, text: `a new message with id: ${id}!`
      });
    });*/
    return Promise.resolve([]);
  }

  create(data, params) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update(id, data, params) {
    return Promise.resolve(data);
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
  app.use('/photos', new Service());

  // Get our initialize service to that we can bind hooks
  const photoService = app.service('/photos');

  // Set up our before hooks
  photoService.before(hooks.before);

  // Set up our after hooks
  photoService.after(hooks.after);
};

module.exports.Service = Service;
