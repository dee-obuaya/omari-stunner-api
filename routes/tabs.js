const express = require('express');
const router = express.Router();

const tabs = require('../controllers/tabs');
const handleAsync = require('../utils/handleAsync');
const {validateTab} = require('../utils/middleware');


router.route('/')
    .get(handleAsync(tabs.index))
    .post(validateTab, handleAsync(tabs.addTab));

router.route('/:id')
    .put(validateTab, handleAsync(tabs.updateTab))
    .delete(handleAsync(tabs.deleteTab));

module.exports = router;