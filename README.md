# youpin-api

> YouPin API

All API access is over HTTP (for now), and accessed from the `http://api.youpin.city`. All data is sent and received as JSON.

## Temporary Documents
In the end, we will use https://github.com/apidoc/apidoc to host api documentation.
This is just temporary for a small collaboration.

### Pin
* `GET` /pins
```bash
curl -i -X GET http://api.youpin.city/pins
```

* `GET` /pins/:id
```bash
curl -i -X GET http://api.youpin.city/pins/1
```

* `POST` /pins
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d "@data.json"
  http://api.youpin.city/pins
```

* `PUT` /pins/:id
```bash
curl -i -X PUT \
  -H "Content-Type: application/json" \
  -d "@data.json"
  http://api.youpin.city/pins
```

* `DELETE` /pins/:id
```bash
curl -i -X DELETE http://api.youpin.city/pins/1
```

### User
* `GET` /users

* `GET` /users/:id

* `POST` /users

* `PUT` /users/:id

* `DELETE` /users/:id

### Comment
* `GET` /comments

* `GET` /comments/:id

* `POST` /comments

* `PUT` /comments/:id

* `DELETE` /comments/:id

### Photo
* `GET` /photos
TBI
* `GET` /photos/:id
TBI
* `POST` /photos
- Single Photo
```bash
curl -i -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "image=@icon_world.gif" http://api.youpin.city/photos
```
- Multiple Photos
TBI

* `PUT` /photos/:id
TBI
* `DELETE` /photos/:id
TBI

### Video
* `GET` /videos

* `GET` /videos/:id

* `POST` /videos

* `PUT` /videos/:id

* `DELETE` /videos/:id

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
