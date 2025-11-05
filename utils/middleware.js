const {serviceSchema, imageSchema, tabSchema, bookingSchema} = require('./joiSchemas');
const ExpressError = require('./ExpressError');
const passport = require('passport');

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
        // console.log(msg);
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
        // console.log(msg);
        res.status(400).json({message: msg});
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.handleLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            // Authentication failed
            return res.status(401).json({
                success: false,
                message: info?.message || 'Invalid credentials',
            });
        }

        // Log the user in manually
        req.logIn(user, (err) => {
            if (err) return next(err);

            // Attach user for next middleware
            req.authenticatedUser = {
                // id: user.id,
                name: user.name,
                role: user.role,
            };

            // 👇🏽 Hand control to controller
            next();
        });
    })(req, res, next);
};

module.exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
};
