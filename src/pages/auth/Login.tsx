"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { useAuthStore } from "../../store/authStore"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const Login: React.FC = () => {
    const navigate = useNavigate()
    const { setToken, setUser, setMfaVerified } = useAuthStore()
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        mfa_code: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [mfaRequired, setMfaRequired] = useState(false)
    const [mfaUserId, setMfaUserId] = useState<string | null>(null)

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
                    mfa_code: formData.mfa_code || undefined,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            )

            // ============================================================
            // CASE 1: MFA is required but code not provided yet
            // ============================================================
            if (response.data.mfa_required) {
                setMfaRequired(true)
                setMfaUserId(response.data.user_id)
                setError("")

                localStorage.setItem("mfa_user_id", response.data.user_id)
                return
            }

            // ============================================================
            // CASE 2: Login successful (token returned)
            // ============================================================
            if (response.data.token) {
                const { token, user_id, username, email } = response.data

                // ✅ Save token in MULTIPLE places so nothing breaks
                setToken(token) // Zustand store
                localStorage.setItem("token", token) // Primary key
                localStorage.setItem("auth_token", token) // Backup key

                // ✅ Save user info
                const userData = {
                    id: user_id.toString(),
                    email: email || formData.username,
                    username: username || formData.username.split("@")[0],
                }
                setUser(userData)
                localStorage.setItem("user", JSON.stringify(userData))
                localStorage.setItem("user_id", user_id.toString())
                localStorage.setItem("username", userData.username)
                localStorage.setItem("email", userData.email)

                setMfaVerified(true)

                // Clear MFA temp data
                localStorage.removeItem("mfa_user_id")

                // ✅ Verify token was saved (debug log)
                console.log("✅ Login successful")
                console.log("Token saved:", token.substring(0, 15) + "...")
                console.log("localStorage.token:", localStorage.getItem("token") ? "✅ set" : "❌ missing")

                // Redirect to dashboard
                navigate("/dashboard")
            } else {
                setError("Login failed. Please try again.")
            }
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Invalid credentials or server error"
            setError(errorMessage)

            setMfaRequired(false)
            setMfaUserId(null)
        } finally {
            setLoading(false)
        }
    }

    const handleDirectMFA = () => {
        if (mfaUserId) {
            localStorage.setItem("mfa_user_id", mfaUserId)
            navigate("/auth/mfa-verify", {
                state: { userId: mfaUserId },
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
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                        required
                        disabled={loading}
                        autoComplete="username"
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
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
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        mfa_code: e.target.value.replace(/\D/g, "").slice(0, 6),
                                    })
                                }
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
                        <input type="checkbox" className="rounded" disabled={loading} />
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
                        disabled={
                            !formData.username ||
                            !formData.password ||
                            (mfaRequired && !formData.mfa_code)
                        }
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
                    <li>
                        <strong>Username:</strong> demo_user
                    </li>
                    <li>
                        <strong>Password:</strong> demo_password
                    </li>
                    <li>• If MFA is enabled, check your authenticator app</li>
                    <li>• Use backup codes if you've lost access</li>
                </ul>
            </div>
        </AuthLayout>
    )
}