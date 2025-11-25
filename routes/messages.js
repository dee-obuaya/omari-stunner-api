const express = require('express');
const router = express.Router();

const messages = require('../controllers/messages');
const handleAsync = require('../utils/handleAsync');
const { isLoggedIn, validateMessage } = require('../utils/middleware');

router.route('/')
    .get(isLoggedIn, handleAsync(messages.index))
    .post(validateMessage, handleAsync(messages.createMessage));

router.route('/:id')
    .delete(isLoggedIn, handleAsync(messages.deleteMessage));

module.exports = router;