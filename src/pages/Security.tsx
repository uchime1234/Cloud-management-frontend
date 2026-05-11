"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Key,
  Globe,
  Database,
  Activity,
  Brain,
  DollarSign,
  FileText,
  Skull,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Fingerprint,
  Bell,
  Trash2,
} from "lucide-react"

// Types
type SecurityMenuItem =
  | "dashboard"
  | "iam"
  | "public-exposure"
  | "security-groups"
  | "cloudwatch-logs"
  | "encryption"
  | "credentials"
  | "alerts"
  | "ai-advisor"
  | "cost-impact"
  | "compliance"
  | "activity-monitoring"
  | "zombie-access"

type AwsAccount = {
  id: number
  account_id: string
  aws_account_id: string
  role_arn: string
  external_id: string
  status: string
  created_at: string
  updated_at: string
  account_alias?: string
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const Security: React.FC = () => {
  const navigate = useNavigate()
  const [selectedMenu, setSelectedMenu] = useState<SecurityMenuItem>("dashboard")
  const [loading, setLoading] = useState(false)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [awsAccounts, setAwsAccounts] = useState<AwsAccount[]>([])
  
  // IAM Security States
  const [iamFindings, setIamFindings] = useState<any[]>([])
  const [iamSummary, setIamSummary] = useState({ critical: 0, high: 0, medium: 0, low: 0, total: 0 })
  const [iamScanning, setIamScanning] = useState(false)
  const [iamCached, setIamCached] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null)
  const [reportSummary, setReportSummary] = useState<any>(null)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  const getAuthHeaders = () => {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Token ${token}` : ''
    }
  }

  // Fetch AWS accounts
  const fetchUserAccounts = async () => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/aws/accounts/`, {
        headers: getAuthHeaders()
      })

      if (response.status === 401) {
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch AWS accounts")
      }

      const data = await response.json()
      
      let accountsArray = []
      if (data.accounts && Array.isArray(data.accounts)) {
        accountsArray = data.accounts
      } else if (Array.isArray(data)) {
        accountsArray = data
      }
      
      setAwsAccounts(accountsArray)
      
      if (accountsArray.length > 0) {
        const connectedAccount = accountsArray.find((acc: AwsAccount) => acc.status === 'connected')
        const accountToUse = connectedAccount || accountsArray[0]
        setAccountId(accountToUse.id)
      }
    } catch (err: any) {
      console.error("Error fetching AWS accounts:", err)
      setAwsAccounts([])
    }
  }
