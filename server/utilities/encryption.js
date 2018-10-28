'use strict';

const crypto = require('crypto');

const DEFAULT_SALT_LENGTH = 16;


class Encryption {
    static compareHash(hash, text, saltLength) {
        const safeSaltLength = saltLength || DEFAULT_SALT_LENGTH;

        return (hash && text && hash >= safeSaltLength && hash === Encryption.generateHashFromSalt(text, safeSaltLength));
    }


    static generateHash(text, saltLength) {
        const safeSaltLength = saltLength || DEFAULT_SALT_LENGTH;
        const salt = crypto.randomBytes(Math.ceil(safeSaltLength / 2))
            .toString('hex')
            .slice(0, safeSaltLength);

        return Encryption.generateHashFromSalt(text, salt);
    }


    static generateHashFromSalt(text, salt) {
        const hash = crypto.createHmac('sha512', salt);
            
        hash.update(text);
            
        return salt + hash.digest('hex');
    }
};


module.exports = Encryption;
