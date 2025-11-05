const express = require('express');
const router = express.Router();

const services = require('../controllers/services');
const handleAsync = require('../utils/handleAsync');
const {validateService, ensureAuthenticated} = require('../utils/middleware');


router.route('/')
    .get(ensureAuthenticated, handleAsync(services.index))
    .post(ensureAuthenticated, validateService, handleAsync(services.addService));


router.route('/:id')
    .put(ensureAuthenticated, validateService, handleAsync(services.updateService))
    .delete(ensureAuthenticated, handleAsync(services.deleteService));


module.exports = router;