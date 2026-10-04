const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required(),

  password: Joi.string()
    .min(8)
    .max(72)
    .required(),

  role: Joi.string()
    .valid("CUSTOMER", "SERVICE_PROVIDER")
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required(),

  password: Joi.string()
    .required(),
});

const googleSchema = Joi.object({
  idToken: Joi.string()
    .min(20)
    .required(),

  role: Joi.string()
    .valid("CUSTOMER", "SERVICE_PROVIDER")
    .optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleSchema,
};