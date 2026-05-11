"use client"

import type React from "react"
import { useState, FormEvent } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const Register: React.FC = () => {
  const [step, setStep] = useState<"form" | "verify">("form")
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    verification_code: "",
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    
    try {
      // Password confirmation check
      if (step === "form" && formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match.")
        setLoading(false)
        return
      }

      const response = await axios.post(`${API_URL}/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        ...(step === "verify" && { verification_code: formData.verification_code }),
      })

      if (step === "form" && response.data.next_step) {
        setMessage(response.data.message)
        setStep("verify")
      } else {
        setMessage("Registration successful!")
        // Save token and user ID
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user_id', response.data.user_id);
    
    // Redirect to MFA setup page with token
    navigate(`/auth/mfa-register?token=${response.data.token}`);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Something went wrong"
      setMessage(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start managing your cloud costs" 
      step={step === "form" ? { current: 1, total: 2 } : { current: 2, total: 2 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-3 rounded-md text-center text-sm ${message.includes("successful") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
        
        {step === "form" && (
          <div className="space-y-4">
            <Input
              name="username"
              type="text"
              label="Username"
              placeholder="Enter your username"
              className="text-slate-700"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <Input
              name="email"
              type="email"
              label="Email"
              className="text-slate-700"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              label="Password"
              className="text-slate-700"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              className="text-slate-700"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please enter the verification code sent to {formData.email}
            </p>
            <Input
              name="verification_code"
              type="text"
              label="Verification Code"
              placeholder="Enter verification code"
              value={formData.verification_code}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-sm text-primary hover:underline"
            >
              ← Back to registration
            </button>
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          {step === "form" ? "Continue" : "Verify & Complete"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button 
            type="button" 
            onClick={() => navigate("/auth/login")} 
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}