const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TabSchema = new Schema({
    name: String,
    label: String
});

module.exports = mongoose.model('Tab', TabSchema);