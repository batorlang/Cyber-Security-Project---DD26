import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TextField from '@mui/material/TextField';
import '../styles/Register.css'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({ username, email, password });
        navigate('/login')
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
              <TextField className='textField' id="filled-basic" label="Username" variant="filled" value={username} onChange={(e) => setUsername(e.target.value)} required />

              <TextField className='textField' id="filled-basic" label="Email" variant="filled" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <TextField className='textField' id="filled-basic" label="Password" variant="filled" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              
              <button type="submit">Register</button>
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