'use strict';

const controllers = require('./controllers');


class ApiActionCache {
    constructor(application, context) {
        this.actions = {};
        this.application = application;
        this.context = context;
    }

    async addBinding(method) {
        const binding = this.application[method.toLowerCase()].bind(this.application);
        const context = this.context;

        this.actions[method.toUpperCase()] = {
            withAuthentication: (route, action) => {
                binding(route, async (request, response) => {
                    try {
                        const sessionKey = request.query.sessionKey || (request.body && request.body.sessionKey); // TODO: should come from a header instead.
                        const user = sessionKey? await self.context.dataStore.users.getBySessionKey(sessionKey): null;

                        if (!user) {
                            response.sendStatus(401);
                            return;
                        }
                        return await action(request, response, user);
                    } catch (error) {
                        console.log(`API ${method.toUpperCase()}(${route}): ${error}`);
                        response.sendStatus(500);
                    }
                });
            },

            withoutAuthentication: (route, action) => {
                binding(route, async (request, response) => {
                    try {
                        return await action(request, response, null);
                    } catch (error) {
                        console.log(`API ${method.toUpperCase()}(${route}): ${error}`);
                        response.sendStatus(500);
                    }
                });
            }
        };
    }


    bindMethods(prefix, controller) {
        const controllerName = controller.name.toLowerCase();
        const descriptors = Object.getOwnPropertyDescriptors(controller.prototype);
        const instance = new controller(this.context);
    
        for (const propertyName in descriptors) {
            const routine = descriptors[propertyName].value;
    
            if (propertyName !=='constructor' && typeof (routine) === 'function') {
                const words = propertyName.split(/(?=[A-Z])/);
    
                if (!words.length) {
                    console.error(`API: Unable to map route for ${controllerName}.${propertyName}: invalid naming.`);
                } else {
                    const method = words[0].toUpperCase();
                    const route = words.slice(1).map(word => word.toLowerCase()).join('-');
                    const mapping = this.actions[method];

                    if (!method) {
                        console.error(`API: Invalid method for ${controllerName}.${propertyName}: ${method}.`);
                    } else {
                        const absoluteRoute = `${prefix}/${controllerName}${route? '/': ''}${route}`;
                        const register = routine.isAnonymous?
                            mapping.withoutAuthentication:
                            mapping.withAuthentication;

                        if (this.context.configuration.isSystest) {
                            console.log(`API: registering ${method.toUpperCase()} ${absoluteRoute}`);
                        }
                        register(absoluteRoute, routine.bind(instance));
                    }
                }
            }
        }
    }
}


class Api {
    constructor(prefix, context) {
        this.context = context;
        this.prefix = prefix;
        this.registerRoutes = this.registerRoutes.bind(this);
    }

    registerRoutes(application) {
        const self = this;
        const cache = new ApiActionCache(application, this.context);
        const methods = [ "GET", "POST", "PUT", "DELETE" ];

        methods.forEach(method => cache.addBinding(method));
        controllers.forEach(controller => cache.bindMethods(self.prefix, controller));
    }
}


module.exports = Api;
