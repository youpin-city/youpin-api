'use strict';

const Promise = require('bluebird');
const firebase = require('firebase');
const errors = require('feathers-errors');
const stormpath = require('express-stormpath');

module.exports = function(){
  const app = this;
  const fdb = firebase.database();

  // /tempuser returns N results according limit params (default limit: 10)
  app.get('/tempuser', stormpath.apiAuthenticationRequired, function (req, res, next) {
    const limit = req.query.limit || 10;
    fdb.ref('tempuser').limitToFirst(10).once('value')
      .then(function(snapshot) {
        console.log('Retrieving tempuser data...');
        var user = snapshot.val();
        res.json({
          user: snapshot.val()
        });
      })
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented(err));
      });
  });

  // /tempuser/:id returns user with mactching YouPin id
  app.get('/tempuser/:id', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const id = req.params.id;
    fdb.ref('tempuser/' + id).once('value')
      .then(function(snapshot) {
        console.log('Retrieving tempuser with YouPin id - ' + id);
        res.json({
          user: snapshot.val()
        });
      })
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented(err));
      });
  });

  // /tempuser/fbid/:id returns user with matching FB id
  app.get('/tempuser/fbid/:id', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const id = req.params.id;
    fdb.ref('tempuser').orderByChild('fb_id').equalTo(id).once('value')
      .then(function(snapshot) {
        console.log('Retrieving tempuser with facebook id - ' + id);
        res.json({
          user: snaphost.val()
        });
      })
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented());
      });
  })

  app.post('/tempuser', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const data = req.body;
    // TODO(A): Make it work with Array
    console.log(data);
    var newChild = fdb.ref('tempuser').push();
    newChild.set(data)
      .then(function() {
        console.log('Created user with key ' + newChild.key);
        res.json({
          youpin_id: newChild.key
        });
      })
      .catch(function(err) {
        console.log(err);
        res.send(new errors.NotImplemented(err));
      });
  });
  // Delete tempuser by id
  app.delete('/tempuser/:id', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const self = this;
    const id = req.params.id;
    fdb.ref('tempuser/' + id)
      .set(null)
      .then(function() {
        console.log('Removed tempuser with id ' + id);
        res.json({youpin_id: id});
      })
      .catch(function(err) {
        res.send(new errors.NotImplemented(err));
      });
  });

  app.put('/tempuser/:id', stormpath.apiAuthenticationRequired, function(req, res, next) {
    const self = this;
    const id = req.params.id;
    fdb.ref('tempuser/' + id).once('value')
      .then(function(snapshot) {
        if (snapshot.val() == null) {
          throw 'Pin does not exist; youpin_id ' + id;
        }
        console.log('Checked tempuser youpin_id does exists ' + id);
        return self.fdb.ref('pin_infos').child(id).set(data);
      })
      .then(function() {
        console.log('Updated tempuser with youpin_id ' + id);
        res.json({name: id});
      })
      .catch(function(err) {
        console.log(err);
        res.send(errors.NotImplemented(err));
      });
  });
};

