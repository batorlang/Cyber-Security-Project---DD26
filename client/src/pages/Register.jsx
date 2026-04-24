import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../services/axiosConfig'
import { registerSchema } from '../utils/validation'
import '../styles/Register.css'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    // Real-time validation for username
    const handleUsernameChange = (e) => {
        const value = e.target.value
        setUsername(value)
        
        try {
            registerSchema.pick({ username: true }).parse({ username: value })
            setFieldErrors(prev => ({ ...prev, username: null }))
        } catch (err) {
            if (err.errors && err.errors.length > 0) {
                const allErrors = err.errors.map(e => e.message).join('\n')
                setFieldErrors(prev => ({ ...prev, username: allErrors }))
            }
        }
    }

    // Real-time validation for email
    const handleEmailChange = (e) => {
        const value = e.target.value
        setEmail(value)
        
        try {
            registerSchema.pick({ email: true }).parse({ email: value })
            setFieldErrors(prev => ({ ...prev, email: null }))
        } catch (err) {
            if (err.errors && err.errors.length > 0) {
                const allErrors = err.errors.map(e => e.message).join('\n')
                setFieldErrors(prev => ({ ...prev, email: allErrors }))
            }
        }
    }

    // Real-time validation for password
    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        
        // Validate password
        if (value.length > 0) {
            try {
                registerSchema.pick({ password: true }).parse({ password: value })
                setFieldErrors(prev => ({ ...prev, password: null }))
            } catch (err) {
                if (err.errors && err.errors.length > 0) {
                    const allErrors = err.errors.map(e => e.message).join('\n')
                    setFieldErrors(prev => ({ ...prev, password: allErrors }))
                }
            }
        }
        
        // Check if passwords match
        if (confirmPassword && value !== confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
        } else if (confirmPassword === value) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: null }))
        }
    }

    // Real-time validation for confirm password
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value
        setConfirmPassword(value)
        
        if (value && value !== password) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
        } else {
            setFieldErrors(prev => ({ ...prev, confirmPassword: null }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})
        setLoading(true)

        try {
            // Validate form data
            const validatedData = registerSchema.parse({
                username,
                email,
                password,
                confirmPassword,
            })

            // Send only the required fields to backend
            const response = await axiosInstance.post('/auth/register', {
                username: validatedData.username,
                email: validatedData.email,
                password: validatedData.password,
            })
            const { token, user } = response.data

            // Store token and user in auth context and localStorage
            login(token, user)

            // Navigate to home
            navigate('/home')
        } catch (err) {
            // Handle Zod validation errors
            if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors))) {
                const errors = {}
                
                // Extract errors
                const validationErrors = err.errors || err.issues || []
                
                // Sometimes Zod errors stringify into err.message
                if (validationErrors.length === 0 && typeof err.message === 'string' && err.message.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(err.message)
                        parsed.forEach(error => {
                            const fieldName = error.path ? error.path[0] : 'general'
                            errors[fieldName] = errors[fieldName] ? errors[fieldName] + '\n' + error.message : error.message
                        })
                    } catch (e) {
                         // Fallback
                    }
                } else {
                    validationErrors.forEach(error => {
                        const fieldName = error.path ? error.path[0] : 'general'
                        errors[fieldName] = errors[fieldName] ? errors[fieldName] + '\n' + error.message : error.message
                    })
                }
                
                setFieldErrors(errors)
                setError('Please fix the errors below')
            } else if (err.response?.data?.errors) {
                // Handle backend validation/registration errors
                setFieldErrors(err.response.data.errors)
                setError(err.response.data.message || 'Registration failed')
            } else if (err.response?.status === 400) {
                setError(err.response.data?.message || 'Invalid input. Please check your details.')
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="register-page-wrapper">
           <nav>
              <div className="title">Chats</div>
            </nav>
          <div className="register-container">
            <h2>Register</h2>
            {error && <p className="register-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <TextField 
                className='textField' 
                id="username" 
                label="Username" 
                variant="filled" 
                value={username} 
                onChange={handleUsernameChange}
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
                FormHelperTextProps={{ style: { whiteSpace: 'pre-line' } }}
                required 
                disabled={loading}
                fullWidth
              />

              <TextField 
                className='textField' 
                id="email" 
                label="Email" 
                variant="filled" 
                value={email} 
                onChange={handleEmailChange}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                FormHelperTextProps={{ style: { whiteSpace: 'pre-line' } }}
                required 
                disabled={loading}
                fullWidth
              />

              <TextField 
                className='textField' 
                id="password" 
                label="Password" 
                variant="filled" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={handlePasswordChange}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                FormHelperTextProps={{ style: { whiteSpace: 'pre-line' } }}
                required 
                disabled={loading}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <button
                        type="button"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#666'
                        }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField 
                className='textField' 
                id="confirmPassword" 
                label="Confirm Password" 
                variant="filled" 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={handleConfirmPasswordChange}
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
                FormHelperTextProps={{ style: { whiteSpace: 'pre-line' } }}
                required 
                disabled={loading}
                fullWidth
              />
              
              <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            </form>
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
          <footer>
                <p>Created by DD26</p>
            </footer>
        </div>
    )
}

export default Register