'use strict';

const nconf = require('nconf');
const path = require('path');

const configuration = nconf
    .argv()
    .file('defaults', 'server.config.json')
    .file('secrets', 'server.secret.json');

module.exports = {
    isSystest: configuration.get('systest') === "true",
    dataStore: {
        user: configuration.get('dataStoreUsername'),
        password: configuration.get('dataStorePassword'),
        host: configuration.get('dataStoreHost'),
        database: configuration.get('dataStoreSchema'),
        connectionLimit: parseInt(configuration.get('dataStoreConnectionLimit')),
        ssl: configuration.get('dataStoreSslCa')? {'ssl': {'ca': path.join(__dirname, configuration.get('dataStoreSslCa')) }}: undefined
    },
    webserver: {
        certificate: configuration.get('certificate'),
        port: configuration.get('port'),
        sslPort: configuration.get('sslPort')
    }
};