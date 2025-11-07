const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminActionSchema = new Schema({
    admin: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    targetUser: {
        type: Schema.Types.ObjectId, ref: 'User',
        // required: true
    },
    action: {
        type: String, required: true
    }, // e.g. 'reset_password', 'delete_user', 'update_service'
    message: {
        type: String
    },
    timestamp: {
        type: Date, default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('AdminAction', adminActionSchema);