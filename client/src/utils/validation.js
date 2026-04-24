import { z } from 'zod'

// Password validation schema - strong password requirements
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&*)')
    .regex(/^(?!.*(.)\1\1)/, 'Cannot have the same character 3 times in a row')

// Email validation schema
const emailSchema = z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters')

// Username validation schema
const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

// Login validation schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
})

// Register validation schema
export const registerSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

// Message validation schema
export const messageSchema = z.object({
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(5000, 'Message must be less than 5000 characters')
        .trim(),
})

// Validation error formatter
export const formatValidationError = (error) => {
    if (error.errors && error.errors.length > 0) {
        return error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }))
    }
    return []
}

// Get specific field error
export const getFieldError = (errors, fieldName) => {
    const error = errors.find(err => err.field === fieldName)
    return error?.message || null
}
