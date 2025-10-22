const express = require('express');
const router = express.Router();

const bookings = require('../controllers/bookings');
const handleAsync = require('../utils/handleAsync');
const {validateBooking} = require('../utils/middleware');

router.route('/')
    .get(handleAsync(bookings.index))
    .post(validateBooking, handleAsync(bookings.addBooking));


router.route('/:id')
    .put(validateBooking, handleAsync(bookings.updateBooking))
    .delete(handleAsync(bookings.deleteBooking));


module.exports = router;