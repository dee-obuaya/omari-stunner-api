const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TabSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tab name cannot be blank']
    },
    label: {
        type: String,
        required: [true, 'Tab label cannot be blank']
    },
});

module.exports = mongoose.model('Tab', TabSchema);