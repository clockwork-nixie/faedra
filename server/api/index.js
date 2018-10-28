'use strict';

const Authentication = require('./authentication');


class Api {
    constructor(datastore) {
        this.authentication = new Authentication();
        
        this.datastore = datastore;
        this.registerApi = this.registerApi.bind(this);
        this.registerRoutes = this.registerRoutes.bind(this);
    }


    registerApi(get, post) {
        const self = this;
              
        get('/api/test', (request, response) => response.json({ foo: 'bar' }), { allowAnonymous: true });
            
        post('/api/v1/login', async (request, response) => {
            const username = request.body? request.body.username: null;
            const password = request.body? request.body.password: null;

            if (!username || !password) {
                response.sendStatus(400);
            } else {
                const userId = await self.datastore.getUserId(username, password);

                if (!userId) {
                    response.sendStatus(401);
                } else {
                    const sessionKey = await self.datastore.createSession(userId);

                    if (!sessionKey) {
                        response.sendStatus(500);
                    } else {
                        response.json({ sessionKey });
                    }
                }
            }
        }, { allowAnonymous: true });

        post('/api/v1/register', async (request, response) => {
            const username = request.body? request.body.username: null;
            const password = request.body? request.body.password: null;

            if (!username || !password) {
                response.sendStatus(400);
            } else {
                const userId = await self.datastore.createUser(username, password);

                if (!userId) {
                    response.sendStatus(409);
                } else {
                    const sessionKey = await self.datastore.createSession(userId);

                    if (!sessionKey) {
                        response.sendStatus(401);
                    } else {
                        response.json({ sessionKey: sessionKey });
                    }
                }
            }
        }, { allowAnonymous: true });
    }


    registerRoutes(application) {
        const self = this;
        const get = application.get.bind(application);
        const post = application.post.bind(application);

        const authenticate = (method, route, action, allowAnonymous) =>
            method(route, async (request, response) => {
                try {
                    let user = null;

                    if (!allowAnonymous) {
                        const sessionKey = request.query.sessionKey; // TODO: should come from a header instead.
                        const user = sessionKey? await self.datastore.getUser(sessionKey): null;

                        if (!user) {
                            response.sendStatus(401);
                            return;
                        }
                    }
                    return await action(request, response, user);
                } catch (error) {
                    console.log(`API(${route}): ${error}`);
                    response.sendStatus(500);
                }    
            });

        const getWithAuthentication = (route, action, { allowAnonymous = false } = {}) =>
            authenticate(get, route, action, allowAnonymous);
        const postWithAuthentication = (route, action, { allowAnonymous = false } = {}) =>
            authenticate(post, route, action, allowAnonymous);

        this.registerApi(getWithAuthentication, postWithAuthentication);
    }
}


module.exports = Api;
