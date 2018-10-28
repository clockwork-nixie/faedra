'use strict';


class Users {
    async getByUsername(username) {
        return this.queryOne("SELECT id, password_hash passwordHash FROM Users WHERE username = ?", [username]);
    }

    async getBySessionKey(sessionKey) {
        return this.queryOne("SELECT id, password_hash passwordHash FROM Users WHERE sessionKey = ?", [sessionKey]);
    }

    async updateSessionKey(id, sessionKey) {
        return this.queryAll("UPDATE Users SET sessionKey = ? WHERE id = ?", [sessionKey, id]);
    }
}


module.exports = Users;