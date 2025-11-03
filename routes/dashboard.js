const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const handleAsync = require('../utils/handleAsync');


router.route('/bookingsPerMonth')
    .get(handleAsync(dashboard.getGroupedBookings));


router.route('/bookedServiceCount')
    .get(handleAsync(dashboard.bookedServiceCount));


router.route('/statistics')
    .get(handleAsync(dashboard.getStatistics));


module.exports = router;