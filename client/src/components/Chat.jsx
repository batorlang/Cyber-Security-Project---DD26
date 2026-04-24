import { useMemo, useState } from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'

const Chat = () => {
	const [messages, setMessages] = useState([
		{
			id: 1,
			text: 'Hello! Welcome to the chat.',
			sender: 'other',
			date: new Date(),
		},
	])
	const [draft, setDraft] = useState('')

	const canSend = useMemo(() => draft.trim().length > 0, [draft])

	const handleSend = () => {
		const trimmedMessage = draft.trim()

		if (!trimmedMessage) {
			return
		}

		setMessages((currentMessages) => [
			...currentMessages,
			{
				id: currentMessages.length + 1,
				text: trimmedMessage,
				sender: 'me',
				date: new Date(),
			},
		])
		setDraft('')
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	return (
		<Paper
			className="chat-window"
			elevation={0}
			sx={{
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
                backgroundColor: 'transparent',
			}}
		>
			<Typography variant="h6" sx={{ color: '#f4f7ff' }}>
				Chat
			</Typography>

			<Box
				className="messages-container"
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
					minHeight: 0,
					flexGrow: 1,
				}}
			>
				{messages.map((message) => {
					const isMine = message.sender === 'me'

					return (
						<Box
							key={message.id}
							sx={{
								alignSelf: isMine ? 'flex-end' : 'flex-start',
								maxWidth: '78%',
								px: 1.5,
								py: 1,
								borderRadius: 2,
								bgcolor: isMine ? '#646cff' : 'rgba(255, 255, 255, 0.07)',
								color: '#fff',
							}}
						>
							<Typography variant="body2">{message.text}</Typography>
							<Typography variant="caption" sx={{ opacity: 0.75 }}>
								{new Date(message.date).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</Typography>
						</Box>
					)
				})}
			</Box>

			<Box className="input-container">
				<TextField
					fullWidth
					multiline
					maxRows={4}
					placeholder="Type a message..."
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={handleKeyDown}
                    sx ={{
                        '& .MuiInputBase-root': {
                            color: '#f4f7ff',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                    }}
				/>
		
			</Box>
		</Paper>
	)
}

export default Chat
