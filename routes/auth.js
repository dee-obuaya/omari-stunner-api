const express = require('express');
const router = express.Router();


const authController = require('../controllers/auth');
const {handleLogin} = require('../utils/middleware');


router.get('/check', authController.isAuthenticated);

router.get('/refresh', authController.refreshSession);

router.post('/login', handleLogin, authController.logInUser);

router.post('/logout', authController.logOutUser);

module.exports = router;