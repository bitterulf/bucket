'use strict';

const config = require('dotenv').config();

const Hapi = require('hapi');
const fs = require('fs');
const unzip = require('unzip');
const rimraf = require('rimraf');
const Path = require('path');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.connection({
    host: process.env.BUCKET_HOST,
    port: process.env.BUCKET_PORT
});

server.register([require('hapi-auth-basic'), require('inert')], (err) => {
    server.auth.strategy('simple', 'basic', { validateFunc: function (request, username, password, callback) {
        if (username == process.env.BUCKET_USERNAME && password == process.env.BUCKET_PASSWORD) {
            return callback(null, true, {});
        }
        callback(null, false, {});
    }});

    server.route({
        method: 'POST',
        path:'/'+process.env.BUCKET_UPLOAD_ROUTE,
        config: {
            auth: 'simple',
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            },
            handler: function (request, reply) {
                const file = request.payload.file;

                rimraf('./public', function () {
                    file.pipe(unzip.Extract({ path: './public' }));
                });

                return reply('ok');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true
            }
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
