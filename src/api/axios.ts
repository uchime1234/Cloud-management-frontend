// src/api/axios.ts
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// ============================================================
// REQUEST INTERCEPTOR — Adds token to every request
// ============================================================
api.interceptors.request.use(
    (config) => {
        // Try multiple keys for safety
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("auth_token")

        if (token) {
            config.headers.Authorization = `Token ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ============================================================
// RESPONSE INTERCEPTOR — Handles 401s
// ============================================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⚠️ 401 Unauthorized — clearing token")

            // Clear saved tokens
            localStorage.removeItem("token")
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user")
            localStorage.removeItem("user_id")
            localStorage.removeItem("username")
            localStorage.removeItem("email")

            // Redirect to login (if not already there)
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login"
            }
        }
        return Promise.reject(error)
    }
)

export default api