const {serviceSchema, imageSchema, tabSchema, bookingSchema} = require('./joiSchemas');
const ExpressError = require('./ExpressError');

module.exports.validateService = (req, res, next) => {
    const { error } = serviceSchema.validate(req.body);

    if (error) {
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        console.log('msg', msg)
        res.status(400).json({message: msg})
        throw new ExpressError(400, msg);
    } else {
        next();
    };
};

module.exports.validateImage = (req, res, next) => {
    // console.log(typeof(req.body.service))
    const { error } = imageSchema.validate({image: req.file, service: req.body.service});

    if (error) {
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        res.status(400).json({message: msg});
        throw new ExpressError(400, msg);
    } else {
        next();
    };
};

module.exports.validateTab = (req, res, next) => {
    const { error } = tabSchema.validate(req.body);

    if (error) {
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        res.status(400).json({message: msg});
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.validateBooking = (req, res, next) => {
    const {booking} = req.body.booking;
    const { error } = bookingSchema.validate(booking);

    if (error) {
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        res.status(400).json({message: msg});
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};