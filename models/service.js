const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    service: String,
    tag: String,
    price: Number,
});

module.exports = mongoose.model('Service', ServiceSchema);