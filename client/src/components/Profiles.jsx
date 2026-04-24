import { useState } from 'react'
import { Avatar, Box, Button, Collapse, List, ListItem, ListItemAvatar, ListItemText, Paper, TextField, Typography } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'
import '../styles/Profiles.css'

const profiles = [
	{ _id: '1', username: 'Huba' },
	{ _id: '2', username: 'Bator' },
	{ _id: '3', username: 'Cristi' },
	{ _id: '4', username: 'Marton ' },
	{ _id: '5', username: 'Randalekobold' },
]

const Profiles = () => {
	const [searchTerm, setSearchTerm] = useState('')

	const filteredProfiles = profiles.filter((profile) =>
		profile.username.toLowerCase().includes(searchTerm.toLowerCase())
	)

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
					onChange={(event) => setSearchTerm(event.target.value)}
					className="profiles-search"
				/>

				{filteredProfiles.length === 0 ? (
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
												disabled
												className="profiles-message-button"
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