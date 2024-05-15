const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    signature: String,
    expiration: Date
});

const Token = mongoose.model('Token', tokenSchema, 'tokens');

module.exports = Token;
