import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import { AuthContext } from '../context/AuthContext'
import PinInput from '../components/PinInput'
import axiosInstance from '../services/axiosConfig'
import { loginSchema } from '../utils/validation'
import keys from '../crypto/keys'
import '../styles/Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

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

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
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

        if (pin.length !== 6) {
            setFieldErrors(prev => ({ ...prev, pin: 'PIN must be exactly 6 digits' }))
            return
        }
        setLoading(true)

        try {
            const validatedData = loginSchema.parse({ email, password })
            const response = await axiosInstance.post('/auth/login', validatedData)
            const { token, user } = response.data

            let masterKey;
            try {
                masterKey = keys.recoverMasterKeyFromUser(pin, user.pinSalt, user.encryptedMasterKey);
            } catch {
                setError('Incorrect PIN or corrupted decryption key.')
                setLoading(false)
                return
            }

            sessionStorage.setItem('encryptionPin', pin)
            login(token, user, masterKey)
            navigate('/home')
        } catch (err) {
            if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors))) {
                const errors = {}
                const errorMessages = []
                const validationErrors = err.errors || err.issues || []
                if (validationErrors.length === 0 && typeof err.message === 'string' && err.message.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(err.message)
                        parsed.forEach(error => {
                            const fieldName = error.path ? error.path[0] : 'general'
                            if (!errors[fieldName]) { errors[fieldName] = error.message; errorMessages.push(error.message) }
                        })
                    } catch { errorMessages.push(err.message) }
                } else {
                    validationErrors.forEach(error => {
                        const fieldName = error.path ? error.path[0] : 'general'
                        if (!errors[fieldName]) { errors[fieldName] = error.message; errorMessages.push(error.message) }
                    })
                }
                setFieldErrors(errors)
                setError(errorMessages.length > 0 ? errorMessages.join(' • ') : 'Please fix the errors below')
            } else if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors)
                setError(err.response.data.message || 'Login failed')
            } else if (err.response?.status === 401) {
                setError('Invalid email or password. Please try again.')
            } else {
                setError('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    };

    return (
    <div className="login-page-wrapper">
       <nav><div className="title">Chats</div></nav>
      <div className="login-container">
        <h2>Login</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <TextField className='textField' id="email" label="Email" variant="filled" value={email} onChange={handleEmailChange} error={!!fieldErrors.email} required disabled={loading} fullWidth />
          <TextField className='textField' id="password" label="Password" variant="filled" type="password" value={password} onChange={handlePasswordChange} error={!!fieldErrors.password} helperText={fieldErrors.password} required disabled={loading} fullWidth />
          <PinInput pin={pin} setPin={setPin} error={fieldErrors.pin} disabled={loading} />
          <button type="submit" disabled={loading || Object.values(fieldErrors).some(err => err)}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="login-footer">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
      <footer><p>Created by DD26</p></footer>
    </div>
  )
}

export default Login
