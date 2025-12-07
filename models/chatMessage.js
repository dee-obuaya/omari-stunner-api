const mongoose = require('mongoose');
const message = require('./message');
const { required } = require('joi');
const Schema = mongoose.Schema;

const ChatMessageSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        index: true,
    },

    senderType: {
        type: String,
        enum: ['visitor', 'admin', 'employee', 'system'],
        required: true,
    },

    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null, // null for user messages
    },

    message: {
        type: String,
        required: false,
    },

    // status indicators
    isSystem: {
        type: Boolean,
        default: false, // 'user left', 'agent joined', etc
    },

    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },

    // future enhancements: attachments, images, etc
    // attachment: {
    //     url: { type: String },
    //     filename: String
    //     size: Number,
    //     mimeType: String,
    // },

    // extra meta (useful for analytics, message origin, etc.)
    meta: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);