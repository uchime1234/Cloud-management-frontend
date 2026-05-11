"use client"

import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAppStore } from "./store/appStore"

// Auth pages
import { Register } from "./pages/auth/Register"
import { MfaRegister } from "./pages/auth/MfaRegister"
import { Login } from "./pages/auth/Login"
import { MfaVerify } from "./pages/auth/MfaVerify"
import { ForgotPassword } from "./pages/auth/ForgotPassword"
import { TierSelection } from "./pages/auth/TierSelection"

import { Dashboard } from "./pages/Dashboard"
import { CostAnalytics } from "./pages/CostAnalytics"
import CostAnalyticsProvider from "./pages/CostAnalyticsProvider"
import AIAgents from "./pages/AIAgents"
import InfrastructureGuides from "./pages/InfrastructureGuides"
import { DeploymentPlaybooks } from "./pages/DeploymentPlaybooks"
import { Monitoring } from "./pages/Monitoring"
import { Inventory } from "./pages/Inventory"
import { Security } from "./pages/Security"
import { Automation } from "./pages/Automation"
import { Collaboration } from "./pages/Collaboration"
import { Business } from "./pages/Business"

function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/mfa-register" element={<MfaRegister />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/mfa-verify" element={<MfaVerify />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/tier-selection" element={<TierSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cost-analytics" element={<CostAnalytics />} />
        <Route path="/cost-analytics/:provider" element={<CostAnalyticsProvider />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/infrastructure-guides" element={<InfrastructureGuides />} />
        <Route path="/deployment-playbooks" element={<DeploymentPlaybooks />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/security" element={<Security />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/business" element={<Business />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
