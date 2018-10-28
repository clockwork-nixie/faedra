'use strict';

class Test {
    get(request, response /*, context*/) {
        response.json({ foo: 'bar' });
    }


    async getPing(request, response, context) {
        response.json({ result: await context.dataStore.ping() })
    }
}


Test.prototype.get.isAnonymous = true;
Test.prototype.getPing.isAnonymous = true;


module.exports = Test;
