const {serviceSchema, imageSchema} = require('./joiSchemas');
const service = require('./models/service');
const ExpressError = require('./utils/ExpressError');

module.exports.validateService = (req, res, next) => {
    const { error } = serviceSchema.validate(req.body);

    if (error) {
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        console.log('msg', msg)
        res.send({message: msg})
        throw new ExpressError(400, msg);
    } else {
        next();
    };
};

module.exports.validateImage = (req, res, next) => {
    console.log(typeof(req.body.service))
    const { error } = imageSchema.validate({image: req.file, service: req.body.service});

    if (error) {
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        res.send({message: msg});
        throw new ExpressError(400, msg);
    } else {
        next();
    };
};