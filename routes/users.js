const express = require('express');
const router = express.Router();

const handleAsync = require('../utils/handleAsync');
const userController = require('../controllers/users');
const {isLoggedIn, isAdmin} = require('../utils/middleware');

router.route('/')
    .get(isLoggedIn, handleAsync(userController.getUsers))
    .post(isLoggedIn, isAdmin, handleAsync(userController.addUser));

router.put('/reset-password/:id', isLoggedIn, isAdmin, handleAsync(userController.resetPassword))

router.delete('/:id', isLoggedIn, isAdmin, handleAsync(userController.deleteUser));

module.exports = router