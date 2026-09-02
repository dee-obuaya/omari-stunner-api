const { v4: uuidv4 } = require('uuid');

const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');

module.exports.createChatSession = async(req, res) => {
    try {
        // const sessionId = uuidv4();
        const { name = null, email = null, ip = null, userAgent = null, anonId = null } = req.body || {};

        const doc = {
            // sessionId,
            user: {name, email, ip,userAgent, anonId},
            isOpen: true,
            startedAt: new Date(),
            lastMessageAt: new Date(),
        };

        const session = await ChatSession.create(doc);

        return res.json({
            ok: true,
            // sessionId,
            session: {
                sessionId: session._id.toString(),
                user: session.user,
                isOpen: session.isOpen,
                startedAt: session.startedAt,
                lastMessageAt: session.lastMessageAt,
            },
        });
    } catch (err) {
        console.error('POST /api/chats error: ', err);
        return res.status(500).json({
            ok: false,
            error: 'Server error'
        });
    }
};

// admin list of sessions (recent first)
// query params (optional): ?open=true|false  ?limit=50
module.exports.getChatSessions = async (req, res) => {
    try {
        const q  = {lastMessage: { $exists: true, $ne: '' }};
        if (req.query.open === 'true') q.isOpen = true;
        if (req.query.open === 'false') q.isOpen = false;

        const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);

        const sessions = await ChatSession.find(q)
            .sort({ lastMessageAt: -1 })
            .limit(limit)
            .lean();

        // Optionally include messagesCount for each session (small extra cost)
        const sessionIds = sessions.map(s => s._id.toString());
        const counts = await ChatMessage.aggregate([
            {
                $addFields: {
                    sessionIdStr: { $toString: '$sessionId' }
                }
            },
            {
                $match: {
                    sessionIdStr: { $in: sessionIds }
                }
            },
            {
                $group: {
                    _id: '$sessionIdStr',
                    count: { $sum: 1 }
                }
            }
        ]);

        const countsMap = counts.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {});

        const shaped = sessions.map(s => ({
            sessionId: s._id.toString(),
            user: s.user,
            assignedStaff: s.assignedStaff || null,
            isOpen: s.isOpen,
            lastMessage: s.lastMessage || null,
            lastMessageAt: s.lastMessageAt,
            startedAt: s.startedAt,
            endedAt: s.endedAt || null,
            messagesCount: countsMap[s._id.toString()] || 0,
        }));

        return res.json({ ok: true, sessions: shaped });
    } catch (err) {
        console.error('GET /api/admin/chats error: ', err);
        return res.status(500).json({ok: false, error: 'server error'});
    }
};

// fetch messages for a session (used by admin when opening a chat)
// query params: ?limit=200 (default newest first, we return ascending by createdAt)
module.exports.getChatSessionMessagesAdmin = async (req, res) => {
    try {
        const { sessionId } = req.params
        const limit = Math.min(parseInt(req.query.limit || '1000', 10), 5000);

        const messages = await ChatMessage.find({ sessionId })
            .sort({ createdAt: 1 }) // oldest -> newest
            .limit(limit)
            .lean();

        return res.json({ ok: true, messages: messages });
    } catch (err) {
        console.error('Get messages for chat session error: ', err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
};

// fetch messages for a session (used by visitor)
module.exports.getChatSessionMessagesVisitor = async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }

    const messages = await ChatMessage.find({ sessionId })
        .sort({ createdAt: 1 });

    return res.json({ messages: messages });
}

// admin posts a system message into a session (e.g., "Agent joined")
// body: { content, meta }
module.exports.postSystemMessage = async (req, res) => {
    const { sessionId } = req.params;
    const {content = '', meta = {} } = req.body || {};

    if (!content && (!meta || Object.keys(meta).length === 0)) {
        return res.status(400).json({
            ok: false,
            error: 'content or meta required'
        })
    }

    const systemMsg = await ChatMessage.create({
        sessionId,
        sender: 'system',
        senderId: null,
        message: content,
        isSystem: true,
        meta,
    });

    // update session preview
    await ChatSession.findByIdAndUpdate(sessionId, {
        $set: { lastMessage: content || '[system]', lastMessageAt: new Date() },
        // $inc: { messagesCount: 1 }
    });

    // broadcast via socket (if your socket server listens to DB or you emit manually in your socket handlers)
    // your socket code should already emit 'message:new' for saved messages; if not, you can integrate here.

    return res.json({ ok: true, message: systemMsg });
};

// admin claims/assigns the session to themselves
// body: none (we use req.user._id)
module.exports.claimSession = async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user && req.user._id;

    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({
        ok: false,
        error: 'Session not found'
    });

    if (!session.assignedStaff) {
        session.assignedStaff = userId;
        await session.save();

        return res.json({ ok: true, session: session })
    } else if (session.assignedStaff.toString() === userId.toString()) {
        return res.json({ok: true, session: session, message: 'Already assigned to you'});
    } else {
        return res.status(409).json({ok: false, error: 'Already assigned to another staff'});
    }
};

// admin ends (closes) the session
module.exports.endSession = async (req, res) => {
    const { sessionId } = req.params;

    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({
        ok: false,
        error: 'Session not found'
    });

    if(!session.isOpen) {
        return res.json({ok: true, message: 'Session already closed'});
    }

    session.isOpen = false;
    session.endedAt = new Date();
    await session.save();

    // optionally create a system message announcing closure
    const sys = await ChatMessage.create({
      sessionId,
      senderType: 'system',
      senderId: null,
      message: 'Session closed by staff',
      isSystem: true,
      meta: { action: 'session_closed', by: req.user ? req.user._id : null },
    });

    // Let admins and the user know — your socket handler should pick up DB writes or you can emit here if you have io instance
    // e.g., io.to(sessionId).emit('session:ended', { sessionId })  <-- only possible if you have io here

    return res.json({ ok: true, session: session });
};