import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
})

// Add JWT token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Handle 401 responses (token expired/invalid)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if this is an auth endpoint (login/register) or a token expiry
            const requestUrl = error.config.url
            const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
            
            // Only redirect if it's NOT an auth endpoint (token expired on protected route)
            if (!isAuthEndpoint) {
                localStorage.removeItem('jwtToken')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
