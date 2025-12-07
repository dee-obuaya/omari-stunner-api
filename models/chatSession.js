const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    // optional user metadata (filled if provided)
    user: {
        name: { type: String, default: null },
        email: { type: String, default: null },
        ip: { type: String, default: null },
        userAgent: {type: String, default: null },
        anonId: { type: String, default: null }
    },

    // staff assignment
    assignedStaff: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },

    // session lifecycle
    isOpen: {type: Boolean, default: true},
    startedAt: {type: Date, default: Date.now},
    endedAt: {type: Date},

    // last message preview to render sidebar quickly
    lastMessage: {
        type: String,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

ChatSessionSchema.index({ lastMessageAt: -1 });
ChatSessionSchema.index({ isOpen: 1 });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);