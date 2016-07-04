# youpin-api

> YouPin API

All API access is over HTTP (for now), and accessed from the `http://api.youpin.city`. All data is sent and received as JSON.

## Temporary Documents
In the end, we will use https://github.com/apidoc/apidoc to host api documentation.
This is just temporary for a small collaboration.

All routing that do insert/update  would need APIKEY:SECRET.
Please ask @parnurzeal to give you one.

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
  -u "<APIKEY>:<SECRET>" \
  -H "Content-Type: application/json" \
  -d "@data.json"
  http://api.youpin.city/pins
```

* `PUT` /pins/:id
```bash
curl -i -X PUT \
  -u "<APIKEY>:<SECRET>" \
  -H "Content-Type: application/json" \
  -d "@data.json"
  http://api.youpin.city/pins
```

* `DELETE` /pins/:id
```bash
curl -i -X DELETE \
  -u "<APIKEY>:<SECRET>" \
  http://api.youpin.city/pins/1
```

### User
* `GET` /users

* `GET` /users/:id

* `POST` /users

* `PUT` /users/:id

* `DELETE` /users/:id

### Photo
* `GET` /photos
TBI
* `GET` /photos/:id
TBI
* `POST` /photos
- Single Photo
```bash
curl -i -X POST \
  -u "<APIKEY>:<SECRET>" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@icon_world.gif" http://api.youpin.city/photos
```
- Multiple Photos
TBI

* `POST` /photos/uploadfromurl
- Single Photo
```bash
curl -i -X POST \
  -u "<APIKEY>:<SECRET>" \
  -H "Content-Type: application/json" \
  -d '"http://i232.photobucket.com/albums/ee274/akapong99/Pangporn/album12/s1-7.jpg"'
  http://api.youpin.city/photos/uploadfromurl
```
- Multiple Photos
TBI

* `PUT` /photos/:id
TBI
* `DELETE` /photos/:id
TBI

### Video
* `GET` /videos
TBI
* `GET` /videos/:id
TBI
* `POST` /videos
TBI
* `PUT` /videos/:id
TBI
* `DELETE` /videos/:id
TBI
## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
