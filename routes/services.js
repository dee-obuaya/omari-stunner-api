const express = require('express');
const router = express.Router();

const services = require('../controllers/services');
const handleAsync = require('../utils/handleAsync');
const {validateService, isLoggedIn} = require('../utils/middleware');


router.route('/')
    .get(isLoggedIn, handleAsync(services.index))
    .post(isLoggedIn, validateService, handleAsync(services.addService));


router.route('/:id')
    .put(isLoggedIn, validateService, handleAsync(services.updateService))
    .delete(isLoggedIn, handleAsync(services.deleteService));


module.exports = router;