"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { useAuthStore } from "../../store/authStore"
import { Alert, AlertDescription } from "../../components/ui/Alert"

export const MfaVerify: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setMfaVerified = useAuthStore((state) => state.setMfaVerified)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // Extract user_id from location state or localStorage
  useEffect(() => {
    // Try to get user_id from location state (when redirected from login)
    const stateUserId = location.state?.userId
    
    // Try to get user_id from localStorage (fallback)
    const storedUserId = localStorage.getItem("mfa_user_id")
    
    if (stateUserId) {
      setUserId(stateUserId)
      localStorage.setItem("mfa_user_id", stateUserId)
    } else if (storedUserId) {
      setUserId(storedUserId)
    } else {
      // If no user_id is found, show error
      setMessage({
        type: "error",
        text: "No user ID found. Please login again."
      })
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      setMessage({
        type: "error",
        text: "User ID not found. Please login again."
      })
      return
    }

    if (!code || (useBackupCode ? code.length < 8 : code.length !== 6)) {
      setMessage({
        type: "error",
        text: useBackupCode 
          ? "Backup code must be at least 8 characters" 
          : "Please enter a valid 6-digit verification code"
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/mfa/verify/`,
        {
          user_id: userId,
          code: code
        }
      )

      if (response.data.verified) {
        setMessage({
          type: "success",
          text: response.data.message || "Verification successful!"
        })

        // Get token from localStorage or from successful MFA verification
        const token = localStorage.getItem("auth_token") || response.data.token
        
        if (token) {
          // Store token in auth store and localStorage
          useAuthStore.getState().setToken(token)
          localStorage.setItem("auth_token", token)
        }

        setMfaVerified(true)
        
        // Clear MFA-related storage
        localStorage.removeItem("mfa_user_id")
        
        // Navigate to dashboard after successful verification
        setTimeout(() => {
          navigate("/dashboard")
        }, 1500)
      } else {
        setMessage({
          type: "error",
          text: response.data.error || "Verification failed"
        })
      }
    } catch (error: any) {
      const errorData = error.response?.data
      setMessage({
        type: "error",
        text: errorData?.error || "Failed to verify code. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUseBackupCode = () => {
    setUseBackupCode(!useBackupCode)
    setCode("")
    setMessage(null)
  }

  const handleResendCode = async () => {
    // This function would trigger sending a new code (e.g., via SMS or email)
    // For now, just show a message
    setMessage({
      type: "info",
      text: "A new verification code has been sent to your authenticator app."
    })
  }

  const handleGoBack = () => {
    localStorage.removeItem("mfa_user_id")
    navigate("/auth/login")
  }

  return (
    <AuthLayout 
      title="Two-Factor Authentication" 
      subtitle={useBackupCode ? "Enter your backup code" : "Enter verification code from your authenticator app"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div>
          <Input
            type="text"
            label={useBackupCode ? "Backup Code" : "Verification Code"}
            placeholder={useBackupCode ? "Enter backup code" : "000000"}
            value={code}
            onChange={(e) => {
              const value = e.target.value
              // Only allow digits for TOTP, alphanumeric for backup codes
              if (useBackupCode) {
                // Allow alphanumeric for backup codes
                setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              } else {
                // Only digits for TOTP codes
                setCode(value.replace(/\D/g, '').slice(0, 6))
              }
            }}
            maxLength={useBackupCode ? 20 : 6}
            className="text-center text-2xl tracking-widest"
            autoFocus
          />
          
          {!useBackupCode && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Enter the 6-digit code from your authenticator app
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          loading={loading}
          disabled={!code || (useBackupCode ? code.length < 8 : code.length !== 6)}
        >
          {useBackupCode ? "Verify Backup Code" : "Verify Code"}
        </Button>

        <div className="space-y-2">
          <button 
            type="button" 
            onClick={handleUseBackupCode}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {useBackupCode ? "Use authenticator app instead" : "Use backup code instead"}
          </button>
          
          {!useBackupCode && (
            <button 
              type="button" 
              onClick={handleResendCode}
              className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors text-center"
            >
              Resend code
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <button 
            type="button" 
            onClick={handleGoBack}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            ← Back to login
          </button>
        </div>
      </form>

      {/* Information about backup codes */}
      {useBackupCode && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Backup codes are one-time use. Each code can only be used once.
          </p>
        </div>
      )}
    </AuthLayout>
  )
}