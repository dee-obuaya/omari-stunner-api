const express = require('express');
const router = express.Router();

const tabs = require('../controllers/tabs');
const handleAsync = require('../utils/handleAsync');
const {validateTab, isLoggedIn} = require('../utils/middleware');


router.route('/')
    .get(handleAsync(tabs.index))
    .post(isLoggedIn, validateTab, handleAsync(tabs.addTab));

router.route('/:id')
    .put(isLoggedIn, validateTab, handleAsync(tabs.updateTab))
    .delete(isLoggedIn, handleAsync(tabs.deleteTab));

module.exports = router;