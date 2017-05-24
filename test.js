'use strict';

const config = require('dotenv').config();

const unirest = require('unirest');

const host = process.env.BUCKET_HOST;
const port = process.env.BUCKET_PORT;
const route = process.env.BUCKET_UPLOAD_ROUTE;

unirest.post('http://'+host+':'+port+'/'+route)
    .auth({
      user: process.env.BUCKET_USERNAME,
      pass: process.env.BUCKET_PASSWORD,
      sendImmediately: true
    })
    .headers({'Content-Type': 'multipart/form-data'})
    .attach('file', './testpage.zip')
    .end(function (response) {
        console.log(response.body);
    });
