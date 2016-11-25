const casual = require('casual');

module.exports = [
  {
    _id: '579334c75563625d6281b6f6',
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
    detail: casual.text,
    organization: '57933111556362511181aaa1', // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534305, 13.730537951107],
    },
    status: 'assigned',
    is_archived: false,
    assigned_department: '57933111556362511181bbb1', // department ObjectId
  },
];
