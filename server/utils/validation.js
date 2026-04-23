const { z } = require('zod');

// Password validation schema - strong password requirements
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&*)');

// Email validation schema
const emailSchema = z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters');

// Username validation schema
const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Login validation schema
const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Register validation schema
const registerSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

// Message validation schema
const messageSchema = z.object({
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(5000, 'Message must be less than 5000 characters')
        .trim(),
});

// Format validation errors for API response
const formatValidationError = (error) => {
    const errors = {};
    if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
            const field = err.path.join('.');
            errors[field] = err.message;
        });
    }
    return errors;
};

module.exports = {
    loginSchema,
    registerSchema,
    messageSchema,
    formatValidationError,
    passwordSchema,
    emailSchema,
    usernameSchema,
};
