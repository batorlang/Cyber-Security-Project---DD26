import { useMemo, useState, useEffect } from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import { messageSchema } from '../utils/validation'
import axiosInstance from '../services/axiosConfig'
import '../styles/Chat.css'

const Chat = ({ selectedProfile }) => {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Open or create a direct conversation and load the first page of messages.
    const initializeConversation = async () => {
      if (!selectedProfile?._id) {
        setConversationId(null)
        setMessages([])
        return
      }

      try {
        setLoading(true)
        setError('')

        const conversationRes = await axiosInstance.post('/chats/conversations/direct', {
          receiverId: selectedProfile._id,
        })

        const nextConversationId = conversationRes.data?.conversationId
        setConversationId(nextConversationId)

        const messagesRes = await axiosInstance.get(
          `/chats/conversations/${nextConversationId}/messages?limit=50`
        )

        const normalized = (messagesRes.data || []).map((message) => {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}')
          const isMine = String(message.senderId) === String(localUser.id)

          return {
            id: message._id,
            text: message.ciphertext,
            sender: isMine ? 'me' : 'other',
            date: message.createdAt,
          }
        })

        setMessages(normalized)
        setDraft('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to open chat')
      } finally {
        setLoading(false)
      }
    }

    initializeConversation()
  }, [selectedProfile?._id])

  useEffect(() => {
    if (!conversationId) return undefined

    // Poll messages every 3 seconds to keep the conversation live.
    const pollMessages = async () => {
      try {
        const messagesRes = await axiosInstance.get(
          `/chats/conversations/${conversationId}/messages?limit=50`
        )

        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        const normalized = (messagesRes.data || []).map((message) => ({
          id: message._id,
          text: message.ciphertext,
          sender: String(message.senderId) === String(localUser.id) ? 'me' : 'other',
          date: message.createdAt,
        }))

        setMessages(normalized)
      } catch (err) {
        console.error('Failed to poll messages:', err)
      }
    }

    const intervalId = setInterval(pollMessages, 3000)
    return () => clearInterval(intervalId)
  }, [conversationId])

  // Allow sending only when the input has content and a conversation is active.
  const canSend = useMemo(
    () => draft.trim().length > 0 && Boolean(conversationId) && !loading,
    [draft, conversationId, loading]
  )

  // Validate input, send message to API, then append the returned message locally.
  const handleSend = async () => {
    const trimmedMessage = draft.trim()

    if (!trimmedMessage) {
      setError('Message cannot be empty')
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

    if (!conversationId) {
      setError('No active conversation')
      return
    }

    try {
      const response = await axiosInstance.post(
        `/chats/conversations/${conversationId}/messages`,
        {
          content: trimmedMessage,
          ciphertext: trimmedMessage,
          nonce: btoa(String(Date.now())),
          algorithm: 'plaintext-v1',
          messageType: 'text',
        }
      )

      const savedMessage = response.data
      setMessages((currentMessages) => [
        {
          id: savedMessage._id,
          text: savedMessage.ciphertext,
          sender: 'me',
          date: savedMessage.createdAt,
        },
        ...currentMessages,
      ])
      setDraft('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message')
    }
  }

  const handleKeyDown = (event) => {
    // Enter sends; Shift+Enter inserts a newline.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleDraftChange = (e) => {
    // Reset any visible validation/API error while user edits.
    setDraft(e.target.value)
    setError('')
  }

  if (!selectedProfile) {
    return (
      <Paper className="chat-window" elevation={0}>
        <Typography variant="h6" className="chat-title">
          Chat
        </Typography>
        <Box className="messages-container">
          <Typography variant="body2" sx={{ color: '#646cff' }}>
            Select a user from Profiles and click Message to open chat.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper className="chat-window" elevation={0}>
      <Typography variant="h6" className="chat-title">
        Chat with {selectedProfile.username}
      </Typography>

      <Box className="messages-container">
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading chat...
          </Typography>
        )}
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

        <Button
          variant="contained"
          disabled={!canSend}
          onClick={handleSend}
          sx={{ mt: 1 }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  )
}

export default Chat