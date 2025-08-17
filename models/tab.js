const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TabSchema = new Schema({
    tab: String,
});

module.exports = mongoose.model('Service', TabSchema);