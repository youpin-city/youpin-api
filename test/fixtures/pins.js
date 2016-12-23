const casual = require('casual');

module.exports = [
  {
    _id: '579334c75563625d6281b6f6',
    assigned_department: '57933111556362511181bbb1', // department ObjectId
    created_time: '2016-12-01',
    detail: casual.text,
    organization: '57933111556362511181aaa1', // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534303, 13.730537951109],
    },
    status: 'unverified',
    is_archived: false,
  },
  {
    _id: '579334c75163615d618116f1',
    assigned_department: '57933111556362511181ccc1', // department ObjectId
    created_time: '2016-12-05',
    detail: casual.text,
    organization: '57933111556362511181aaa1', // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534304, 13.730537951108],
    },
    status: 'verified',
    is_archived: false,
  },
  {
    _id: '579034c70560625d6281b6f0',
    assigned_department: '57933111556362511181bbb1', // department ObjectId
    created_time: '2016-12-03',
    detail: casual.text,
    organization: '57933111556362511181aaa1', // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534305, 13.730537951107],
    },
    status: 'assigned',
    is_archived: false,
  },
];
