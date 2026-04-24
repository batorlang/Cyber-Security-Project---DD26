import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../services/axiosConfig'
import { loginSchema, getFieldError } from '../utils/validation'
import '../styles/Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    // Real-time validation for email
    const handleEmailChange = (e) => {
        const value = e.target.value
        setEmail(value)
        
        try {
            loginSchema.pick({ email: true }).parse({ email: value })
            setFieldErrors(prev => ({ ...prev, email: null }))
        } catch (err) {
            if (err.errors && err.errors.length > 0) {
                setFieldErrors(prev => ({ ...prev, email: err.errors[0].message }))
            }
        }
    }

    // Real-time validation for password
    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        
        // Password is optional during typing, only required on submit
        if (value && value.length > 0) {
            try {
                loginSchema.pick({ password: true }).parse({ password: value })
                setFieldErrors(prev => ({ ...prev, password: null }))
            } catch (err) {
                if (err.errors && err.errors.length > 0) {
                    setFieldErrors(prev => ({ ...prev, password: err.errors[0].message }))
                }
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})
        setLoading(true)

        try {
            // Validate form data
            const validatedData = loginSchema.parse({ email, password })

            const response = await axiosInstance.post('/auth/login', validatedData)
            const { token, user } = response.data

            // Store token and user in auth context and localStorage
            login(token, user)

            // Navigate to home
            navigate('/home')
        } catch (err) {
            
            // Handle Zod validation errors
            if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors))) {
                const errors = {}
                const errorMessages = []
                
                // Extract errors
                const validationErrors = err.errors || err.issues || []
                
                // Sometimes Zod errors stringify into err.message
                if (validationErrors.length === 0 && typeof err.message === 'string' && err.message.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(err.message)
                        parsed.forEach(error => {
                            const fieldName = error.path ? error.path[0] : 'general'
                            if (!errors[fieldName]) {
                                errors[fieldName] = error.message
                                errorMessages.push(error.message)
                            }
                        })
                    } catch (e) {
                         errorMessages.push(err.message)
                    }
                } else {
                    validationErrors.forEach(error => {
                        const fieldName = error.path ? error.path[0] : 'general'
                        if (!errors[fieldName]) {
                            errors[fieldName] = error.message
                            errorMessages.push(error.message)
                        }
                    })
                }
                
                setFieldErrors(errors)
                setError(errorMessages.length > 0 ? errorMessages.join(' • ') : 'Please fix the errors below')
            } else if (err.response?.data?.errors) {
                // Handle backend validation/auth errors
                setFieldErrors(err.response.data.errors)
                setError(err.response.data.message || 'Login failed')
            } else if (err.response?.status === 401) {
                // Invalid credentials
                setError('Invalid email or password. Please try again.')
            } else if (err.response?.status === 400) {
                setError(err.response.data?.message || 'Invalid input. Please check your details.')
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.')
            }
            console.error('Login error:', err)
        } finally {
            setLoading(false)
        }
    };

    return (
    <div className="login-page-wrapper">
       <nav>
          <div className="title">Chats</div>
        </nav>
      <div className="login-container">
        <h2>Login</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <TextField 
            className='textField' 
            id="email" 
            label="Email" 
            variant="filled" 
            value={email} 
            onChange={handleEmailChange}
            error={!!fieldErrors.email}
            required 
            disabled={loading}
            fullWidth
          />
          <TextField 
            className='textField' 
            id="password" 
            label="Password" 
            variant="filled" 
            type="password" 
            value={password} 
            onChange={handlePasswordChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            required 
            disabled={loading}
            fullWidth
          />
          <button type="submit" disabled={loading || Object.values(fieldErrors).some(err => err)}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
      <footer>
        <p>Created by DD26</p>
      </footer>
    </div>
  )
}

export default Login