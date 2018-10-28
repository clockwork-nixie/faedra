'use strict';

/*
* This is the NODEJS entrypoint: it spawns the requisite number of workers.
*/
const cluster = require('cluster');

const stopSignals = [
  'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
  'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
];

let isStopping = false;

// Handle the disconnect event: if we're not stopping the cluster, an exiting worker needs restarting using fork().
cluster.on('disconnect', function (/*worker*/) {
    if (!isStopping) {
        cluster.fork();
    }
});


if (cluster.isMaster) {
    // This is the cluster master process so start the configured number of worker processes to run the application.
    const workerCount = process.env.NODE_CLUSTER_WORKERS || 1;

    console.log(`Starting ${workerCount} worker${workerCount==1?'':'s'}...`);

    for (let i = 0; i < workerCount; i++) {
        cluster.fork();
    }

    stopSignals.forEach(function (signal) {
        process.on(signal, function () {
            isStopping = true;
            console.log(`Got ${signal}, stopping workers...`);
            cluster.disconnect(function () {
                console.log('All workers stopped, exiting.');
                process.exit(0);
            });
        });
    });
} else {
    // This is a worker process, so just run the application.
    require('./server');
}
