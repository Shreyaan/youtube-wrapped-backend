# youtube-wrapped-backend

Backend for youtube wrapped

## Frontend link/ demo 

https://youtube-wrapped.anosher.com/



## API Reference

#### Register

```http
POST /api/uploadjson
```
 send the `watch-history.json` to get the yt wrapped data in res

## Deployment

Fork, then download or clone the repo.

install the dependencies once via the terminal.
```bash
npm install
```

Run the *server*. It listens on port 3004.
```bash
npm statrt
```

remember to build typescript when you make chnage
```bash
tsc
```

## Production

Build the application for production:

```bash
npm run build
```
