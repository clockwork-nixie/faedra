'use strict';

const uuid = require('uuid/v5');

const Encryption = require('../../utilities/encryption');


class Authentication {
    constructor(context) {
        this.dataStore = context.dataStore;
    }


    async getHash(request, response) {
        const password = request.query.password;

        response.json(password? { hash: Encryption.generateHash(password) }: {});
    }


    async getLogin(request, response) {
        const username = request.query? request.query.username: null;
        const password = request.query? request.query.password: null;

        if (!username || !password) {
            response.sendStatus(400);
        } else {
            const user = await this.dataStore.users.getByUsername(username);

            if (!user || Encryption.compareHash(user.passwordHash, password)) {
                response.sendStatus(401);
            } else {
                const sessionKey = `${user.id}:${uuid('session-id', '62f362d9-8eae-415c-9684-8b2e26a24833')}`;

                console.log(await this.dataStore.users.updateSessionKey(user.id, sessionKey));

                response.json({ sessionKey });
            }
        }
    }


    async postLogin(request, response) {
        const username = request.body? request.body.username: null;
        const password = request.body? request.body.password: null;

        if (!username || !password) {
            response.sendStatus(400);
        } else {
            const user = await this.dataStore.users.getByUsername(username);

            if (!user || Encryption.compareHash(user.passwordHash, password)) {
                response.sendStatus(401);
            } else {
                const sessionKey = `${user.id}:${uuid('session-id', '62f362d9-8eae-415c-9684-8b2e26a24833')}`;

                await this.dataStore.users.updateSessionKey(user.id, sessionKey);

                response.json({ sessionKey });
            }
        }
    }
    
    
    async postLogout(request, response, user) {
        await this.dataStore.users.updateSessionKey(user.id, null);
        response.sendStatus(200);
    }


    async postRegister(request, response) {
        const username = request.body? request.body.username: null;
        const password = request.body? request.body.password: null;

        if (!username || !password) {
            response.sendStatus(400);
        } else {
            const userId = await this.dataStore.createUser(username, password);

            if (!userId) {
                response.sendStatus(409);
            } else {
                const sessionKey = await this.dataStore.createSession(userId);

                if (!sessionKey) {
                    response.sendStatus(401);
                } else {
                    response.json({ sessionKey: sessionKey });
                }
            }
        }
    }
}


Authentication.isAnonymous = true;
Authentication.prototype.postLogout.isAnonymous = false;


module.exports = Authentication;
