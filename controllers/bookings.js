const Booking = require('../models/bookings');
const Service = require('../models/service');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    try {
        // parse query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'created_at'
        const sortOrder = req.query.order === 'desc' ? -1 : 1;

        // ------ Filters ------
        const filters = {};
        if (req.query.status && req.query.status !== 'All') {
            filters.status = req.query.status;
        };
        if (req.query.paymentStatus && req.query.paymentStatus !== 'All') {
            filters.paymentStatus = req.query.paymentStatus;
        };
        if (req.query.client) {
            filters.client = req.query.client;
        };
        if (req.query.search) {
            filters.$or = [
                { 'client.name': { $regex: req.query.search, $options: 'i' } },
                { 'service.name': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        // ------ Queries ------
        const [bookings, total] = await Promise.all([
            Booking.find(filters)
                .sort({ [sortField]: sortOrder})
                .skip(skip)
                .limit(limit)
                .populate('clientService', 'service'),
                Booking.countDocuments(filters),
        ]);
        // const bookings = await Booking.find({}).populate('clientService', 'service');

        // ------ Response ------
        if (bookings.length > 0) {
            res.status(200).json({
                bookings: bookings,
                pagination: {
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                },
            });
        } else {
            res.status(404).json({message: 'No bookings found'});
        };
    } catch (e) {
        console.error(e);
        res.status(500).json({message: 'Failed to fetch bookings'});
    }
};

module.exports.addBooking = async (req, res) => {
    const {booking} = req.body;
    const bookedService = await Service.findOne({service: booking.clientService});

    const newBooking = new Booking({...booking, clientService: bookedService._id});


    await newBooking.save();
    console.log('saved booking: ', newBooking);

    res.status(200).json({booking: newBooking, message: 'Booking created successfully'});
};

// module.exports.importBookings = async (req, res) => {};

module.exports.updateBooking = async(req, res) => {
    const {id} = req.params;
    // console.log('booking id to update: ', id);
    const {booking} = req.body;
    // console.log('booking data to update: ', booking);

    const bookedService = await Service.findOne({service: booking.clientService});
    // console.log('booked service found: ', bookedService);

    const updatedBooking = await Booking.findByIdAndUpdate(id, {...booking, clientService: bookedService._id}, { new: true, runValidators: true });

    if (!updatedBooking) {
        res.status(404).json({message: 'Could not update booking'});
        throw new ExpressError(404, 'Could not update booking');
    };

    res.status(200).json({booking: updatedBooking, message: 'Booking updated successfully'});
};

module.exports.deleteBooking = async (req, res) => {
    const { id } = req.params;

    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
        return res.status(404).json({ message: 'Could not delete booking' });
    };

    res.status(200).json({ message: 'Booking deleted successfully' });
};