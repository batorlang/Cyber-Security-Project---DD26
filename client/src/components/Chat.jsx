import { useState, useEffect, useContext, useRef } from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import { messageSchema } from '../utils/validation'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../services/axiosConfig'
import keys from '../crypto/keys'
import '../styles/Chat.css'

// Note: messaged are displayed in a reverse order,
// so scrolling works similarly to other messaging apps, 
// all new messages must be pushed to start of the message list
const Chat = ({ conversation, socket }) => {
    const [messages, setMessages] = useState([])
    const [draft, setDraft] = useState('')
    const [error, setError] = useState('')
    const { user } = useContext(AuthContext)
    const messagesEndRef = useRef(null)

    // Load message history on conversation change
    useEffect(() => {
        if (!conversation?._id) return

        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.get(`/messages/${conversation._id}/messages`)
                const decMessages = response.data.map(msg => ({
                    id: msg._id,
                    text: keys.decryptMessageFromStorage(msg, conversation.sharedKey),
                    sender: msg.senderId === user.id ? 'me' : 'other',
                    date: msg.createdAt
                }))
                setMessages(decMessages.reverse())
            } catch (err) {
                console.error('Failed to load messages', err)
            }
        }
        
        fetchMessages()
        
        if (socket) {
            socket.emit('join_conversation', conversation._id)
        }
    }, [conversation?._id, socket, user.id, conversation?.sharedKey])

    // Socket message listener
    useEffect(() => {
        if (!socket || !conversation) return;
        
        const handleNewMessage = (encryptedData) => {
            if (encryptedData.conversationId !== conversation._id) return;
            if (encryptedData.senderId === user.id) return;

            try {
                const plainText = keys.decryptMessageFromStorage(encryptedData, conversation.sharedKey)
                setMessages(prev => [{
                    id: encryptedData._id || Date.now(),
                    text: plainText,
                    sender: 'other',
                    date: encryptedData.createdAt || new Date()
                }, ...prev])

            } catch (err) {
                console.error('Decryption error on socket stream', err)
            }
        }

        socket.on('receive_message', handleNewMessage)
        return () => {
            socket.off('receive_message', handleNewMessage)
        }
    }, [socket, conversation, user.id])

    // Scroll down automatically
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        const trimmedMessage = draft.trim()
        if (!trimmedMessage) {
            return
        }

        try {
            messageSchema.parse({ content: trimmedMessage })
            setError('')
        } catch (err) {
            if (err.errors && err.errors.length > 0) {
                setError(err.errors[0].message)
            }
            return
        }

        try {
            // Encrypt using the derived E2E shared key
            const encryptedPayload = keys.encryptMessageForStorage(trimmedMessage, conversation.sharedKey, conversation._id)

            const msgData = {
                conversationId: conversation._id,
                ciphertext: encryptedPayload.ciphertext,
                nonce: encryptedPayload.nonce,
                algorithm: encryptedPayload.algorithm,
                messageType: 'text'
            }

            const response = await axiosInstance.post(`/messages/${conversation._id}/messages`, msgData)
            const savedMsg = response.data

            if (socket) {
                socket.emit('send_message', { ...msgData, _id: savedMsg._id, senderId: user.id, createdAt: savedMsg.createdAt })
            }

            setMessages(currentMessages => [
                { id: savedMsg._id, text: trimmedMessage, sender: 'me', date: savedMsg.createdAt },
                ...currentMessages,
            ])
            setDraft('')
        } catch (err) {
            console.error('Failed to send message', err)
            setError('Failed to send encrypted message')
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSend()
        }
    }

    if (!conversation) return null;

    return (
        <Paper className="chat-window" elevation={0}>
            <Typography variant="h6" className="chat-title">
                Chat with {conversation.targetUser ? conversation.targetUser.username : '...'}
            </Typography>

            <Box className="messages-container">
                <div ref={messagesEndRef} />
                {messages.map((message) => {
                    const isMine = message.sender === 'me'
                    return (
                        <Box key={message.id} className={`message ${isMine ? 'mine' : 'other'}`}>
                            <Typography variant="body2">{message.text}</Typography>
                            <Typography variant="caption" className="message-time">
                                {new Date(message.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>

            <Box className="input-container">
                {error && <Typography variant="caption" className="error-text">{error}</Typography>}
                <TextField
                    className="chat-input" fullWidth multiline maxRows={4} placeholder="Type an encrypted message..."
                    value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown}
                    
                />
                {draft.trim() && (
                    <Button variant="contained" onClick={handleSend} className='sendBtn'>
                        Send
                    </Button> 
                )}          
            </Box>
        </Paper>
    )
}

export default Chat
