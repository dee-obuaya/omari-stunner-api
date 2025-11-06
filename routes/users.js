const express = require('express');
const router = express.Router();

const handleAsync = require('../utils/handleAsync');
const users = require('../controllers/users');
const {isLoggedIn} = require('../utils/middleware');

router.route('/')
    .get(isLoggedIn, handleAsync(users.getUsers))
    .post(isLoggedIn, handleAsync(users.addUser));



module.exports = router