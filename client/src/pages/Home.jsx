import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Grid } from '@mui/material'
import Profiles from '../components/Profiles'
import Chat from '../components/Chat'
import '../styles/Home.css'


const Home = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        // Implement logout logic here
        console.log('User logged out')
        navigate('/login')
    }
    

    return (
        <div className="page-wrapper">
            <nav>
                <div className="title">Chats</div>
                <Button variant="contained" className="logoutbtn" onClick={handleLogout}>
                    Log out
                </Button>

            </nav>
            <Grid container className="main-content">
                <Grid item xs={4} className="main-column">
                    <Profiles />
                </Grid>
                <Grid item xs={8} className="main-column">
                    <Chat />
                </Grid>
            </Grid>
        </div>
    )
}

export default Home
