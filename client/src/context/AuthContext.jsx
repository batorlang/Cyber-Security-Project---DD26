import React, { createContext, useState, useEffect } from 'react'
import { Buffer } from 'buffer'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [masterKey, setMasterKey] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken')
        if (storedToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToken(storedToken)
            setIsAuthenticated(true)
            try {
                const userData = JSON.parse(localStorage.getItem('user'))
                setUser(userData)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
            try {
                const mkStr = sessionStorage.getItem('masterKey');
                if (mkStr) setMasterKey(Buffer.from(mkStr, 'base64'));
            } catch (err) {
                console.error("Failed to load master key from session", err)
            }
        }
        setLoading(false)
    }, [])

    const login = (token, userData, mKeyBuf) => {
        setToken(token)
        setUser(userData)
        setIsAuthenticated(true)
        if (mKeyBuf) {
             setMasterKey(mKeyBuf)
             sessionStorage.setItem('masterKey', mKeyBuf.toString('base64'))
        }
        localStorage.setItem('jwtToken', token)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        setMasterKey(null)
        setIsAuthenticated(false)
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('user')
        sessionStorage.removeItem('encryptionPin')
        sessionStorage.removeItem('masterKey')
    }

    const value = {
        token,
        user,
        masterKey,
        isAuthenticated,
        loading,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
