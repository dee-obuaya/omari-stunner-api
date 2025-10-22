const Joi = require('joi');

module.exports.serviceSchema = Joi.object({
    service: Joi.string()
        .required()
        .custom((val, helpers) => {
            // validate allowed characters
            if (!/^[A-Za-z\s-]+$/.test(val)) {
                return helpers.error('string.hyphenLettersOnly', { value: val });
            }
            // optionally, prevent leading/trailing hyphens
            if (/^-|-$/.test(val)) {
                return helpers.error('string.hyphenPosition', { value: val });
            }
            // optionally, prevent consecutive hyphens
            if (/--/.test(val)) {
                return helpers.error('string.hyphenConsecutive', { value: val });
            }
            return val;
        })
        .messages({
            'string.hyphenLettersOnly': '`Service` must contain only letters (A–Z / a–z) or hyphens',
            'string.hyphenPosition': '`Service` may not start or end with a hyphen',
            'string.hyphenConsecutive': '`Service` cannot contain consecutive hyphens (--)',
        }),
    tag: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            'string.pattern.base': '`tag` must contain only letters',
            'string.empty': '`tag` cannot be empty',
            'any.required': '`tag` is required'
        }),
    price: Joi.number().min(0)
}).required().messages({'any.required': 'Fields cannot be empty'});

module.exports.imageSchema = Joi.object({
    image: Joi.any()
    .required()
    .custom((value, helpers) => {
      // Check if a file is actually provided
      if (!value) {
        return helpers.error('any.required');
      }

      // Validate mimetype (e.g., allow only image types)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
      if (!allowedMimeTypes.includes(value.mimetype)) {
        return helpers.error('file.invalidMimeType', { allowedMimeTypes });
      }

      // Validate file size (e.g., max 5MB)
    //   const maxSize = 5 * 1024 * 1024; // 5 MB
    //   if (value.size > maxSize) {
    //     return helpers.error('file.tooLarge', { maxSize });
    //   }

      return value; // If all checks pass, return the value
    }, 'Image File Validation')
    .messages({
      'file.invalidMimeType': 'Only {{#allowedMimeTypes}} are allowed.',
    //   'file.tooLarge': 'File size must not exceed {{#maxSize}} bytes.',
    }),
    service: Joi.string()
        .required()
        .custom((val, helpers) => {
            // validate allowed characters
            if (!/^[A-Za-z\s-]+$/.test(val)) {
                return helpers.error('string.hyphenLettersOnly', { value: val });
            }
            // optionally, prevent leading/trailing hyphens
            if (/^-|-$/.test(val)) {
                return helpers.error('string.hyphenPosition', { value: val });
            }
            // optionally, prevent consecutive hyphens
            if (/--/.test(val)) {
                return helpers.error('string.hyphenConsecutive', { value: val });
            }
            return val;
        })
        .messages({
            'string.hyphenLettersOnly': '`service` must contain only letters (A–Z / a–z) or hyphens',
            'string.hyphenPosition': '`service` may not start or end with a hyphen',
            'string.hyphenConsecutive': '`service` cannot contain consecutive hyphens (--)',
        }),
}).required().messages({'any.required': 'Fields cannot be empty'});

module.exports.tabSchema = Joi.object({
    name: Joi.string()
        .required()
        .custom((val, helpers) => {
            // validate allowed characters
            if (!/^[A-Za-z\s-]+$/.test(val)) {
                return helpers.error('string.hyphenLettersOnly', { value: val });
            }
            // optionally, prevent leading/trailing hyphens
            if (/^-|-$/.test(val)) {
                return helpers.error('string.hyphenPosition', { value: val });
            }
            // optionally, prevent consecutive hyphens
            if (/--/.test(val)) {
                return helpers.error('string.hyphenConsecutive', { value: val });
            }
            return val;
        })
        .messages({
            'string.hyphenLettersOnly': '`Tab name` must contain only letters (A–Z / a–z) or hyphens',
            'string.hyphenPosition': '`Tab name` may not start or end with a hyphen',
            'string.hyphenConsecutive': '`Tab name` cannot contain consecutive hyphens (--)',
        }),
    label: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            'string.pattern.base': '`Tab label` must contain only letters and spaces',
            'string.empty': '`Tab label` cannot be empty',
            'any.required': '`Tab label` is required'
        }),
    active: Joi.boolean().required().messages({'any.required': '`Active` status is required'}),
}).required().messages({'any.required': 'Fields cannot be empty'});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        clientName: Joi.string()
            .required().messages({'any.required': '`Client name` is required'}),
        clientEmail: Joi.string()
            .email()
            .required().messages({
                'string.email': '`Client email` must be a valid email',
                'any.required': '`Client email` is required'
            }),
        clientPhone: Joi.string()
            .pattern(/^[0-9]+$/)
            .required()
            .min(10)
            .max(10)
            .messages({
                'string.pattern.base': '`Phone number` must contain only numbers',
                'string.min': '`Phone number` must be at least 10 digits',
                'string.max': '`Phone number` must be at most 10 digits',
                'string.empty': '`Phone number` cannot be empty',
                'any.required': '`Phone number` is required'
            }),
        clientService: Joi.string()
            .required()
            .custom((val, helpers) => {
                // validate allowed characters
                if (!/^[A-Za-z\s-]+$/.test(val)) {
                    return helpers.error('string.hyphenLettersOnly', { value: val });
                }
                // optionally, prevent leading/trailing hyphens
                if (/^-|-$/.test(val)) {
                    return helpers.error('string.hyphenPosition', { value: val });
                }
                // optionally, prevent consecutive hyphens
                if (/--/.test(val)) {
                    return helpers.error('string.hyphenConsecutive', { value: val });
                }
                return val;
            })
            .messages({
                'string.hyphenLettersOnly': '`Service` must contain only letters (A–Z / a–z) or hyphens',
                'string.hyphenPosition': '`Service` may not start or end with a hyphen',
                'string.hyphenConsecutive': '`Service` cannot contain consecutive hyphens (--)',
            }),
        appointmentDate: Joi.date().required().messages({'any.required': '`Date` is required'}),
        appointmentTime: Joi.string().required().messages({'any.required': '`Time` is required'}),
        appointmentAddress: Joi.string().allow(''),
        totalPeople: Joi.number().min(1).required().messages({
            'number.base': '`Total number of people` must be a number',
            'number.min': '`Total number of people` must be at least 1',
            'any.required': '`Total number of people` is required'
        }),
        touchupRequired: Joi.string().required().valid('Yes', 'No').messages({'any.required': '`Touchup` status is required', 'any.only': '`Touchup` must be either Yes or No'}),
        downPayment: Joi.string().valid('Full', '50%').allow('').messages({
            'any.only': '`Down payment` must be one of the following values: Full, 50%'
        }),
        status: Joi.string().valid('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Moved').required().messages({
            'any.only': '`Status` must be one of the following values: Pending, Confirmed, Completed, Cancelled, Moved',
            'any.required': '`Status` is required'
        }),
        paymentStatus: Joi.string().valid('Pending Confirmation', 'Paid', 'Partial', 'Not Paid').required().messages({
            'any.only': '`Payment status` must be one of the following values: Pending Confirmation, Paid, Partial, Not Paid',
            'any.required': '`Payment status` is required'
        }),
    }).required().messages({'any.required': 'Booking data is required'}),
});
