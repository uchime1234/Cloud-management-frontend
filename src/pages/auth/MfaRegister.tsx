"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Shield, Copy, Check } from "lucide-react"
import { Card } from "../../components/ui/Card"

export const MfaRegister: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [code, setCode] = useState("")
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [secretKey, setSecretKey] = useState("")
  const [message, setMessage] = useState("")
  const [token, setToken] = useState("")

  // Get token from URL query parameters or localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlToken = params.get('token')
    
    if (urlToken) {
      setToken(urlToken)
      localStorage.setItem('mfa_setup_token', urlToken)
    } else {
      // Try to get token from localStorage (from registration response)
      const storedToken = localStorage.getItem('mfa_setup_token') || localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
      }
    }
  }, [location])

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch MFA setup data when token is available
  useEffect(() => {
    const initMFASetup = async () => {
      if (!token) {
        setMessage("No authentication token found. Please complete registration first.")
        return
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/mfa/setup-token/?token=${token}`
        )
        
        if (response.data.qr_code) {
          setQrCode(response.data.qr_code)
          setSecretKey(response.data.secret_key)
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || "Failed to initialize MFA"
        setMessage(errorMsg)
        
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          setTimeout(() => navigate("/auth/login"), 3000)
        }
      }
    }
    
    if (token) {
      initMFASetup()
    }
  }, [token, navigate])

  const handleCopy = (textToCopy: string, index?: number) => {
    navigator.clipboard.writeText(textToCopy)
    
    if (index !== undefined) {
      setCopiedCodeIndex(index)
      setTimeout(() => setCopiedCodeIndex(null), 2000)
    } else {
      setMessage("Copied to clipboard")
      setTimeout(() => {
        if (message.includes("Copied")) setMessage("")
      }, 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setMessage("Authentication token is missing. Please complete registration first.")
      return
    }
    
    if (!code || code.length !== 6) {
      setMessage("Please enter a valid 6-digit verification code")
      return
    }

    setLoading(true)
    setMessage("")
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mfa/enable-token/`,
        { 
          token: token,
          code: code 
        }
      )
      
      if (response.data.backup_codes) {
        setBackupCodes(response.data.backup_codes)
        setMessage("✅ MFA enabled successfully! Save your backup codes in a secure place.")
        
        // Clear the setup token from localStorage
        localStorage.removeItem('mfa_setup_token')
        
        // Navigate after successful MFA setup
        setTimeout(() => navigate("/auth/login"), 3000)
      }
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to enable MFA. Please try again."
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipMFA = () => {
    localStorage.removeItem('mfa_setup_token')
    navigate("/auth/tier-selection")
  }

  return (
    <AuthLayout
      title="Enable MFA"
      subtitle="Secure your account with two-factor authentication"
      step={{ current: 1, total: 3 }}
    >
      <div className="space-y-6">
        {message && (
          <div className={`p-3 rounded-md text-center text-sm ${message.includes("✅") || message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
        
        <div className="flex items-center justify-center">
          {qrCode ? (
            <img 
              src={qrCode} 
              alt="MFA QR Code for authenticator app" 
              className="w-48 h-48 rounded-2xl border border-border"
            />
          ) : (
            <div className="w-48 h-48 bg-muted rounded-2xl flex items-center justify-center">
              <Shield className="w-24 h-24 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Scan the QR code with Google Authenticator or Authy app
          </p>
          
          {secretKey && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Secret Key (for manual entry)</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-foreground break-all">{secretKey}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(secretKey)}
                  className="ml-2 p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0"
                  aria-label="Copy secret key to clipboard"
                  title="Copy secret key"
                >
                  {message.includes("Copied") ? (
                    <Check className="w-4 h-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
              </div>
            </Card>
          )}
        </div>

        {backupCodes.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Backup Codes</h3>
            <p className="text-sm text-muted-foreground text-center">
              Save these codes in a secure place. Each code can be used once.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {backupCodes.map((backupCode, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">{backupCode}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(backupCode, index)}
                      className="ml-2 p-1 hover:bg-background rounded transition-colors flex-shrink-0"
                      aria-label={`Copy backup code ${index + 1} to clipboard`}
                      title={`Copy backup code ${index + 1}`}
                    >
                      {copiedCodeIndex === index ? (
                        <Check className="w-3 h-3 text-success" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'))
                  setMessage("All backup codes copied to clipboard")
                }}
                variant="outline"
                size="sm"
                className="mt-2"
                aria-label="Copy all backup codes to clipboard"
                title="Copy all backup codes"
              >
                <Copy className="w-3 h-3 mr-2" aria-hidden="true" />
                Copy All Codes
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Verification Code"
              placeholder="Enter 6-digit code from app"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              aria-label="Enter 6-digit verification code from authenticator app"
              disabled={!token}
            />

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
              disabled={!token || code.length !== 6}
              aria-label="Verify and enable MFA"
            >
              Verify & Enable MFA
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={handleSkipMFA}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 text-center"
          aria-label="Skip MFA setup for now"
          title="Skip MFA setup"
        >
          Skip for now
        </button>
      </div>
    </AuthLayout>
  )
}