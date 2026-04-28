import { useState, useEffect, useContext } from 'react'
import { Avatar, Box, Button, Collapse, List, ListItem, ListItemAvatar, ListItemText, Paper, TextField, Typography } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'
import axiosInstance from '../services/axiosConfig'
import { AuthContext } from '../context/AuthContext'
import keys from '../crypto/keys'
import cryption from '../crypto/cryption'
import '../styles/Profiles.css'

const Profiles = ({ onSelectConversation }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [profiles, setProfiles] = useState([])
    const { token, user, masterKey } = useContext(AuthContext)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/users')
                setProfiles(response.data)
            } catch (err) {
                console.error('Failed to fetch users', err)
            }
        }
        if (token) fetchUsers()
    }, [token])

    const handleMessage = async (targetUser) => {
        try {
            // Deterministically generate a 32-byte shared conversation key using the two user IDs
            const sharedConvKey = keys.deriveSharedConversationKey(user.id, targetUser._id)
            
            // Encrypt this key with our own masterKey just for secure database storage
            const myEncryptedKey = cryption.encryptBuffer(sharedConvKey, masterKey)
            
            // Create or fetch the conversation
            const response = await axiosInstance.post('/conversations', {
                targetUserId: targetUser._id,
                myEncryptedKey
            })
            
            // Pass the selected conversation to Home component with the key dynamically mounted
            onSelectConversation({
                ...response.data.conversation,
                targetUser,
                sharedKey: sharedConvKey
            })

        } catch (err) {
            console.error('Failed to start conversation', err)
        }
    }

    const filteredProfiles = profiles.filter((profile) =>
        profile.username !== user.username &&
        profile.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Box className="profiles-shell">
            <Paper elevation={0} className="profiles-panel">
                <Typography variant="h5" className="profiles-title">Profiles</Typography>
                <TextField fullWidth variant="filled" label="Search users" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="profiles-search" />
                {filteredProfiles.length === 0 ? (
                    <Typography variant="body2" className="profiles-empty-state">No profiles match your search.</Typography>
                ) : (
                    <List className="profiles-list">
                        <TransitionGroup>
                            {filteredProfiles.map((profile) => (
                                <Collapse key={profile._id}>
                                    <ListItem 
                                        className="profiles-list-item" 
                                        divider
                                        secondaryAction={
                                            <Button variant="outlined" size="small" className="profiles-message-button" onClick={() => handleMessage(profile)}>
                                                Message
                                            </Button>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar className="profiles-avatar" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random&color=fff`} />
                                        </ListItemAvatar>
                                        <ListItemText primary={profile.username} primaryTypographyProps={{ className: 'profiles-name' }} />
                                    </ListItem>
                                </Collapse>
                            ))}
                        </TransitionGroup>
                    </List>
                )}
            </Paper>
        </Box>
    )
}

export default Profiles
