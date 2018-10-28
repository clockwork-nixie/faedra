'use strict';

const mysql = require('mysql');
const util = require('util');

const schema = {
    users: require('./users')
};


class DataStore {
    constructor(configuration) {
        this.pool = mysql.createPool(configuration);
               
        const self = this;
        const queryAll = util.promisify(this.pool.query).bind(this.pool);
        const queryOne = (async (...args) => {
            const result = await queryAll.apply(self.pool, args);

            return (result && result.length)? result[0]: null;
        });

        Object.keys(schema).forEach(key => {
            const instance = new schema[key]();

            instance.queryAll = queryAll;
            instance.queryOne = queryOne;

            self[key] = instance;
        });
    }


    ping() {
        return new Promise((resolve) => this.pool.getConnection((error, connection) => {
            if (error) {
                switch (error.code) {
                    case 'PROTOCOL_CONNECTION_LOST':
                        console.error('Database error: connection was closed.');
                        break;

                    case 'ER_CON_COUNT_ERROR':
                        console.error('Database error: too many connections.');
                        break;

                    case 'ECONNREFUSED':
                        console.error('Database error: connection was refused.');
                        break;

                    default:
                        console.error(`Database error: ${error.code} (${error.errno})`);
                        break;
                }
            }
        
            if (connection) {
                connection.release();
            }
            resolve(!error);
        }));
    }
}


module.exports = DataStore;