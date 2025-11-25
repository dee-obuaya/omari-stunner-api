const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank']
    },
    phone: {
        type: String,
        required: [true, 'Phone number cannot be blank']
    },
    body: {
        type: String,
        required: [true, 'Message cannot be blank']
    },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);