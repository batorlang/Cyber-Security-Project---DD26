import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import '../styles/Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({ email, password });
        navigate('/home')
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
          <TextField className='textField' id="filled-basic" label="Email" variant="filled" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField className='textField' id="filled-basic" label="Password" variant="filled" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">
            Login
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