/**
 * Request Validation Middleware
 * Validates incoming requests using Joi schemas
 */

const Joi = require('joi');

/**
 * Service validation schema
 */
const serviceSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Service name is required',
    'string.min': 'Service name must be at least 3 characters',
    'string.max': 'Service name must not exceed 255 characters',
  }),

  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .messages({
      'string.empty': 'Service URL is required',
      'string.uri': 'Service URL must be a valid HTTP/HTTPS URL',
    }),

  check_interval: Joi.number()
    .integer()
    .min(30)
    .max(86400)
    .default(300)
    .messages({
      'number.min': 'Check interval must be at least 30 seconds',
      'number.max': 'Check interval must not exceed 86400 seconds (24 hours)',
    }),

  expected_status: Joi.number()
    .integer()
    .min(100)
    .max(599)
    .default(200)
    .messages({
      'number.min': 'Expected status must be a valid HTTP status code',
      'number.max': 'Expected status must be a valid HTTP status code',
    }),

  timeout: Joi.number().integer().min(1000).max(30000).default(5000).messages({
    'number.min': 'Timeout must be at least 1000 milliseconds',
    'number.max': 'Timeout must not exceed 30000 milliseconds',
  }),
});

/**
 * Service update validation schema (all fields optional)
 */
const serviceUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  url: Joi.string().uri({ scheme: ['http', 'https'] }),
  check_interval: Joi.number().integer().min(30).max(86400),
  expected_status: Joi.number().integer().min(100).max(599),
  timeout: Joi.number().integer().min(1000).max(30000),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

/**
 * Validate service creation request
 */
const validateServiceCreation = (req, res, next) => {
  const { error, value } = serviceSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body = value;
  next();
};

/**
 * Validate service update request
 */
const validateServiceUpdate = (req, res, next) => {
  const { error, value } = serviceUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body = value;
  next();
};

/**
 * Validate service ID parameter
 */
const validateServiceId = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid service ID',
    });
  }

  req.params.id = id;
  next();
};

module.exports = {
  validateServiceCreation,
  validateServiceUpdate,
  validateServiceId,
};
