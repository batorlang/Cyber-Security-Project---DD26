import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Grid } from '@mui/material'
import { AuthContext } from '../context/AuthContext'
import Profiles from '../components/Profiles'
import Chat from '../components/Chat'
import { io } from 'socket.io-client'
import '../styles/Home.css'

const Home = () => {
    const navigate = useNavigate()
    const { logout, token, masterKey } = useContext(AuthContext)
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        if (!token) return;
        const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
            auth: { token }
        })
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket)
        return () => newSocket.close()
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!masterKey) {
        return (
            <div className="page-wrapper">
                <nav>
                    <div className="title">Chats</div>
                    <Button variant="contained" className="logoutbtn" onClick={handleLogout}>
                        Log out
                    </Button>
                </nav>
                <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                    <h2>Profile Locked</h2>
                    <p>Your session key was lost. Please log out and log back in to decrypt your messages.</p>
                </div>
            </div>
        )
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
                    <Profiles 
                        onSelectConversation={setSelectedConversation} 
                        selectedConversationId={selectedConversation?._id}
                    />
                </Grid>
                <Grid item xs={8} className="main-column">
                    {selectedConversation ? (
                        <Chat 
                            conversation={selectedConversation} 
                            socket={socket} 
                        />
                    ) : (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            Select a profile to start chatting.
                        </div>
                    )}
                </Grid>
            </Grid>
        </div>
    )
}

export default Home
