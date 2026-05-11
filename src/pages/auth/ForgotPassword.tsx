"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { ArrowLeft, CheckCircle } from "lucide-react"

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Password reset instructions sent">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <p className="text-muted-foreground">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <Button onClick={() => navigate("/auth/login")} className="w-full">
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive reset instructions">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Send Reset Link
        </Button>

        <button
          type="button"
          onClick={() => navigate("/auth/login")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </form>
    </AuthLayout>
  )
}
