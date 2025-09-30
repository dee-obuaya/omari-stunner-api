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
            'string.hyphenLettersOnly': '`service` must contain only letters (A–Z / a–z) or hyphens',
            'string.hyphenPosition': '`service` may not start or end with a hyphen',
            'string.hyphenConsecutive': '`service` cannot contain consecutive hyphens (--)',
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
