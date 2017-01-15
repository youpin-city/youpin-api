const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_OFFICER = require('../../src/constants/roles').DEPARTMENT_OFFICER;
const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;
const USER_DEPARTMENT_OFFICER_ID = require('./constants').USER_DEPARTMENT_OFFICER_ID;

module.exports = {
  _id: USER_DEPARTMENT_OFFICER_ID, // eslint-disable-line new-cap
  name: 'YouPin Department Officer',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_department_officer' password
  password: '$2a$10$oSKoBrWehNJr.YRWuY5j0uCZrn2QZvsVPofpxpTdISjZI.ukEIitG',
  email: 'department_officer@youpin.city',
  department: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap
  role: DEPARTMENT_OFFICER,
};
