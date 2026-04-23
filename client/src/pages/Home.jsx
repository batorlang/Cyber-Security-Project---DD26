import React from 'react'
import { Grid } from '@mui/material'
import Profiles from '../components/Profiles'
import Chat from '../components/Chat'
import '../styles/Home.css'


const Home = () => {


    return (
        <div className="page-wrapper">
            <nav>
                <div className="title">Chats</div>
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
