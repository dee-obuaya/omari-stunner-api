const express = require('express');
const router = express.Router();

const chats = require('../controllers/chat');
const handleAsync = require('../utils/handleAsync');
const {ensureAuthenticatedStaff} = require('../utils/middleware');

// create new chat session
router.post('/visitor/start', handleAsync(chats.createChatSession));

// admin list of sessions (recent first)
// query params (optional): ?open=true|false  ?limit=50
router.get('/admin/chats', ensureAuthenticatedStaff, handleAsync(chats.getChatSessions));

// fetch messages for a session (used by admin when opening a chat)
// query params: ?limit=200 (default newest first, we return ascending by createdAt)
router.get('/admin/:sessionId/messages', ensureAuthenticatedStaff, handleAsync(chats.getChatSessionMessagesAdmin));

// fetch messages for a session (used by visitors)
router.get('/visitor/:sessionId/messages', handleAsync(chats.getChatSessionMessagesVisitor));

// admin posts a system message into a session (e.g., "Agent joined")
// body: { content, meta }
router.post('/:sessionId/system', ensureAuthenticatedStaff, handleAsync(chats.postSystemMessage));

// admin claims/assigns the session to themselves
// body: none (we use req.user._id)
router.post('/:sessionId/claim', ensureAuthenticatedStaff, handleAsync(chats.claimSession));

// admin ends (closes) the session
router.post('/:sessionId/end', ensureAuthenticatedStaff, handleAsync(chats.endSession));

module.exports = router;