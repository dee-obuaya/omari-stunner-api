const express = require('express');
const router = express.Router();

const services = require('../controllers/services');
const handleAsync = require('../utils/handleAsync');
const {validateService} = require('../utils/middleware');


router.route('/')
    .get(handleAsync(services.index))
    .post(validateService, handleAsync(services.addService));


router.route('/:id')
    .put(validateService, handleAsync(services.updateService))
    .delete(handleAsync(services.deleteService));


module.exports = router;