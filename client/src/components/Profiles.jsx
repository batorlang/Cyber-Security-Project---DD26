import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { TransitionGroup } from 'react-transition-group'
import axiosInstance from '../services/axiosConfig'
import '../styles/Profiles.css'

const Profiles = ({ onStartChat }) => {
  const [profiles, setProfiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await axiosInstance.get('/users/list')
        setProfiles(response.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredProfiles = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return profiles
    return profiles.filter((p) =>
      p.username?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    )
  }, [profiles, searchTerm])

  return (
    <Box className="profiles-shell">
      <Paper elevation={0} className="profiles-panel">
        <Typography variant="h5" className="profiles-title">
          Profiles
        </Typography>

        <TextField
          fullWidth
          variant="filled"
          label="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="profiles-search"
        />

        {loading && (
          <Typography variant="body2" className="profiles-empty-state">
            Loading users...
          </Typography>
        )}

        {!loading && error && (
          <Typography variant="body2" className="profiles-empty-state">
            {error}
          </Typography>
        )}

        {!loading && !error && filteredProfiles.length === 0 ? (
          <Typography variant="body2" className="profiles-empty-state">
            No profiles match your search.
          </Typography>
        ) : (
          <List className="profiles-list">
            <TransitionGroup>
              {filteredProfiles.map((profile) => (
                <Collapse key={profile._id}>
                  <ListItem
                    className="profiles-list-item"
                    divider
                    secondaryAction={
                      <Button
                        variant="outlined"
                        size="small"
                        className="profiles-message-button"
                        onClick={() => onStartChat?.(profile)}
                      >
                        Message
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        className="profiles-avatar"
                        alt={profile.username}
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random&color=fff`}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={profile.username}
                      primaryTypographyProps={{ className: 'profiles-name' }}
                    />
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