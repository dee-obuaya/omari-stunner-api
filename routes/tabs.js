const express = require('express');
const router = express.Router();

const tabs = require('../controllers/tabs');
const handleAsync = require('../utils/handleAsync');
const {validateTab, ensureAuthenticated} = require('../utils/middleware');


router.route('/')
    .get(ensureAuthenticated, handleAsync(tabs.index))
    .post(ensureAuthenticated, validateTab, handleAsync(tabs.addTab));

router.route('/:id')
    .put(ensureAuthenticated, validateTab, handleAsync(tabs.updateTab))
    .delete(ensureAuthenticated, handleAsync(tabs.deleteTab));

module.exports = router;