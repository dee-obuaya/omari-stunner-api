const express = require('express');
const router = express.Router();
const passport = require('passport');

const handleAsync = require('../utils/handleAsync');
const users = require('../controllers/users');
const {ensureAuthenticated} = require('../utils/middleware');

router.route('/')
    .get(ensureAuthenticated, handleAsync(users.getUsers))
    .post(ensureAuthenticated, handleAsync(users.addUser));



module.exports = router