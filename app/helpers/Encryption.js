var crypto = require('crypto');
var config = require('../../config');
const bcrypt = require('bcryptjs')

function encrypt(text) {
    var algorithm = config.algorithm;
    var cryptoKey = config.cryptoKey;
    var cipher = crypto.createCipheriv(algorithm, cryptoKey);
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
}

function decrypt(text){
    var algorithm = config.algorithm;
    var cryptoKey = config.cryptoKey;
    var encrypted = text;
    var decipher = crypto.createDecipheriv(algorithm, cryptoKey);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}

function compareHashedPassword(password, hashedPassword, response) {
    bcrypt.compare(password, hashedPassword, function (err, isMatch) {
        response(err, isMatch);
    });
}

function compareHashedPasswordAsync(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword)
}

function generateHashedPassword(password, response) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            // Store hash in your password DB.
            response(err, hash);
        })
    });
}

function generateHashedPasswordAsync(password) {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
}

module.exports = {
    encrypt,
    decrypt,
    compareHashedPassword,
    compareHashedPasswordAsync,
    generateHashedPassword,
    generateHashedPasswordAsync
}