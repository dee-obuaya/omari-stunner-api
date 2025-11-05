const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema ({
    name: {
        type: String,
        required: [true, 'User name required']
    },
    role: {
        type: String,
        required: [true, 'User role required'],
        enum: ['admin', 'employee']
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);