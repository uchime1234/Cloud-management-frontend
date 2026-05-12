"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { useAuthStore } from "../../store/authStore"

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { setToken, setUser, setMfaVerified } = useAuthStore()
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "",
    mfa_code: "" 
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaUserId, setMfaUserId] = useState<string | null>(null)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login/`,
        {
          username: formData.username,
          password: formData.password,
          mfa_code: formData.mfa_code || undefined
        }, 
         {
    headers: {
      'Content-Type': 'application/json'  // Explicitly set JSON header
    }
  }
      )

      if (response.data.mfa_required) {
        // MFA is required but no code provided yet
        setMfaRequired(true)
        setMfaUserId(response.data.user_id)
        setError("")
        
        // Store user ID for MFA verification
        localStorage.setItem("mfa_user_id", response.data.user_id)
      } else if (response.data.token) {
        // Login successful (with MFA if required)
        const { token, user_id, username, email } = response.data
        
        // Store token and user info
        setToken(token)
        localStorage.setItem("auth_token", token)
        
        setUser({
          id: user_id.toString(),
          email: email || formData.username,
          username: username || formData.username.split('@')[0]
        })
        
        setMfaVerified(true)
        
        // Clear MFA data if any
        localStorage.removeItem("mfa_user_id")
        
        // Navigate to dashboard
        navigate("/dashboard")
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Invalid credentials or server error"
      setError(errorMessage)
      
      // Reset MFA state on error
      setMfaRequired(false)
      setMfaUserId(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectMFA = () => {
    // If MFA is required but user wants to go directly to MFA page
    if (mfaUserId) {
      localStorage.setItem("mfa_user_id", mfaUserId)
      navigate("/auth/mfa-verify", {
        state: { userId: mfaUserId }
      })
    }
  }

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password")
  }

  const handleSignUp = () => {
    navigate("/auth/register")
  }

  

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <Input
            type="text"
            label="Username or Email"
            placeholder="Enter your username or email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={loading}
            autoComplete="username"
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          {mfaRequired && (
            <div className="space-y-2">
              <Input
                type="text"
                label="MFA Code (6-digit)"
                placeholder="Enter MFA code from authenticator app"
                value={formData.mfa_code}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  mfa_code: e.target.value.replace(/\D/g, '').slice(0, 6) 
                })}
                maxLength={6}
                required={mfaRequired}
                disabled={loading}
                className="text-center text-2xl tracking-widest"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded" 
              disabled={loading}
            />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-primary hover:underline disabled:opacity-50"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <div className="space-y-3">
          <Button 
            type="submit" 
            className="w-full" 
            loading={loading}
            disabled={!formData.username || !formData.password || (mfaRequired && !formData.mfa_code)}
          >
            {mfaRequired ? "Verify & Sign In" : "Sign In"}
          </Button>

          {mfaRequired && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleDirectMFA}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                disabled={loading}
              >
                Go to MFA verification page →
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button 
              type="button" 
              onClick={handleSignUp}
              className="text-primary hover:underline"
              disabled={loading}
            >
              Sign up
            </button>
          </div>
        </div>
      </form>

      {/* Demo credentials note */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-medium text-sm mb-2">Demo Credentials (if applicable)</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li><strong>Username:</strong> demo_user</li>
          <li><strong>Password:</strong> demo_password</li>
          <li>• If MFA is enabled, check your authenticator app</li>
          <li>• Use backup codes if you've lost access</li>
        </ul>
      </div>
    </AuthLayout>
  )
}