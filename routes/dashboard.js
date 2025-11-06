const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const handleAsync = require('../utils/handleAsync');
const {isLoggedIn} = require('../utils/middleware');


router.route('/bookingsPerMonth')
    .get(isLoggedIn, handleAsync(dashboard.getGroupedBookings));


router.route('/bookedServiceCount')
    .get(isLoggedIn, handleAsync(dashboard.bookedServiceCount));


router.route('/statistics')
    .get(isLoggedIn, handleAsync(dashboard.getStatistics));


module.exports = router;