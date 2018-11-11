'use strict';

const fs = require('fs');
const nconf = require('nconf');
const path = require('path');

const PRIVATE_CONFIG_FILE = 'server.secret.json';
const PUBLIC_CONFIG_FILE = 'server.config.json';

const configuration = nconf
    .argv()
    .file('defaults', PUBLIC_CONFIG_FILE)
    .file('secrets', PRIVATE_CONFIG_FILE);

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