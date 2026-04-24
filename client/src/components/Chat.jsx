import { useMemo, useState } from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import { messageSchema } from '../utils/validation'
import '../styles/Chat.css'

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
	const [error, setError] = useState('')

	const canSend = useMemo(() => draft.trim().length > 0, [draft])

	const handleSend = () => {
		const trimmedMessage = draft.trim()

		if (!trimmedMessage) {
			setError('Message cannot be empty')
			return
		}

		// Validate message using Zod schema
		try {
			messageSchema.parse({ content: trimmedMessage })
			setError('')
		} catch (err) {
			if (err.errors && err.errors.length > 0) {
				setError(err.errors[0].message)
			}
			return
		}

		setMessages((currentMessages) => [
			{
				id: currentMessages.length + 1,
				text: trimmedMessage,
				sender: 'me',
				date: new Date(),
			},
			...currentMessages,
		])
		setDraft('')
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	const handleDraftChange = (e) => {
		setDraft(e.target.value)
		setError('') // Clear error when user starts typing
	}

	return (
		<Paper className="chat-window" elevation={0}>
			<Typography variant="h6" className="chat-title">
				Chat
			</Typography>

			<Box className="messages-container">
				{messages.map((message) => {
					const isMine = message.sender === 'me'

					return (
						<Box key={message.id} className={`message ${isMine ? 'mine' : 'other'}`}>
							<Typography variant="body2">{message.text}</Typography>
							<Typography variant="caption" className="message-time">
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
				{error && (
					<Typography variant="caption" className="error-text">
						{error}
					</Typography>
				)}
				<TextField
					className="chat-input"
					fullWidth
					multiline
					maxRows={4}
					placeholder="Type a message..."
					value={draft}
					onChange={handleDraftChange}
					onKeyDown={handleKeyDown}
				/>

			</Box>
		</Paper>
	)
}

export default Chat
