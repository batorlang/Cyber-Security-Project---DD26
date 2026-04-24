import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const UnprotectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext)

    if (loading) {
        return <div>Loading...</div>
    }

    if (isAuthenticated) {
        return <Navigate to="/home" replace />
    }

    return children
}

export default UnprotectedRoute
