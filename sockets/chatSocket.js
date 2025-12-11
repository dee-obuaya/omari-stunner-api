const { v4: uuidv4 } = require('uuid');
const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');

let activeAdmins = 0;

module.exports = function initChatSocket(io) {
    io.on('connection', (socket) => {
        console.log('🔌 New socket connected: ', socket.id);

        // track the current session for this socket
        let currentSessionId = null;
        let isAdmin = false;
        let adminId = null;

        // ------ ADMIN JOIN DASHBOARD ------
        socket.on('admin:join', async ({adminId: incomingAdminId}) => {
            isAdmin = true;
            adminId = incomingAdminId;
            console.log(`🛡️ Admin Connected: ${adminId}`)

            activeAdmins++;
            console.log(`🛡️ Admin Connected: ${adminId}, Total admins: ${activeAdmins}`);

            // broadcast online status
            io.emit('admin:status', { online: true });

            // get all open chat sessions
            const sessions = await ChatSession.find({ isOpen: true }, 'sessionId');

            sessions.forEach(s => {
                socket.join(s.sessionId);
                console.log(`📌 Admin auto-joined room: ${s.sessionId}`);
            });

            console.log(`🟢 Admin is now listening to all active chat sessions.`);
        });

        // ------ USER JOINS CHAT (from client website) ------
        // a user provides either:
        //  - an existing sessionId from localStorage
        //  - OR no sessionId (we create one)
        socket.on('user:join', async ({ sessionId, userAgent }) => {
            // create new session if none exists
            if (!sessionId) {
                sessionId = uuidv4();
                console.log('✨ New chat session created: ', sessionId);

                await ChatSession.create({
                    sessionId,
                    user: {
                        userAgent,
                    },
                    startedAt: new Date(),
                });
            } else {
                console.log('📌 User rejoined session: ', sessionId);
            }

            currentSessionId = sessionId;

            // join socket room for this session
            socket.join(sessionId);

            // let admin dashboards know there's a session update
            io.emit('admin:sessions:updated');

            if (isAdmin) {
                socket.join(sessionId);
                console.log(`Admin joined NEW session: ${sessionId}`)
            }

            socket.emit('user:sessionId', {sessionId});
        });

        // ------ TYPING INDICATORS ------
        socket.on('typing', (data) => {
            io.to(data.sessionId).emit('typing', data);
        });


        // ------ SEND MESSAGE ------
        socket.on('message:send', async({sessionId, senderType, message}) => {
            if (!message) return;

            const finalSessionId = senderType === 'visitor' ? currentSessionId : sessionId;

            if (!finalSessionId) return;

            let senderId = null;
            if (['admin', 'employee'].includes(senderType)) senderId = adminId;

            // save message
            const savedMessage = await ChatMessage.create({
                sessionId: finalSessionId,
                senderType,
                senderId,
                message,
            });

            // update session summary
            await ChatSession.findOneAndUpdate(
                { sessionId: finalSessionId },
                {
                    lastMessage: message,
                    lastMessageAt: new Date(),
                }
            );

            // broadcast message to both sides
            io.to(finalSessionId).emit('message:new', savedMessage);

            // notify admin dashboards to refresh session list
            io.emit('admin:sessions:updated');
        });

        // ------ ADMIN JOINS + TAKES OVER A SESSION
        socket.on('admin:joinSession', async ({sessionId}) => {
            currentSessionId = sessionId;
            socket.join(sessionId);

            // assign admin to session if none assigned
            const session = await ChatSession.findOne({ sessionId });
            if (session && !session.assignedStaff) {
                session.assignedStaff = adminId;
                await session.save();
            }

            console.log(`🛡️ Admin ${adminId} joined session ${sessionId}`);

            io.emit('admin:sessions:updated');
        });

        // ------ MARK VISITOR MESSAGES AS SEEN ------
        socket.on('admin:seen', async ({ sessionId }) => {
            if (!sessionId) return;

            // Get all visitor messages that are not yet seen
            const messages = await ChatMessage.find({
                sessionId,
                senderType: 'visitor',
                status: { $ne: 'seen' }
            });
            // console.log("Messages needing seen:", messages.length);

            if (!messages.length) return;

            // update them to seen
            await ChatMessage.updateMany(
                {
                    sessionId,
                    senderType: 'visitor',
                    status: { $ne: 'seen' }
                },
                { status: 'seen' }
            );

            // console.log(`👁️ Messages marked seen in session ${sessionId}`);

            // console.log("Emitting message:status to visitor with", {
            //     messageIds: messages.map(m => m._id),
            //     status: 'seen'
            // });

            // send to visitor
            io.to(sessionId).emit('message:status', {
                sessionId,
                messageIds: messages.map(m => m._id),
                status: 'seen'
            });
        })

        // ------ END SESSION ------
        socket.on('session:end', async ({ sessionId }) => {
            await ChatSession.findOneAndUpdate(
                {sessionId},
                {
                    isOpen: false,
                    endedAt: new Date(),
                }
            );

            io.to(sessionId).emit('session:ended');
            io.emit('admin:session:updated');

            console.log(`💀 Session ended: ${sessionId}`);
        });


        // ------ DISCONNECT ------
        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected: ', socket.id);

            if (isAdmin) {
                activeAdmins--;
                console.log(`🛑 Admin left. Active admins: ${activeAdmins}`);

                if (activeAdmins <= 0) {
                    io.emit('admin:status', { online: false });
                }
            }
        })
    })
}