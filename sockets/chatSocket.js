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

        // ---------------------------------------------------
        // Auto-register admin sockets (resilience fix)
        // ---------------------------------------------------
        if (socket.data.role === 'admin') {

            socket.data.adminId = socket.request?.user?._id || socket.id

            activeAdmins.add(socket.data.adminId);

            console.log(`Admin connected (${activeAdmins.size} online)`);

            io.emit('admin:status', {
                online: activeAdmins.size > 0
            });
        }

        // ----------------------------------------
        // EVENTS
        // ----------------------------------------
        socket.on('message:seen', async ({ sessionId }) => {
            try {
                if (!sessionId) return;

                await ChatMessage.updateMany(
                    {
                        sessionId,
                        sender: 'visitor',
                        status: { $in: ['sent', 'delivered'] }
                    },
                    {
                        status: 'seen'
                    }
                );

                io.to(sessionId).emit('message:status', {
                    sessionId: sessionId.toString(),
                    status: 'seen'
                });

                console.log(`👁️ Messages seen in ${sessionId}`);
            } catch (err) {
                console.error('message:seen error:', err);
            }
        });

        // ---------------------------------
        // USERS
        // ---------------------------------

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

                // console.log(`Visitor joined session ${sessionId}`);
                console.log(`👤 Visitor joined room: ${sessionId}`);

                socket.emit('user:joined', {sessionId});

                socket.emit('admin:status', {
                    online: activeAdmins.size > 0
                });

                // visitor receive history (sync safety)
                const messages = await ChatMessage.find({ sessionId })
                    .sort({ createdAt: 1 });

                socket.emit('chat:history', messages);
            } catch (err) {
                console.error('user:join error: ', err);
            }
        });

        // User Sends Message
        socket.on('user:sendMessage', async (payload) => {
            console.log('📩 user:sendMessage received:', payload);
            try {
                console.log("➡️ Incoming data:", {
                    sessionId: payload.sessionId,
                    type: typeof payload.sessionId
                });
                let { sessionId, message } = payload;

                if (!message) return;

                // create session if none exists
                let isNewSession = false;

                if (!sessionId) {
                    const newSession = await ChatSession.create({
                        user: {},
                        isOpen: true,
                        startedAt: new Date(),
                        lastMessageAt: new Date()
                    });

                    sessionId = newSession._id.toString();
                    isNewSession = true;

                    socket.join(sessionId);
                    socket.data.sessionId = sessionId;

                    socket.emit('session:created', { sessionId });
                } else {
                    socket.join(sessionId);
                }
                // if (!sessionId) {
                //     console.log("🆕 Creating new session...");
                //     const newSession = await ChatSession.create({
                //         user: {},
                //         isOpen: true,
                //         startedAt: new Date(),
                //         lastMessageAt: new Date()
                //     });
                //     sessionId = newSession._id.toString();

                //     console.log("✅ Session created:", newSession.id);

                //     socket.join(sessionId);

                //     socket.data.sessionId = sessionId;

                //     socket.emit('session:created', { sessionId });

                //     console.log(`New chat session created: ${sessionId}`);

                //     // io.to('admins').emit('chat:newSession', {
                //     //     _id: sessionId,
                //     //     lastMessage: message,
                //     //     lastMessageAt: new Date(),
                //     //     startedAt: newSession.startedAt
                //     // });
                // } else {
                //     socket.join(sessionId);
                // }

                // save message
                const savedMessage = await ChatMessage.create({
                    sessionId,
                    sender: 'visitor',
                    message,
                    status: 'sent',
                    createdAt: new Date()
                });

                // update session last message time
                await ChatSession.updateOne(
                    { _id: sessionId },
                    {
                        lastMessage: message,
                        lastMessageAt: new Date()
                    }
                )

                // emit message
                // send to users in chat
                io.to(sessionId).emit('chat:message', {
                    _id: savedMessage._id,
                    sessionId: sessionId.toString(),
                    sender: 'visitor',
                    message: savedMessage.message,
                    status: savedMessage.status,
                    createdAt: savedMessage.createdAt
                });

                // send to admins globally
                io.to('admins').emit('chat:message', {
                    _id: savedMessage._id,
                    sessionId: sessionId.toString(),
                    sender: 'visitor',
                    message: savedMessage.message,
                    status: savedMessage.status,
                    createdAt: savedMessage.createdAt
                })

                // const isNewSession = !payload.sessionId;

                if (isNewSession) {
                    console.log('🚨 EMITTING NEW SESSION:', sessionId);

                    io.to('admins').emit('chat:newSession', {
                        _id: sessionId,
                        lastMessage: savedMessage.message,
                        lastMessageAt: savedMessage.createdAt,
                        startedAt: new Date()
                    });
                }

                console.log(`Visitor message in ${sessionId}`);
            } catch (err) {
                console.error('user:sendMessage error: ', err);
            }
        });


        // ---------------------------------
        // ADMIN
        // ---------------------------------

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
                    online: activeAdmins.size > 0
                });

            // mark all undelivered messages as delivered

            const messagesToDeliver = await ChatMessage.find({
                sender: 'visitor',
                status: 'sent',
            });

            // downgrade protection
            const result = await ChatMessage.updateMany(
                {
                    _id: { $in: messagesToDeliver.map(m => m._id) },
                    status: 'sent'
                },
                { status: 'delivered' }
            );

            messagesToDeliver.forEach(msg => {
                io.to(msg.sessionId.toString()).emit('message:status', {
                    sessionId: msg.sessionId.toString(),
                    status: 'delivered'
                });
            });

            console.log(`Delivered ${result.modifiedCount} messages`);

            } catch (err) {
                console.error('admin:connect error: ', err);
            }
        });

        // Admin join
        socket.on('admin:join', () => {
            socket.join('admins');
        });

        // Admin Join Session
        socket.on('admin:joinSession', async ({ sessionId }) => {
            console.log('joinSession received: ', sessionId);
            try {
                if (!sessionId) return;

                socket.join(sessionId);

                console.log(`Admin joined session ${sessionId}`);

                // send existing messages
                const messages = await ChatMessage.find({ sessionId })
                    .sort({ createdAt: 1 });
                console.log('messages found: ', messages.length);

                socket.emit('chat:history', messages);
                console.log(`📦 Sending ${messages.length} messages`);
            } catch (err) {
                console.error('admin:joinSession error: ', err);
            }
        });

        // ----------------------------------------
        // DISCONNECT
        // ----------------------------------------
        socket.on('disconnect', () => {
            console.log('Socket disconnected: ', socket.id);

            if (socket.data.role === 'admin' && socket.data.adminId) {
                activeAdmins.delete(socket.data.adminId);

                console.log(`Admin disconnected (${activeAdmins.size} online)`);

                // if (activeAdmins === 0) {
                    io.emit('admin:status', {online: activeAdmins.size > 0});
                // }
            }
        });
    });
};