// Load cached findings (GET request) - NO AWS CALL
const loadIamFindings = async () => {
  if (!accountId) return
  
  setIamScanning(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/iam/findings/${accountId}/`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      setIamFindings(data.findings || [])
      setAiRecommendations(data.ai_recommendations)  // ← Load cached AI recommendations
      setReportSummary(data.report_summary)
      setIamSummary({
        critical: data.critical || 0,
        high: data.high || 0,
        medium: data.medium || 0,
        low: data.low || 0,
        total: data.total_findings || 0
      })
    }
  } catch (error) {
    console.error('Error loading IAM findings:', error)
  } finally {
    setIamScanning(false)
  }
}
// Scan IAM security (POST request) - CAN CALL AWS
const scanIamSecurity = async (forceRefresh = false) => {
  if (!accountId) return
  
  setIamScanning(true)
  try {
    const url = forceRefresh 
      ? `${API_BASE_URL}/api/security/iam/scan/${accountId}/?force_refresh=true`
      : `${API_BASE_URL}/api/security/iam/scan/${accountId}/`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      setIamFindings(data.findings || [])
      setAiRecommendations(data.ai_recommendations)  // ← Store AI recommendations
      setReportSummary(data.report_summary)          // ← Store report summary
      setIamCached(data.cached || false)
      
      const critical = data.findings?.filter((f: any) => f.severity === 'critical').length || 0
      const high = data.findings?.filter((f: any) => f.severity === 'high').length || 0
      const medium = data.findings?.filter((f: any) => f.severity === 'medium').length || 0
      const low = data.findings?.filter((f: any) => f.severity === 'low').length || 0
      
      setIamSummary({ critical, high, medium, low, total: data.total_findings || 0 })
    }
  } catch (error) {
    console.error('Error scanning IAM:', error)
  } finally {
    setIamScanning(false)
  }
}
// Clear cached findings (DELETE request)
const clearIamFindings = async () => {
  if (!accountId) return
  
  if (!window.confirm('⚠️ Are you sure you want to clear all IAM findings? This will remove cached data and you will need to scan again.')) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/iam/clear/${accountId}/`, {
      method: 'DELETE',  // DELETE for clearing cache
      headers: getAuthHeaders()
    })
    
    if (response.ok) {
      setIamFindings([])
      setIamSummary({ critical: 0, high: 0, medium: 0, low: 0, total: 0 })
      // Show success message
    }
  } catch (error) {
    console.error('Error clearing IAM findings:', error)
  }
}

  // Load accounts on mount
  useEffect(() => {
    fetchUserAccounts()
  }, [navigate])

  // Load IAM findings when account changes or menu selects IAM
  useEffect(() => {
    if (accountId && selectedMenu === "iam") {
      loadIamFindings()
    }
  }, [accountId, selectedMenu])

  // Security Summary (mock data - replace with real API)
  const securitySummary = {
    total_risks: 23,
    critical: 3,
    high: 7,
    medium: 8,
    low: 5,
    security_score: 68,
  }

  // ============================================================
  // MENU ITEMS
  // ============================================================

  const menuItems: { id: SecurityMenuItem; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Security Risk Dashboard", icon: <Shield className="w-4 h-4" /> },
    { id: "iam", label: "IAM Security Analyzer", icon: <Key className="w-4 h-4" /> },
    { id: "public-exposure", label: "Public Exposure Detection", icon: <Globe className="w-4 h-4" /> },
    { id: "security-groups", label: "Security Group Analyzer", icon: <Lock className="w-4 h-4" /> },
    { id: "cloudwatch-logs", label: "CloudWatch & Logging", icon: <Database className="w-4 h-4" /> },
    { id: "encryption", label: "Encryption Checker", icon: <Lock className="w-4 h-4" /> },
    { id: "credentials", label: "Key & Credential Risk", icon: <Fingerprint className="w-4 h-4" /> },
    { id: "alerts", label: "Real-Time Alerts", icon: <Bell className="w-4 h-4" /> },
    { id: "ai-advisor", label: "AI Security Advisor", icon: <Brain className="w-4 h-4" /> },
    { id: "cost-impact", label: "Security + Cost Impact", icon: <DollarSign className="w-4 h-4" /> },
    { id: "compliance", label: "Compliance Checker", icon: <FileText className="w-4 h-4" /> },
    { id: "activity-monitoring", label: "Activity Monitoring", icon: <Activity className="w-4 h-4" /> },
    { id: "zombie-access", label: "Zombie Access Detection", icon: <Skull className="w-4 h-4" /> },
  ]

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // 1. SECURITY RISK DASHBOARD
  const renderDashboard = () => {
    const getScoreColor = () => {
      if (securitySummary.security_score >= 80) return "text-green-600"
      if (securitySummary.security_score >= 60) return "text-yellow-600"
      return "text-red-600"
    }

    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <div className="text-center">
              <span className={`text-4xl font-bold ${getScoreColor()}`}>{securitySummary.security_score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Security Score: Needs Attention
          </h3>
          <p className="text-muted-foreground">
            Several security issues need attention. Review the findings below.
          </p>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto text-red-600 mb-2" />
            <p className="text-2xl font-bold text-red-600">{securitySummary.critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </Card>
          <Card className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-orange-500">{securitySummary.high}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </Card>
          <Card className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-yellow-500">{securitySummary.medium}</p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{securitySummary.low}</p>
            <p className="text-xs text-muted-foreground">Low</p>
          </Card>
          <Card className="p-4 text-center">
            <ShieldCheck className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{securitySummary.total_risks}</p>
            <p className="text-xs text-muted-foreground">Total Risks</p>
          </Card>
        </div>
      </div>
    )
  }

  // 2. IAM SECURITY ANALYZER
  const renderIAMSecurity = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">IAM Security Analyzer</h3>
              <p className="text-sm text-muted-foreground">Detect over-privileged users, missing MFA, and credential risks</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearIamFindings}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache
              </button>
              <button
                onClick={() => scanIamSecurity(false)}
                disabled={iamScanning}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
              >
                <Database className="w-4 h-4" />
                Load Cached
              </button>
              <button
                onClick={() => scanIamSecurity(true)}
                disabled={iamScanning}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                {iamScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {iamScanning ? 'Scanning...' : 'Scan IAM'}
              </button>
            </div>
          </div>

          {iamCached && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700">
              <Database className="w-4 h-4 inline mr-2" />
              Results from cache (less than 24h old). Click "Scan IAM" for fresh data.
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{iamSummary.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{iamSummary.high}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{iamSummary.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{iamSummary.low}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{iamSummary.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Findings */}
          {iamScanning && iamFindings.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p>Scanning IAM security...</p>
            </div>
          ) : iamFindings.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold">No IAM Issues Found!</h4>
              <p className="text-muted-foreground">Your IAM configuration looks secure.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {iamFindings.map((finding) => (
                <div
                  key={finding.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    finding.severity === "critical" ? "bg-red-50 dark:bg-red-950/20 border-l-red-600" :
                    finding.severity === "high" ? "bg-orange-50 dark:bg-orange-950/20 border-l-orange-500" :
                    finding.severity === "medium" ? "bg-yellow-50 dark:bg-yellow-950/20 border-l-yellow-500" :
                    "bg-blue-50 dark:bg-blue-950/20 border-l-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                          finding.severity === "critical" ? "bg-red-200 text-red-800" :
                          finding.severity === "high" ? "bg-orange-200 text-orange-800" :
                          finding.severity === "medium" ? "bg-yellow-200 text-yellow-800" :
                          "bg-blue-200 text-blue-800"
                        }`}>
                          {finding.severity}
                        </span>
                        <h4 className="font-semibold text-foreground">{finding.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                      <p className="text-sm text-primary mt-2">💡 {finding.recommendation}</p>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90">
                      Fix Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        
          {aiRecommendations && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-foreground">🤖 AI Security Advisor</h4>
                {reportSummary?.generated_at && (
                  <span className="text-xs text-muted-foreground">
                    Generated: {new Date(reportSummary.generated_at).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="p-5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {aiRecommendations.split('\n').map((line, idx) => {
                    if (line.trim().startsWith('-')) {
                      return <li key={idx} className="ml-4 mb-1">{line.substring(1).trim()}</li>
                    }
                    if (line.trim().match(/^\d+\./)) {
                      return <li key={idx} className="ml-4 mb-1 list-decimal">{line.trim().replace(/^\d+\.\s*/, '')}</li>
                    }
                    if (line.trim() === '') return <br key={idx} />
                    if (line.includes('**')) {
                      return <p key={idx} className="font-semibold mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>
                    }
                    return <p key={idx} className="mb-2">{line}</p>
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // Placeholder render functions for other sections
  const renderPublicExposure = () => <Card className="p-6"><p>Public Exposure Detection - Coming Soon</p></Card>
  const renderSecurityGroups = () => <Card className="p-6"><p>Security Group Analyzer - Coming Soon</p></Card>
  const renderCloudWatchLogs = () => <Card className="p-6"><p>CloudWatch & Logging Security - Coming Soon</p></Card>
  const renderEncryption = () => <Card className="p-6"><p>Encryption Checker - Coming Soon</p></Card>
  const renderCredentials = () => <Card className="p-6"><p>Key & Credential Risk - Coming Soon</p></Card>
  const renderAlerts = () => <Card className="p-6"><p>Real-Time Alerts - Coming Soon</p></Card>
  const renderAIAdvisor = () => <Card className="p-6"><p>AI Security Advisor - Coming Soon</p></Card>
  const renderCostImpact = () => <Card className="p-6"><p>Security + Cost Impact - Coming Soon</p></Card>
  const renderCompliance = () => <Card className="p-6"><p>Compliance Checker - Coming Soon</p></Card>
  const renderZombieAccess = () => <Card className="p-6"><p>Zombie Access Detection - Coming Soon</p></Card>
  const renderActivityMonitoring = () => <Card className="p-6"><p>Activity Monitoring - Coming Soon</p></Card>

  // AWS Account Selector Component
  const AccountSelector = () => (
    <div className="mb-6">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="account-select" className="block text-sm font-medium text-foreground mb-2">
            Select AWS Account
          </label>
          <select
            id="account-select"
            title="Select AWS Account"
            value={accountId || ""}
            onChange={(e) => setAccountId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={awsAccounts.length === 0}
          >
            {awsAccounts.length === 0 ? (
              <option value="">No accounts connected</option>
            ) : (
              <>
                <option value="">Select an account</option>
                {awsAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_id || account.aws_account_id || 'Unknown'} {account.status === 'connected' ? "✓" : "⏳"}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <button
          onClick={fetchUserAccounts}
          className="mt-6 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80"
          title="Refresh accounts"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT SIDEBAR - MENU */}
        <div className="w-72 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              ← Back to Dashboard
            </button>

            <AccountSelector />

            <div className="space-y-1 mt-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedMenu === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {selectedMenu === "dashboard" && renderDashboard()}
            {selectedMenu === "iam" && renderIAMSecurity()}
            {selectedMenu === "public-exposure" && renderPublicExposure()}
            {selectedMenu === "security-groups" && renderSecurityGroups()}
            {selectedMenu === "cloudwatch-logs" && renderCloudWatchLogs()}
            {selectedMenu === "encryption" && renderEncryption()}
            {selectedMenu === "credentials" && renderCredentials()}
            {selectedMenu === "alerts" && renderAlerts()}
            {selectedMenu === "ai-advisor" && renderAIAdvisor()}
            {selectedMenu === "cost-impact" && renderCostImpact()}
            {selectedMenu === "compliance" && renderCompliance()}
            {selectedMenu === "zombie-access" && renderZombieAccess()}
            {selectedMenu === "activity-monitoring" && renderActivityMonitoring()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}