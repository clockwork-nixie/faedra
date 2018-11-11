'use strict';

const fs = require('fs');
const Api = require('./api');
const Context = require('./context');
const Webserver = require('./webserver');
const configuration = require('./configuration');


const context = new Context(configuration);
const api = new Api('/api/v1', context);
const webserver = new Webserver({ isDebug: configuration.isSystest });

webserver.configure(api.registerRoutes);
webserver.serve('public');
webserver.alias('', 'public/index.html');
webserver.use((request, response) => response.sendStatus(404));

if (configuration.webserver.certificate) {
    if (fs.existsSync(configuration.webserver.certificate)) {
        webserver.listen({
            certificate: configuration.webserver.certificate,
            port: configuration.webserver.sslPort
        });
    } else {
        console.warn("WARNING: HTTPS certificate missing - running as HTTP only.")
    }
}
webserver.listen({ port: configuration.webserver.port });

console.log(`APPLICATION: started worker ${process.pid}.`);
