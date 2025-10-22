const ExpressError = require('./ExpressError');

module.exports.handleValidationError = err => {
    return new ExpressError(400, `Validation Failed: ${err.message}`);
};

module.exports.handleCastError = err => {
    return new ExpressError(400, `Invalid entry: ${err.message}`);
};