const Booking = require('../models/booking');
const Service = require('../models/service');
const Image = require('../models/image');

module.exports.getGroupedBookings = async (req, res) => {
    const bookings = await Booking.find({}).select('appointmentDate');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const grouped = {};

    bookings.forEach(booking => {
        const date = new Date(booking.appointmentDate);
        const year = date.getFullYear();
        const monthName = months[date.getMonth()];

        if (!grouped[year]) {
            grouped[year] = {}; // e.g., grouped[2025] = {}
        }

        if (!grouped[year][monthName]) {
            grouped[year][monthName] = 0; // start count at 0
        }

        grouped[year][monthName]++; // count one booking
    });

    const currentYear = new Date().getFullYear();

    const chartData = months.map(month => ({
        month,
        bookings: grouped[currentYear]?.[month] || 0, // fallback to 0 if no bookings
    }));

    // console.log(chartData);

    res.status(200).json({data: chartData})
};

module.exports.bookedServiceCount = async (req, res) => {
    const bookings = await Booking.find({}).select('clientService').populate('clientService', 'service');

    const serviceCounts = {};

    bookings.forEach(booking => {
        const service = booking.clientService;

        if (!service) return; // skip if service missing

        if (!serviceCounts[service.service]) {
            serviceCounts[service.service] = 0;
        }

        serviceCounts[service.service]++;
    });

    const serviceData = Object.entries(serviceCounts).map(([service, count]) => ({
        service: service,
        bookedCount: count,
    }));


    // console.log(serviceData);

    res.status(200).json({data: serviceData})

};

module.exports.getStatistics = async (req, res) => {
    const bookingsCount = await Booking.countDocuments({});

    const cancelledBookings = await Booking.countDocuments({status: 'Cancelled'});
    const pendingBookings = await Booking.countDocuments({status: 'Pending'});
    const completedBookings = await Booking.countDocuments({status: 'Completed'})

    const servicesCount = await Service.countDocuments({});

    const imageCount = await Image.countDocuments({});

    // console.log({
    //     totalBookings: bookingsCount,
    //     totalServices: servicesCount,
    //     totalImages: imageCount
    // })

    res.status(200).json({
        data: {
            totalBookings: bookingsCount,
            totalServices: servicesCount,
            totalImages: imageCount,
            cancelledBookings: cancelledBookings,
            pendingBookings: pendingBookings,
            completedBookings: completedBookings,
        }
    });
};