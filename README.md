# Himo

This is a real estate ad aggregator web app, a POC aiming to demonstrate basic skills in Node.js, MongoDB, React and Docker.

It contains 4 docker containers:
- `client` : React front end.
- `api` : Node.js API used from the front end to get data from MongoDB.
- `bot` : Node.js bot scrapping continuously real estate adds from different sources.
- `mongo` : MongoDB database.

## To deploy the projet locally:
- create `.env` files in `bot` and `client` directories.
- then:
```
docker compose up
```
## To use the website locally:
http://127.0.0.1
