Welcome to YouPin API documents.

This document explains how you can create/retrive/modify/delete information in YouPin database.

To retrieve information from YouPin API, you are ready to go.
But if you want to create/modify/delete data, you need to ask YouPin team to create user account for you.
The team will provide you a password that you will use to access YouPin API.

YouPin API is using Basic Authentication with an exchange of JWT token.
This means you need to send one request with your username & password to `/auth/local`.
YouPin API will then return you with a JWT token that you will use to create/modiy/delete data in YouPin API.

Note that JWT token has one-day lifetime.
This means that after you request for the JWT token, it can be used only within a day.
You need to put a mechanism to refresh and get a new token after the old token is expired.

An example of curl command to create Pin:

1. Request token

Curl command:
```
curl -X POST https://dev.api.youpin.city/auth/local \
  -H "Content-Type: application/json" \
  -d '{ "email":"a@youpin.city", "password":"a"}'
```

Response with JWT token returning:
```
{
  "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzlhZDcwNzVjMWE4ODU5ZWNlNGE0YTciLCJpYXQiOjE0Njk4NDU3NTEsImV4cCI6MTQ2OTkzMjE1MSwiaXNzIjoiZmVhdGhlcnMifQ.U_2iQqTgQH3wqV-PyW-iyFFfzYNfkLOkuQefu6KSKtQ",
  "data":{
    "_id":"579ad7075c1a8859ece4a4a7",
    "name":"A",
    "phone":"081-000-0000",
    "email":"a@youpin.city",
    "role":"admin",
    "__v":0,
    "owner_app_id":[],
    "customer_app_id":[],
    "updated_time":"2016-07-29T04:09:43.430Z",
    "created_time":"2016-07-29T04:09:43.430Z"
  }
}
```

2. Take token and use it in any following request. For example to post Pin:

Note that to post Pin, owner id and provider id are required.
Please use _id from the previous step and fill them in.

Curl command:
```
curl -X POST https://dev.api.youpin.city/pins \
  -H "Content-Type: application/json" \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzlhZDcwNzVjMWE4ODU5ZWNlNGE0YTciLCJpYXQiOjE0Njk3OTI5MTMsImV4cCI6MTQ2OTg3OTMxMywiaXNzIjoiZmVhdGhlcnMifQ.2uC9BkzylgaYVE889eL8qU9glWgHwFJqZHBTmllsHl0' \
  -d '{"detail":"example pin", "owner": "579ad7075c1a8859ece4a4a7", "provider": "579ad7075c1a8859ece4a4a7"}'
```

Success Response:
```
{
  "__v":0,
  "detail":"example pin",
  "owner":"579ad7075c1a8859ece4a4a7",
  "provider":"579ad7075c1a8859ece4a4a7",
  "_id":"579c1265520824dc88eb4ad8",
  "videos":[],
  "voters":[],
  "comments":[],
  "tags":[],
  "location":{
    "coordinates":[100.5018549,13.756727],
    "type":"Point"
  },
  "photos":[],
  "neighborhood":[],
  "mentions":[],
  "followers":[],
  "updated_time":"2016-07-30T02:35:17.831Z",
  "created_time":"2016-07-30T02:35:17.831Z",
  "categories":[]
}
```
