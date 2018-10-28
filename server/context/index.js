'use strict';

const path = require('path');

const DataStore = require('./datastore');


class Context {
    constructor(configuration) {
        this.configuration = configuration;
        this.dataStore = new DataStore(configuration.dataStore);
    }
}


module.exports = Context;
