const ObjectId = require('mongoose').Types.ObjectId;

exports.User = [{
  _id: new ObjectId,
  name: 'YouPin Admin',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'contact@youpin.city',
  role: 'admin',
}];
