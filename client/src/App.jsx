import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import UnprotectedRoute from './components/UnprotectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route
              path="/login"
              element={
                <UnprotectedRoute>
                  <Login />
                </UnprotectedRoute>} />
            <Route
              path="/register"
              element={
                <UnprotectedRoute>
                  <Register />
                </UnprotectedRoute>} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>} />
            <Route
              path='*'
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
