const express = require('express');
const router = express.Router();

const bookings = require('../controllers/bookings');
const handleAsync = require('../utils/handleAsync');
const {validateBooking, isLoggedIn} = require('../utils/middleware');

router.route('/')
    .get(isLoggedIn, handleAsync(bookings.index))
    .post(isLoggedIn, validateBooking, handleAsync(bookings.addBooking));


router.route('/:id')
    .put(isLoggedIn, validateBooking, handleAsync(bookings.updateBooking))
    .delete(isLoggedIn, handleAsync(bookings.deleteBooking));


module.exports = router;