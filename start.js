/*
* This is the NODEJS entrypoint: it spawns the requisite number of workers.
*/
const cluster = require('cluster');

const stopSignals = [
  'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
  'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
];

let isStopping = false;

if (cluster.isMaster) {
    // The current thread is the cluster master process so start the configured number of worker processes to run the application.
    const workerCount = process.env.NODE_CLUSTER_WORKERS || 1;

    console.log(`Starting ${workerCount} worker${workerCount==1?'':'s'}...`);

    cluster.on('exit', (worker, exitCode, signal) => {
        if (worker && !isStopping) {
            if (exitCode === 126) { // Non-restart exit code
                isStopping = true;
                console.log(`Fatal exit by child; stopping workers...`);

                cluster.disconnect(function () {
                    console.log('All workers stopped, exiting.');
                    process.exit(0);
                });   
            } else {
                cluster.fork();
            }
        }
    });

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
    process.on('uncaughtException', error => {
        if (error.syscall === 'bind') {
            console.error(`\r\nERROR starting listener for worker ${process.pid}: ${error.code}\r\n`);
            process.exit(126);
        } else {
            console.error(error);
            setTimeout(() => process.exit(1), 1000);
        }
    });

    // The current thread is a worker process, so just run the application.
    require('./server');
}
