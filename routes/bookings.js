const express = require('express');
const router = express.Router();

const bookings = require('../controllers/bookings');
const handleAsync = require('../utils/handleAsync');
const {validateBooking, ensureAuthenticated} = require('../utils/middleware');

router.route('/')
    .get(ensureAuthenticated, handleAsync(bookings.index))
    .post(ensureAuthenticated, validateBooking, handleAsync(bookings.addBooking));


router.route('/:id')
    .put(ensureAuthenticated, validateBooking, handleAsync(bookings.updateBooking))
    .delete(ensureAuthenticated, handleAsync(bookings.deleteBooking));


module.exports = router;