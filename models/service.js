const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    service: {
        type: String,
        required: [true, 'Service name cannot be blank']
    },
    tag: {
        type: String,
        required: [true, 'Service tag cannot be blank'],
        lowercase: true,
        enum: ['makeup', 'lashes', 'brows']
    },
    price: {
        type: Number,
        min: 0
    },
});

module.exports = mongoose.model('Service', ServiceSchema);