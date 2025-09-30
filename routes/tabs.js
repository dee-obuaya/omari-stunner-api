const express = require('express');
const router = express.Router();

const tabs = require('../controllers/tabs');
const handleAsync = require('../utils/handleAsync');


router.get('/', handleAsync(tabs.index));

module.exports = router;