const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const handleAsync = require('../utils/handleAsync');
const {ensureAuthenticated} = require('../utils/middleware');


router.route('/bookingsPerMonth')
    .get(ensureAuthenticated, handleAsync(dashboard.getGroupedBookings));


router.route('/bookedServiceCount')
    .get(ensureAuthenticated, handleAsync(dashboard.bookedServiceCount));


router.route('/statistics')
    .get(ensureAuthenticated, handleAsync(dashboard.getStatistics));


module.exports = router;