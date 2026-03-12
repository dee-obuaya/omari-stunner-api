const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');

module.exports = function initChatSocket(io) {
    // track connected admins
    const activeAdmins = new Set();

    io.on('connection', (socket) => {
        console.log('Socket connected: ', socket.id);

        // determine role from handshake
        const {role} = socket.handshake.auth || {};

        socket.data.role = role || 'visitor';
        socket.data.sessionId = null;
        socket.data.adminId = null;

        console.log(`Role: ${socket.data.role}`);

        // ----------------------------------------
        // EVENTS
        // ----------------------------------------

        // User Join
        socket.on('user:join', async ({ sessionId }) => {

            try {
                if (!sessionId) {
                    console.log('user:join missing sessionId');
                    return;
                }

                socket.join(sessionId);

                socket.data.sessionId = sessionId;
                socket.data.role = 'visitor';

                console.log(`Visitor joined session ${sessionId}`);

                socket.emit('user:joined', {sessionId});

                socket.emit('admin:status', {
                    online: activeAdmins.size > 0
                });
            } catch (err) {
                console.error('user:join error: ', err);
            }
        });

        // Admin Connect (comes online)
        socket.on('admin:connect', async () => {
            try {

                socket.data.role = 'admin';
                socket.data.adminId = socket.request?.user?._id || socket.id;

                if (socket.data.adminId) {
                    activeAdmins.add(socket.data.adminId);
                }

                console.log(`Admin connected (${activeAdmins.size} online)`);

                io.emit('admin:status', {
                    online: true
                });
            } catch (err) {
                console.error('admin:connect error: ', err);
            }
        });

        // ----------------------------------------
        // DISCONNECT
        // ----------------------------------------
        socket.on('disconnect', () => {
            console.log('Socket disconnected: ', socket.id);

            if (socket.data.role === 'admin' && socket.data.adminId) {
                activeAdmins.delete(socket.data.adminId);

                console.log('Admin disconnected (${activeAdmins.size} online)');

                // if (activeAdmins === 0) {
                    io.emit('admin:status', {online: activeAdmins.size > 0});
                // }
            }
        });
    });
};