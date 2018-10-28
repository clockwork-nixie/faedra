'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const forceSsl = require('express-force-ssl');
const fs = require('fs');
const helmet = require('helmet');
const https = require('https');
const morgan = require('morgan');
const path = require('path');


class Webserver {
    constructor({ isDebug = false } = {}) {
        this.application = express();
        this.isSsl = false;

        this.application.use(bodyParser.json());
        
        if (isDebug) {
            console.log("WEBSERVER: debug log enabled")
            this.application.use(morgan(function (tokens, request, response) {
                console.log(`WEBSERVER: ${request.method} ${request.path} => ${response.statusCode}`)
            }));
        }

        // Expose use() to allow configuration of additional middleware.
        this.use = this.application.use.bind(this.application);
    }


    alias(name, destination) {
        this.application.get(`/${name}`, function(request, response) {
            response.sendFile(path.join(__dirname, '..', destination));
        });
    }


    configure(component) { component(this.application); }


    listen({ certificate, port = certificate? 443: 80 } = {}) {
        if (certificate && !this.isSsl) {
            this.application.use(helmet());
            this.application.use(forceSsl);   
            this.isSsl = true;
        }

        if (certificate) {
            const options = {
                cert: fs.readFileSync(certificate + '/fullchain.pem'),
                key: fs.readFileSync(certificate + '/privkey.pem')
            };

            https.createServer(options, this.application).listen(port);
            console.log(`HTTPS on port ${port}`);
        } else {
            this.application.listen(port);
            console.log(`HTTP on port ${port}`);
        }
    }

    
    serve(directory) { this.application.use(express.static(directory)); }
}


module.exports = Webserver;
