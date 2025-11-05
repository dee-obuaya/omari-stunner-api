const express = require('express');
const router = express.Router();


const auth = require('../controllers/auth');
const {handleLogin} = require('../utils/middleware');


router.get('/check', auth.isAuthenticated);

router.post('/login', handleLogin, auth.logInUser);

router.post('/logout', auth.logOutUser);

module.exports = router;