import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    // Restore token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken')
        if (storedToken) {
            setToken(storedToken)
            setIsAuthenticated(true)
            // Optionally validate token with backend
            try {
                const userData = JSON.parse(localStorage.getItem('user'))
                setUser(userData)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
        setLoading(false)
    }, [])

    const login = (token, userData) => {
        setToken(token)
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('jwtToken', token)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('user')
    }

    const value = {
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
