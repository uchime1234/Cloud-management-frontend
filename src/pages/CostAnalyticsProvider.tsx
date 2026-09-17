"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import ServiceResourceBreakdown from "../components/ServiceResourceBreakdown/ServiceResourceBreakdown"
import { Copy } from "lucide-react"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Power,
  Settings,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Database,
  Server,
  HardDrive,
  Cpu,
  Activity,
  Container,
  Cloud,
  Layers,
  Globe,
  Scale,
  Key,
  MessageSquare,
  Bell,
  Package,
  Lock,
  Eye,
  Trash2,
  Lightbulb,
  Zap,
  Code,
  Box,
  Sparkles,
  FileText,
  CircuitBoard,
  Monitor,
  Shield,
  Wrench,
  Flame as Heatmap,
  Network,
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  X,
  Github,
  GitMerge,
  FolderTree,
  FileCode,
  ChevronRight,
} from "lucide-react"

// ============================================================
// TYPES
// ============================================================

type MenuItem =
  | "overview"
  | "connect"
  | "breakdown"
  | "forecast"
  | "idle"
  | "storage"
  | "rightsizing"
  | "github"
  | "deployments"

type AwsInfo = {
  platform_account_id: string
  role_name: string
}

type DailySpend = {
  date: string
  amount: number
  day_name?: string
  full_date?: string
}

type Forecast = {
  thirtyDay: number
  sevenDay: number
}

type ServiceBreakdown = {
  service: string
  amount: number
  percentage: number
  recommendation?: string
  estimated_savings?: number
}

type ProviderData = {
  total_spend: number
  today_spend: number
  current_month_spend: number
  current_month_name: string
  monthly_change: number
  forecast: Forecast
  daily_spend: DailySpend[]
  service_breakdown?: ServiceBreakdown[]
  cost_drivers?: any[]
}

type AwsAccount = {
  id: number
  account_id?: string
  aws_account_id: string
  role_arn: string
  external_id: string
  status: string
  created_at: string
  updated_at: string
}

type GitHubRepo = {
  id: number
  repo_id: number
  repo_name: string
  repo_full_name: string
  repo_url: string
  aws_account_id?: number
  aws_account_name?: string
  status: string
  webhook_id?: number
  last_sync_at?: string
  connected_at: string
}

type Deployment = {
  id: number
  pr_number: number
  pr_title: string
  pr_url: string
  merged_by: string
  merged_at: string
  files_changed: string[]
  services_affected: string[]
  cost_impact?: number
  is_correlated: boolean
}

type ScanResult = {
  repo_id: number
  repo_name: string
  has_terraform: boolean
  status: string
  error?: string
}

interface StorageScanResult {
  success: boolean
  cached?: boolean
  total_findings: number
  total_potential_savings: number
  ebs_volumes: {
    total: number
    unattached: number
    unattached_volumes: Array<{
      volume_id: string
      size_gb: number
      volume_type: string
      monthly_cost: number
      region: string
    }>
    items: Array<{
      volume_id: string
      size_gb: number
      volume_type: string
      state: string
      is_attached: boolean
      monthly_cost: number
    }>
  }
  rds_instances: {
    total: number
    items: Array<{
      instance_id: string
      engine: string
      instance_class: string
      storage_gb: number
      status: string
      is_idle: boolean
    }>
  }
  elastic_ips: {
    total: number
    unused: number
    items: Array<{
      public_ip: string
      allocation_id: string
      domain: string
      is_associated: boolean
    }>
  }
  snapshots: {
    total: number
    old: number
    items: Array<{
      snapshot_id: string
      volume_size: number
      age_days: number
      monthly_cost: number
    }>
  }
  idle_rds_instances: {
    count: number
    items: Array<{
      instance_id: string
      instance_class: string
      avg_cpu: number
      storage_gb: number
      monthly_cost: number
    }>
  }
  unused_amis: {
    count: number
    items: Array<{
      ami_id: string
      name: string
      age_days: number
      volume_size_gb: number
      monthly_cost: number
    }>
  }
  duplicate_snapshots: {
    count: number
    items: Array<{
      volume_id: string
      total_snapshots: number
      redundant_count: number
      redundant_snapshots: string[]
      total_size_gb: number
      monthly_cost: number
    }>
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const CostAnalyticsProvider: React.FC = () => {
  const { provider } = useParams<{ provider: string }>()
  const navigate = useNavigate()
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>("overview")

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${getAuthToken()}`
    }
  }

  const [awsInfo, setAwsInfo] = useState<AwsInfo | null>(null)
  const [externalId, setExternalId] = useState<string | null>(null)
  const [roleArn, setRoleArn] = useState("")
  const [awsLoading, setAwsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [isConnectionSuccess, setIsConnectionSuccess] = useState<boolean>(false)

  const [providerData, setProviderData] = useState<ProviderData>({
    total_spend: 0,
    today_spend: 0,
    current_month_spend: 0,
    current_month_name: '',
    monthly_change: 0,
    forecast: { thirtyDay: 0, sevenDay: 0 },
    daily_spend: [],
    service_breakdown: [],
    cost_drivers: [],
  })

  const [error, setError] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [awsAccounts, setAwsAccounts] = useState<AwsAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")

  // GitHub states
  const [githubConnected, setGithubConnected] = useState<boolean>(false)
  const [githubUser, setGithubUser] = useState<any>(null)
  const [connectedRepos, setConnectedRepos] = useState<GitHubRepo[]>([])
  const [availableRepos, setAvailableRepos] = useState<any[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null)
  const [scanning, setScanning] = useState<boolean>(false)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [selectedReposForScan, setSelectedReposForScan] = useState<number[]>([])
  const [githubLoading, setGithubLoading] = useState<boolean>(false)
  const [selectedReposForCostAnalysis, setSelectedReposForCostAnalysis] = useState<number[]>([])
  const [analyzingCosts, setAnalyzingCosts] = useState<boolean>(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [costAnalysisResults, setCostAnalysisResults] = useState<any[]>([])
  const [costSummary, setCostSummary] = useState<any>(null)
  const [forecastData, setForecastData] = useState<any>(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'2days' | '1week' | '1month' | '2months' | '3months'>('1month')
  const [selectedService, setSelectedService] = useState<string | null>(null)

  // AI Recommendations states
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false)
  const [aiAnalysisGeneratedAt, setAiAnalysisGeneratedAt] = useState<string | null>(null)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)

  // Storage Optimization States
  const [storageScanning, setStorageScanning] = useState<boolean>(false)
  const [storageResults, setStorageResults] = useState<StorageScanResult | null>(null)
  const [storageActiveTab, setStorageActiveTab] = useState<string>('optimizations')

  // Idle Resources States
  const [idleScanning, setIdleScanning] = useState<boolean>(false)
  const [idleResults, setIdleResults] = useState<any>(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (accountId && selectedMenu === "rightsizing") {
      fetchCachedAIAnalysis()
    }
  }, [accountId, selectedMenu])

  useEffect(() => {
    const fetchAwsInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/aws/setup/`, {
          headers: getAuthHeaders()
        })
        if (response.status === 401) {
          navigate('/login')
          return
        }
        if (!response.ok) throw new Error("Failed to load AWS info")
        const data = await response.json()
        setAwsInfo(data)
      } catch (error) {
        console.error("Error fetching AWS info:", error)
        setConnectionStatus("Failed to load AWS platform information")
      }
    }
    fetchAwsInfo()
  }, [navigate])

  useEffect(() => {
    fetchUserAccounts()
  }, [provider, navigate])

  useEffect(() => {
    if (selectedMenu === "idle" && accountId && !idleResults && !idleScanning) {
      scanAllIdleResources(false)
    }
  }, [selectedMenu, accountId])

  useEffect(() => {
    if (selectedMenu === "forecast" && accountId) {
      fetchForecastData()
    }
  }, [selectedMenu, accountId])

  useEffect(() => {
    if (selectedMenu === "storage" && accountId && !storageResults && !storageScanning) {
      runStorageScan(false)
    }
  }, [selectedMenu, accountId])

  useEffect(() => {
    const loadExternalId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/aws/setup/`, {
          method: "GET",
          headers: getAuthHeaders()
        })
        if (response.ok) {
          const data = await response.json()
          if (data.external_id) {
            setExternalId(data.external_id)
          }
        }
      } catch (error) {
        console.error("Error loading external ID:", error)
      }
    }
    loadExternalId()
  }, [])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }
    fetchGithubStatus()
    fetchConnectedRepos()
  }, [])

  useEffect(() => {
    if (!accountId) return
    const loadAllData = async () => {
      setLoading(true)
      try {
        if (selectedMenu === "overview") {
          await fetchCostAnalytics()
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAllData()
  }, [accountId, selectedMenu])

  // ============================================================
  // API FUNCTIONS
  // ============================================================

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
      if (!response.ok) throw new Error("Failed to fetch AWS accounts")
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
        if (selectedMenu === "overview") {
          await fetchCostAnalytics()
        }
      }
    } catch (err: any) {
      console.error("Error fetching AWS accounts:", err)
      setError(err.message)
      setAwsAccounts([])
    }
  }

  const fetchCostAnalytics = async () => {
    if (!accountId) return
    const token = getAuthToken()
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/analytics/`, {
        headers: getAuthHeaders()
      })
      if (response.status === 401) {
        navigate('/login')
        return
      }
      if (!response.ok) {
        let errorMessage = "Failed to fetch cost analytics"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) { }
        throw new Error(errorMessage)
      }
      const data = await response.json()
      const serviceBreakdown = (data.service_breakdown || [])
        .filter((service: any) => service.amount > 0.50)
        .filter((service: any) => service.percentage > 0.5)
        .slice(0, 10)
      setProviderData({
        total_spend: data.total_spend || 0,
        today_spend: data.today_spend || 0,
        current_month_spend: data.current_month_spend || 0,
        current_month_name: data.current_month_name || '',
        monthly_change: data.monthly_change || 0,
        forecast: data.forecast || { thirtyDay: 0, sevenDay: 0 },
        daily_spend: data.daily_spend || [],
        service_breakdown: serviceBreakdown || [],
        cost_drivers: data.cost_drivers || [],
      })
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching cost analytics:", err)
      setProviderData({
        total_spend: 0,
        today_spend: 0,
        current_month_spend: 0,
        current_month_name: '',
        monthly_change: 0,
        forecast: { thirtyDay: 0, sevenDay: 0 },
        daily_spend: [],
        service_breakdown: [],
        cost_drivers: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = async () => {
    if (!accountId) return
    if (!window.confirm('⚠️ Are you sure you want to clear all saved data? This will delete all cost and resource data for this account.')) return
    setLoading(true)
    setStatus('Clearing all data...')
    try {
      const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/clear-data/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${getAuthToken()}` }
      })
      if (response.status === 401) { navigate('/login'); return }
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to clear data') }
      const data = await response.json()
      setStatus('✅ ' + data.message)
      setIsConnectionSuccess(true)
      setProviderData({
        total_spend: 0, today_spend: 0, current_month_spend: 0, current_month_name: '',
        monthly_change: 0, forecast: { thirtyDay: 0, sevenDay: 0 },
        daily_spend: [], service_breakdown: [], cost_drivers: [],
      })
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus('❌ ' + (error instanceof Error ? error.message : 'Failed to clear data'))
      setIsConnectionSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchForecastData = async () => {
    if (!accountId) return
    setForecastLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/forecast/`, {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch forecast')
      const data = await response.json()
      setForecastData(data)
    } catch (error) {
      console.error('Error fetching forecast:', error)
      setStatus('❌ Failed to load forecast data')
    } finally {
      setForecastLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    if (!accountId) return
    setLoading(true)
    setError(null)
    setStatus('')
    try {
      const syncResponse = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/sync/`, {
        method: "POST",
        headers: getAuthHeaders()
      })
      if (!syncResponse.ok) {
        const errorData = await syncResponse.json()
        console.warn("Sync triggered but may have issues:", errorData)
      }
      await new Promise(resolve => setTimeout(resolve, 3000))
      await fetchCostAnalytics()
      setStatus("Data refreshed successfully!")
      setTimeout(() => setStatus(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createRoleInAws = async () => {
    setAwsLoading(true)
    setConnectionStatus(null)
    setIsConnectionSuccess(false)
    try {
      const getResponse = await fetch(`${API_BASE_URL}/aws/setup/`, {
        method: "GET",
        headers: getAuthHeaders()
      })
      if (getResponse.ok) {
        const data = await getResponse.json()
        if (data.external_id) {
          setExternalId(data.external_id)
          setConnectionStatus("External ID ready! Follow the steps below.")
          setIsConnectionSuccess(true)
          setAwsLoading(false)
          return
        }
      }
      const res = await fetch(`${API_BASE_URL}/aws/setup/`, {
        method: "POST",
        headers: getAuthHeaders()
      })
      if (res.status === 401) { navigate('/login'); return }
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Failed to generate External ID") }
      const data = await res.json()
      setExternalId(data.external_id)
      setConnectionStatus("External ID generated successfully!")
      setIsConnectionSuccess(true)
    } catch (err: any) {
      setConnectionStatus(`❌ ${err.message}`)
      setIsConnectionSuccess(false)
    } finally {
      setAwsLoading(false)
    }
  }

  const connectAccount = async () => {
    if (!roleArn.trim()) {
      setConnectionStatus("❌ Please enter a Role ARN")
      setIsConnectionSuccess(false)
      return
    }
    setAwsLoading(true)
    setConnectionStatus(null)
    try {
      const res = await fetch(`${API_BASE_URL}/aws/connect/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role_arn: roleArn }),
      })
      if (res.status === 401) { navigate('/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to connect account")
      setConnectionStatus(`✅ ${data.message || "AWS account connected successfully!"}`)
      setIsConnectionSuccess(true)
      setRoleArn("")
      setExternalId(null)
      await fetchUserAccounts()
      setTimeout(() => {
        setSelectedMenu("overview")
        setStatus("AWS account connected! Loading your cost data...")
      }, 1500)
    } catch (err: any) {
      setConnectionStatus(`❌ ${err.message}`)
      setIsConnectionSuccess(false)
    } finally {
      setAwsLoading(false)
    }
  }

  const fetchCachedAIAnalysis = async () => {
    if (!accountId) return
    try {
      const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/cached-analysis/`, {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch cached analysis')
      const data = await response.json()
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis)
        setAiAnalysisGeneratedAt(data.generated_at)
      } else {
        setAiAnalysis(null)
      }
    } catch (error) {
      console.error('Error fetching cached analysis:', error)
    }
  }

  const generateAIAnalysis = async () => {
    if (!accountId) return
    setAiAnalysisLoading(true)
    setStatus('🤖 Generating AI analysis... This may take a moment.')
    try {
      const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/ai-analysis/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to generate analysis')
      const data = await response.json()
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis)
        setAiAnalysisGeneratedAt(data.generated_at)
        setStatus('✅ AI analysis generated successfully!')
      } else {
        throw new Error('No analysis returned')
      }
    } catch (error) {
      setStatus('❌ Failed to generate AI analysis. Please try again.')
    } finally {
      setAiAnalysisLoading(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  const fetchGithubAuthUrl = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/github/auth-url/`, {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to get auth URL')
      const data = await response.json()
      window.location.href = data.auth_url
    } catch (error) {
      setStatus('❌ Failed to connect GitHub')
    }
  }

  const fetchConnectedRepos = async () => {
    const token = getAuthToken()
    if (!token) { setConnectedRepos([]); return }
    try {
      const response = await fetch(`${API_BASE_URL}/github/connected/`, {
        headers: getAuthHeaders()
      })
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        setConnectedRepos([])
        return
      }
      if (!response.ok) throw new Error('Failed to fetch connected repos')
      const data = await response.json()
      setConnectedRepos(data.repos || [])
    } catch (error) {
      setConnectedRepos([])
    }
  }

  const fetchGithubStatus = async () => {
    const token = getAuthToken()
    if (!token) { setGithubConnected(false); return }
    try {
      const response = await fetch(`${API_BASE_URL}/github/status/`, {
        headers: getAuthHeaders()
      })
      if (response.status === 401 || response.status === 403) {
        setGithubConnected(false)
        return
      }
      if (response.ok) {
        const data = await response.json()
        setGithubConnected(data.connected)
        if (data.username) setGithubUser(data)
      }
    } catch (error) {
      setGithubConnected(false)
    }
  }

  const fetchAvailableRepos = async () => {
    setGithubLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/github/repos/`, {
        headers: getAuthHeaders()
      })
      if (response.status === 401) { setAvailableRepos([]); return }
      if (!response.ok) throw new Error('Failed to fetch repositories')
      const data = await response.json()
      const reposWithUrls = (data.repos || []).map((repo: any) => ({
        ...repo,
        html_url: repo.html_url || `https://github.com/${repo.full_name}`,
        url: repo.html_url || `https://github.com/${repo.full_name}`,
      }))
      setAvailableRepos(reposWithUrls)
    } catch (error) {
      setAvailableRepos([])
    } finally {
      setGithubLoading(false)
    }
  }

  const deleteAccount = async () => {
    setDeletingAccount(true)
    setStatus('🗑️ Deleting your account...')
    try {
      const response = await fetch(`${API_BASE_URL}/user/delete-account/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setStatus('✅ Account deleted. Redirecting...')
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        throw new Error(data.error || 'Failed to delete account')
      }
    } catch (error: any) {
      setStatus(`❌ ${error.message}`)
      setDeletingAccount(false)
    }
  }

  const connectRepo = async (repo: any, awsAccountId?: number) => {
    if (connectedRepos.length >= 2) {
      setStatus('❌ Maximum 2 repositories already connected.')
      setTimeout(() => setStatus(''), 3000)
      return
    }
    try {
      const token = getAuthToken()
      const requestBody = {
        repo_id: repo.id,
        repo_name: repo.name,
        repo_full_name: repo.full_name,
        repo_url: repo.html_url,
        aws_account_id: awsAccountId || accountId
      }
      const response = await fetch(`${API_BASE_URL}/github/connect-legacy/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(requestBody)
      })
      const responseData = await response.json()
      if (!response.ok) {
        if (responseData.error && responseData.error.includes('Maximum 2 repositories')) {
          setStatus('❌ Maximum 2 repositories already connected.')
        } else {
          throw new Error(responseData.error || 'Failed to connect repository')
        }
        setTimeout(() => setStatus(''), 3000)
        return
      }
      await fetchConnectedRepos()
      await fetchAvailableRepos()
      setStatus(`✅ Connected ${repo.full_name}`)
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus(`❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  const disconnectRepo = async (repoId: number) => {
    if (!confirm('Are you sure you want to disconnect this repository?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/github/repos/${repoId}/disconnect/`, {
        method: "DELETE",
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to disconnect repository')
      setStatus('✅ Repository disconnected')
      await fetchConnectedRepos()
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus('❌ Failed to disconnect repository')
    }
  }

  const fetchDeployments = async (repoId: number) => {
    setSelectedRepoId(repoId)
    try {
      const response = await fetch(`${API_BASE_URL}/github/repos/${repoId}/deployments/`, {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch deployments')
      const data = await response.json()
      setDeployments(data.deployments || [])
    } catch (error) {
      setDeployments([])
    }
  }

  const analyzeTerraformCosts = async () => {
    if (selectedReposForCostAnalysis.length === 0) {
      setStatus('❌ Please select at least one repository to analyze')
      return
    }
    setAnalyzingCosts(true)
    setCostAnalysisResults([])
    setCostSummary(null)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/github/analyze-terraform-costs/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ repo_ids: selectedReposForCostAnalysis })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze costs')
      }
      const data = await response.json()
      setCostAnalysisResults(data.results || [])
      setCostSummary(data.summary)
      setStatus('✅ Cost analysis completed!')
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      setStatus(`❌ Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setAnalyzingCosts(false)
    }
  }

  const toggleRepoForCostAnalysis = (repoId: number) => {
    setSelectedReposForCostAnalysis(prev =>
      prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
    )
  }

  const startScan = async () => {
    if (selectedReposForScan.length === 0) {
      setStatus('❌ Please select at least one repository to scan')
      return
    }
    setScanning(true)
    try {
      const token = getAuthToken()
      if (!token) { setStatus('❌ No authentication token found.'); setScanning(false); return }
      const response = await fetch(`${API_BASE_URL}/github/scan/start-manual/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ repo_ids: selectedReposForScan })
      })
      if (response.status === 401) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        setStatus('❌ Session expired. Please log in again.')
        setTimeout(() => navigate('/login'), 2000)
        setScanning(false)
        return
      }
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start scan')
      }
      const data = await response.json()
      const scanId = data.scan_id
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/github/scan/status/${scanId}/`, {
            headers: { 'Authorization': `Token ${token}` }
          })
          if (statusResponse.ok) {
            const scanData = await statusResponse.json()
            if (scanData.status === 'complete') {
              setScanResults(scanData.results || [])
              setScanning(false)
              clearInterval(pollInterval)
              setStatus('✅ Scan completed!')
              setTimeout(() => setStatus(''), 3000)
            } else if (scanData.status === 'error') {
              setScanning(false)
              clearInterval(pollInterval)
              setStatus(`❌ Scan failed: ${scanData.error || 'Unknown error'}`)
            } else {
              if (scanData.percentage) {
                setStatus(`Scanning: ${scanData.percentage}% - ${scanData.current_repo || 'Processing...'}`)
              }
            }
          }
        } catch (err) { }
      }, 2000)
      setTimeout(() => {
        if (scanning) {
          clearInterval(pollInterval)
          setScanning(false)
          setStatus('⏰ Scan timeout. Please try again.')
        }
      }, 60000)
    } catch (error) {
      setStatus(`❌ Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setScanning(false)
    }
  }

  const toggleRepoForScan = (repoId: number) => {
    setSelectedReposForScan(prev =>
      prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
    )
  }

  const runStorageScan = async (forceRefresh = false) => {
    if (!accountId) { setStatus('❌ Please select an AWS account first'); return }
    setStorageScanning(true)
    setStatus(forceRefresh ? '🔄 Fetching fresh data from AWS...' : '📦 Loading cached results...')
    try {
      const url = forceRefresh
        ? `${API_BASE_URL}/storage-scan/complete/${accountId}/?force_refresh=true`
        : `${API_BASE_URL}/storage-scan/complete/${accountId}/`
      const response = await fetch(url, { headers: getAuthHeaders() })
      if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Failed to scan resources') }
      const data = await response.json()
      if (data.success) {
        setStorageResults(data)
        if (data.cached) {
          setStatus(`📦 Cached results - ${data.total_findings} optimization opportunities found`)
        } else if (data.total_findings > 0) {
          setStatus(`✅ Found ${data.total_findings} issues, saving $${data.total_potential_savings}/month`)
          setStorageActiveTab('optimizations')
        } else {
          setStatus('✅ No optimization opportunities found')
        }
      } else {
        throw new Error(data.error || 'Scan failed')
      }
      setTimeout(() => setStatus(''), 4000)
    } catch (error: any) {
      setStatus(`❌ ${error.message}`)
    } finally {
      setStorageScanning(false)
    }
  }

  const scanAllIdleResources = async (forceRefresh = false) => {
    if (!accountId) { setStatus('❌ Please select an AWS account first'); return }
    setIdleScanning(true)
    setStatus(forceRefresh ? '🔄 Force refreshing from AWS...' : '📦 Loading cached results...')
    try {
      const url = forceRefresh
        ? `${API_BASE_URL}/idle-resources/advanced-scan/${accountId}/?force_refresh=true`
        : `${API_BASE_URL}/idle-resources/advanced-scan/${accountId}/`
      const response = await fetch(url, { method: 'POST', headers: getAuthHeaders() })
      if (!response.ok) throw new Error('Failed to scan idle resources')
      const data = await response.json()
      if (data.success) {
        const results = {
          total_savings: data.total_savings || 0,
          total_findings: data.total_findings || 0,
          cached: data.cached || false,
          ec2_instances: data.ec2_instances || { count: 0, items: [], savings: 0 },
          auto_scaling_groups: data.auto_scaling_groups || { count: 0, items: [], savings: 0 },
          load_balancers: data.load_balancers || { count: 0, items: [], savings: 0 },
          lambda_functions: data.lambda_functions || { count: 0, items: [], savings: 0 },
          ecs_services: data.ecs_services || { count: 0, items: [], savings: 0 },
          nat_gateways: data.nat_gateways || { count: 0, items: [], savings: 0 },
          vpc_endpoints: data.vpc_endpoints || { count: 0, items: [], savings: 0 },
          api_gateways: data.api_gateways || { count: 0, items: [], savings: 0 },
          cloudwatch: data.cloudwatch || {
            log_groups: { count: 0, items: [], savings: 0 },
            alarms: { count: 0, items: [], savings: 0 },
            dashboards: { count: 0, items: [] },
            metrics: { count: 0, items: [], savings: 0 }
          }
        }
        setIdleResults(results)
        if (data.cached) {
          setStatus(`📦 Using cached results. Found ${results.total_findings} idle resources saving $${results.total_savings?.toFixed(2)}/month`)
        } else {
          setStatus(`✅ Scan complete! Found ${results.total_findings} idle resources saving $${results.total_savings?.toFixed(2)}/month`)
        }
      } else {
        throw new Error(data.error || 'Scan failed')
      }
      setTimeout(() => setStatus(''), 5000)
    } catch (error: any) {
      setStatus(`❌ ${error.message}`)
    } finally {
      setIdleScanning(false)
    }
  }

  const clearStorageCache = async () => {
    if (!accountId) return
    if (!window.confirm('⚠️ Are you sure you want to clear ALL storage optimization data?')) return
    setStatus('🗑️ Clearing storage cache...')
    try {
      const response = await fetch(`${API_BASE_URL}/storage-clear/${accountId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to clear cache')
      const data = await response.json()
      setStorageResults(null)
      setStatus(`✅ ${data.message}`)
      setTimeout(() => setStatus(''), 3000)
    } catch (error: any) {
      setStatus(`❌ ${error.message}`)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  const clearIdleResultsCache = async () => {
    if (!accountId) { setStatus('❌ Please select an AWS account first'); return }
    if (!window.confirm('⚠️ Are you sure you want to clear all idle resource findings?')) return
    setStatus('🗑️ Clearing idle results cache...')
    try {
      const response = await fetch(`${API_BASE_URL}/idle-resources/clear/${accountId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error('Failed to clear cache')
      const data = await response.json()
      setIdleResults(null)
      setStatus(`✅ ${data.message || 'Cleared all idle resource findings'}`)
      setTimeout(() => setStatus(''), 3000)
    } catch (error: any) {
      setStatus(`❌ ${error.message}`)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const getDayNameFromDate = (dateStr: string) => {
    if (!dateStr) return ''
    let date: Date
    if (dateStr.includes('-')) {
      date = new Date(dateStr)
    } else {
      const currentYear = new Date().getFullYear()
      date = new Date(`${dateStr}, ${currentYear}`)
    }
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getFullDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    let date: Date
    if (dateStr.includes('-')) {
      date = new Date(dateStr)
    } else {
      const currentYear = new Date().getFullYear()
      date = new Date(`${dateStr}, ${currentYear}`)
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const menuItems: { id: MenuItem; label: string; icon: React.ReactNode }[] = [
    { id: "connect", label: "Connect Account", icon: <Settings className="w-4 h-4" /> },
    { id: "overview", label: "Total Spend", icon: <DollarSign className="w-4 h-4" /> },
    { id: "breakdown", label: "Service & Resource Breakdown", icon: <Layers className="w-4 h-4" /> },
    { id: "forecast", label: "Forecast", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "github", label: "GitHub Integration", icon: <Github className="w-4 h-4" /> },
    { id: "deployments", label: "Deployments", icon: <GitMerge className="w-4 h-4" /> },
    { id: "idle", label: "Idle Resources", icon: <Power className="w-4 h-4" /> },
    { id: "storage", label: "Storage Optimization", icon: <Settings className="w-4 h-4" /> },
    { id: "rightsizing", label: "AI Recommendations", icon: <Sparkles className="w-4 h-4" /> },
  ]

  const selectedAccount = Array.isArray(awsAccounts) && awsAccounts.length > 0
    ? awsAccounts.find(acc => acc.id === accountId)
    : null

  const accountName = selectedAccount
    ? `AWS Account: ${accountId || accountId || 'Unknown'} (${selectedAccount.status || 'unknown'})`
    : awsAccounts.length > 0 ? "Select an account" : "No accounts connected"

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderForecastSection = () => {
    if (forecastLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading forecast data...</span>
        </div>
      )
    }
    if (!forecastData) {
      return (
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Forecast Data Available</h3>
          <p className="text-muted-foreground">Sync your AWS account to generate cost forecasts</p>
          <button onClick={refreshAnalytics} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg">
            Sync Account Data
          </button>
        </Card>
      )
    }
    const getTimeframeData = () => {
      switch (selectedTimeframe) {
        case '2days': return forecastData.two_days
        case '1week': return forecastData.one_week
        case '1month': return forecastData.one_month
        case '2months': return forecastData.two_months
        case '3months': return forecastData.three_months
        default: return forecastData.one_month
      }
    }
    const timeframeData = getTimeframeData()
    return (
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: '2days', label: '2 Days', color: 'bg-blue-500' },
              { id: '1week', label: '1 Week', color: 'bg-green-500' },
              { id: '1month', label: '1 Month', color: 'bg-yellow-500' },
              { id: '2months', label: '2 Months', color: 'bg-orange-500' },
              { id: '3months', label: '3 Months', color: 'bg-red-500' }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTimeframe === tf.id
                    ? `${tf.color} text-white shadow-lg scale-105`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Month</p>
                <p className="text-2xl font-bold text-foreground">
                  ${(forecastData.current_month_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next 7 Days</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(forecastData.one_week?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next 30 Days</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(forecastData.one_month?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next 90 Days</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(forecastData.three_months?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const renderGitHubSection = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">GitHub Integration</h3>
            <p className="text-muted-foreground">
              Connect your GitHub repositories to track infrastructure changes and correlate with cost spikes
            </p>
          </div>
          {!githubConnected ? (
            <button
              onClick={fetchGithubAuthUrl}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Github className="w-4 h-4" />
              Connect GitHub
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Connected as {githubUser?.username || 'GitHub User'}</span>
            </div>
          )}
        </div>

        {githubConnected && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-foreground">
                  Connected Repositories ({connectedRepos.length}/2)
                </h4>
                <button onClick={fetchConnectedRepos} className="text-sm text-primary hover:underline">
                  Refresh
                </button>
              </div>
              {connectedRepos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No repositories connected yet</p>
                  <p className="text-sm mt-2">Maximum 2 repositories allowed</p>
                  <button
                    onClick={fetchAvailableRepos}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                  >
                    Browse Repositories
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedRepos.map((repo) => (
                    <Card key={repo.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Github className="w-5 h-5 text-muted-foreground" />
                            <a
                              href={repo.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-foreground hover:text-primary"
                            >
                              {repo.repo_full_name}
                            </a>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: <span className="text-green-600">{repo.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchDeployments(repo.id)}
                            className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                          >
                            View Deployments
                          </button>
                          <button
                            onClick={() => disconnectRepo(repo.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {connectedRepos.length < 2 && (
              <div className="border-t border-border pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Available Repositories</h4>
                  <button
                    onClick={fetchAvailableRepos}
                    disabled={githubLoading}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-secondary rounded-lg hover:bg-secondary/80"
                  >
                    {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh List
                  </button>
                </div>
                {availableRepos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No repositories found. Make sure your GitHub account has access to some repositories.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {availableRepos.map((repo) => (
                      <Card key={repo.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Github className="w-5 h-5 text-muted-foreground" />
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-foreground hover:text-primary"
                              >
                                {repo.full_name}
                              </a>
                              {repo.has_terraform && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                  🏗️ Terraform
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {repo.description?.substring(0, 100) || 'No description'}
                            </div>
                          </div>
                          <button
                            onClick={() => connectRepo(repo, accountId || undefined)}
                            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                          >
                            Connect
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground">💰 Terraform Cost Estimator</h4>
            <p className="text-muted-foreground text-sm">
              Analyze your Terraform infrastructure and get estimated AWS costs
            </p>
          </div>
          {costSummary && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Monthly Estimate</p>
              <p className="text-2xl font-bold text-primary">
                ${costSummary.total_monthly_cost?.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </div>
          )}
        </div>

        {connectedRepos.length > 0 ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-medium mb-3">Select repositories to analyze:</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {connectedRepos.map((repo) => (
                  <label key={repo.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReposForCostAnalysis.includes(repo.id)}
                      onChange={() => toggleRepoForCostAnalysis(repo.id)}
                      className="w-4 h-4"
                    />
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium flex-1">{repo.repo_full_name}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={analyzeTerraformCosts}
                disabled={analyzingCosts || selectedReposForCostAnalysis.length === 0}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {analyzingCosts ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                {analyzingCosts ? 'Analyzing...' : 'Estimate Costs'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No connected repositories</p>
            <p className="text-sm mt-2">Connect a repository first to analyze Terraform costs</p>
          </div>
        )}
      </Card>
    </div>
  )

  const renderDeploymentsSection = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Deployment Events</h3>
            <p className="text-muted-foreground">
              Track PR merges and correlate them with cost changes
            </p>
          </div>
          <button
            onClick={() => fetchConnectedRepos()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {connectedRepos.length === 0 ? (
          <div className="text-center py-12">
            <GitMerge className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No Connected Repositories</h4>
            <p className="text-muted-foreground mb-6">Connect GitHub repositories to track deployment events</p>
            <button
              onClick={() => setSelectedMenu("github")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
            >
              Connect GitHub Repositories
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label htmlFor="repo-select" className="block text-sm font-medium text-foreground mb-2">
                Select Repository
              </label>
              <select
                id="repo-select"
                title="Select Repository"
                value={selectedRepoId || ''}
                onChange={(e) => fetchDeployments(Number(e.target.value))}
                className="w-full max-w-md px-3 py-2 bg-card border border-border rounded-lg text-sm"
              >
                <option value="">Select a repository...</option>
                {connectedRepos.map((repo) => (
                  <option key={repo.id} value={repo.id}>{repo.repo_full_name}</option>
                ))}
              </select>
            </div>
            {deployments.length === 0 && selectedRepoId && (
              <div className="text-center py-8 text-muted-foreground">
                <GitMerge className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No deployment events found for this repository</p>
              </div>
            )}
            {deployments.length > 0 && (
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <Card key={deployment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <GitMerge className="w-5 h-5 text-primary" />
                          <a
                            href={deployment.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            #{deployment.pr_number}: {deployment.pr_title}
                          </a>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Merged by {deployment.merged_by} at {new Date(deployment.merged_at).toLocaleString()}
                        </div>
                        {deployment.services_affected.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Services affected:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {deployment.services_affected.map((service, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )

  const renderAIRecommendationsSection = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI-Powered Cost Recommendations</h2>
                <p className="text-muted-foreground">
                  Get intelligent insights and actionable recommendations to optimize your AWS spending
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={generateAIAnalysis}
            disabled={aiAnalysisLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {aiAnalysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiAnalysisLoading ? 'Generating...' : 'Generate New Analysis'}
          </button>
        </div>
        {aiAnalysisGeneratedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Last analysis: {new Date(aiAnalysisGeneratedAt).toLocaleString()}
          </p>
        )}
      </Card>

      {aiAnalysisLoading && !aiAnalysis && (
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Your AWS Costs...</h3>
          <p className="text-muted-foreground">Our AI is reviewing your spending patterns.</p>
        </Card>
      )}

      {!aiAnalysis && !aiAnalysisLoading && (
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground mb-6">
            Click "Generate New Analysis" to get AI-powered cost optimization recommendations
          </p>
          <button
            onClick={generateAIAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90"
          >
            Generate Analysis
          </button>
        </Card>
      )}

      {aiAnalysis && !aiAnalysisLoading && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">AI Insights & Recommendations</h3>
          </div>
          <div className={`prose prose-sm dark:prose-invert max-w-none ${!showFullAnalysis && 'max-h-96 overflow-hidden relative'}`}>
            <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {aiAnalysis.split('\n').map((paragraph, idx) => {
                if (paragraph.trim().startsWith('#')) {
                  const level = paragraph.match(/^#+/)?.[0].length || 1
                  const text = paragraph.replace(/^#+\s*/, '')
                  const HeadingTag = `h${Math.min(level, 4)}` as keyof JSX.IntrinsicElements
                  return (
                    <HeadingTag key={idx} className={`font-bold mt-4 mb-2 text-foreground ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'}`}>
                      {text}
                    </HeadingTag>
                  )
                } else if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                  return <li key={idx} className="ml-4 mb-1 text-foreground/90">{paragraph.trim().substring(1).trim()}</li>
                } else if (paragraph.trim().match(/^\d+\./)) {
                  return <li key={idx} className="ml-4 mb-1 text-foreground/90 list-decimal">{paragraph.trim().replace(/^\d+\.\s*/, '')}</li>
                } else if (paragraph.trim()) {
                  return <p key={idx} className="mb-2 text-foreground/90">{paragraph}</p>
                }
                return <br key={idx} />
              })}
            </div>
            {!showFullAnalysis && aiAnalysis.length > 1500 && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent" />
            )}
          </div>
          {aiAnalysis.length > 1500 && (
            <button
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="mt-4 text-sm text-purple-500 hover:text-purple-600 font-medium"
            >
              {showFullAnalysis ? 'Show Less ↑' : 'Show More ↓'}
            </button>
          )}
        </Card>
      )}
    </div>
  )

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT SIDEBAR */}
        <div className="w-72 border-r border-border bg-card/50 overflow-y-auto flex flex-col">
          <div className="p-4 flex-1">
            <button
              onClick={() => navigate("/cost-analytics")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Providers
            </button>

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
                    onChange={(e) => {
                      const newId = Number(e.target.value)
                      setAccountId(newId)
                      if (selectedMenu === "overview") fetchCostAnalytics()
                    }}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!Array.isArray(awsAccounts) || awsAccounts.length === 0}
                  >
                    {!Array.isArray(awsAccounts) || awsAccounts.length === 0 ? (
                      <option value="">No accounts connected</option>
                    ) : (
                      <>
                        <option value="">Select an account</option>
                        {awsAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.aws_account_id || account.account_id || 'Unknown'} {account.status === 'connected' ? "✓" : "⏳"}
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
              <div className="mt-2 text-xs text-muted-foreground">
                {!Array.isArray(awsAccounts) || awsAccounts.length === 0
                  ? "Connect an AWS account to view analytics"
                  : `${awsAccounts.length} account(s) connected`}
              </div>
            </div>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedMenu === item.id
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

          <div className="p-4 mt-auto border-t border-border">
            <button
              onClick={() => {
                if (window.confirm('⚠️ WARNING: This will permanently delete your account and ALL data. This action cannot be undone. Are you absolutely sure?')) {
                  const confirmText = window.prompt('Type "DELETE MY ACCOUNT" to confirm:')
                  if (confirmText === 'DELETE MY ACCOUNT') deleteAccount()
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{accountName}</h1>
                <p className="text-muted-foreground">Detailed cost insights and optimization recommendations</p>
              </div>
              {selectedMenu !== "connect" && accountId && selectedMenu !== "github" && selectedMenu !== "deployments" && (
                <div className="flex gap-2">
                  <button
                    onClick={refreshAnalytics}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Sync Data
                  </button>
                  <button
                    onClick={clearAllData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              )}
            </div>

            {status && (
              <div className={`p-4 rounded-lg ${isConnectionSuccess ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex items-center gap-2">
                  {isConnectionSuccess ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-error" />}
                  <span className={isConnectionSuccess ? "text-success" : "text-error"}>{status}</span>
                </div>
              </div>
            )}

            {connectionStatus && (
              <div className={`p-4 rounded-lg ${isConnectionSuccess ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex items-center gap-2">
                  {isConnectionSuccess ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-error" />}
                  <span className={isConnectionSuccess ? "text-success" : "text-error"}>{connectionStatus}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center gap-2 text-error">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {loading && !providerData.daily_spend.length && selectedMenu === "overview" && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading cost data...</span>
              </div>
            )}

            {/* ==================== NEW: SERVICE & RESOURCE BREAKDOWN ==================== */}
            {selectedMenu === "breakdown" && accountId && (
              <ServiceResourceBreakdown
                accountId={accountId}
                token={getAuthToken() || ''}
              />
            )}

            {/* ==================== FORECAST ==================== */}
            {selectedMenu === "forecast" && accountId && renderForecastSection()}

            {/* ==================== AI RECOMMENDATIONS ==================== */}
            {selectedMenu === "rightsizing" && accountId && renderAIRecommendationsSection()}

            {/* ==================== STORAGE ==================== */}
            {selectedMenu === "storage" && accountId && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Storage Optimization</h2>
                    <p className="text-muted-foreground">Find unattached volumes, idle databases, unused IPs, old snapshots, duplicate backups, and unused AMIs</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={clearStorageCache} disabled={storageScanning} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" /> Clear Cache
                    </button>
                    <button onClick={() => runStorageScan(false)} disabled={storageScanning} className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 disabled:opacity-50">
                      <Database className="w-4 h-4" /> Load Cached
                    </button>
                    <button onClick={() => runStorageScan(true)} disabled={storageScanning} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
                      {storageScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {storageScanning ? 'Scanning...' : 'Scan AWS Now'}
                    </button>
                  </div>
                </div>

                {storageScanning && !storageResults && (
                  <Card className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Scanning AWS Resources...</h3>
                    <p className="text-muted-foreground">Checking EBS volumes, RDS, Elastic IPs, Snapshots, Duplicates, and AMIs</p>
                  </Card>
                )}

                {storageResults && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      <Card className="p-3 text-center">
                        <HardDrive className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                        <p className="text-xl font-bold">{storageResults.ebs_volumes?.unattached || 0}</p>
                        <p className="text-xs text-muted-foreground">Unattached EBS</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Globe className="w-5 h-5 mx-auto text-green-500 mb-1" />
                        <p className="text-xl font-bold">{storageResults.elastic_ips?.unused || 0}</p>
                        <p className="text-xs text-muted-foreground">Unused IPs</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Database className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                        <p className="text-xl font-bold">{storageResults.idle_rds_instances?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle RDS</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Copy className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                        <p className="text-xl font-bold">{storageResults.snapshots?.old || 0}</p>
                        <p className="text-xs text-muted-foreground">Old Snapshots</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Package className="w-5 h-5 mx-auto text-red-500 mb-1" />
                        <p className="text-xl font-bold">{storageResults.unused_amis?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Unused AMIs</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Layers className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                        <p className="text-xl font-bold">{storageResults.duplicate_snapshots?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Duplicate Groups</p>
                      </Card>
                      <Card className="p-3 text-center bg-green-50 dark:bg-green-950/20">
                        <Sparkles className="w-5 h-5 mx-auto text-green-600 mb-1" />
                        <p className="text-xl font-bold text-green-600">${storageResults.total_potential_savings?.toFixed(2) || 0}</p>
                        <p className="text-xs text-muted-foreground">Monthly Savings</p>
                      </Card>
                    </div>
                  </>
                )}

                {!accountId && (
                  <Card className="p-12 text-center">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No AWS Account Selected</h3>
                    <p className="text-muted-foreground">Select or connect an AWS account to scan for storage optimizations</p>
                  </Card>
                )}
              </div>
            )}

            {/* ==================== GITHUB ==================== */}
            {selectedMenu === "github" && renderGitHubSection()}

            {/* ==================== DEPLOYMENTS ==================== */}
            {selectedMenu === "deployments" && renderDeploymentsSection()}

            {/* ==================== OVERVIEW ==================== */}
            {selectedMenu === "overview" && accountId && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total AWS Spend (Last 90 Days)</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${providerData.total_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      {providerData.monthly_change > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-error" />
                          <span className="text-sm text-error">+{Math.min(providerData.monthly_change, 1000).toFixed(1)}% vs last month</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-success" />
                          <span className="text-sm text-success">{providerData.monthly_change.toFixed(1)}% vs last month</span>
                        </>
                      )}
                    </div>
                  </Card>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Yesterday's Spend</p>
                        <p className="text-3xl font-bold text-foreground">
                          ${providerData.today_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">{getYesterday()} • AWS bills with 1-day delay</p>
                  </Card>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">This Month ({providerData.current_month_name || 'Current'})</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${providerData.current_month_spend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-warning" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Month-to-date total • Forecast: ${providerData.forecast.thirtyDay.toFixed(2)}
                    </p>
                  </Card>
                </div>
              </>
            )}

            {/* ==================== IDLE RESOURCES ==================== */}
            {selectedMenu === "idle" && accountId && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Idle Resources Detection</h2>
                    <p className="text-muted-foreground">
                      Identify idle EC2 instances, ASG, Load Balancers, Lambda, ECS, NAT Gateways, VPC Endpoints, API Gateways, and CloudWatch resources
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={clearIdleResultsCache} disabled={idleScanning} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" /> Clear Cache
                    </button>
                    <button onClick={() => scanAllIdleResources(false)} disabled={idleScanning} className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 disabled:opacity-50">
                      <Database className="w-4 h-4" /> Load Cached
                    </button>
                    <button onClick={() => scanAllIdleResources(true)} disabled={idleScanning} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
                      {idleScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {idleScanning ? 'Scanning...' : 'Force Refresh'}
                    </button>
                  </div>
                </div>

                {idleScanning && !idleResults && (
                  <Card className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Scanning All Resources...</h3>
                    <p className="text-muted-foreground">Checking EC2, ASG, Load Balancers, Lambda, ECS, NAT, VPC Endpoints, API Gateway, and CloudWatch</p>
                  </Card>
                )}

                {!idleScanning && !idleResults && (
                  <Card className="p-12 text-center">
                    <Power className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Idle Resources Data</h3>
                    <p className="text-muted-foreground mb-6">Click "Force Refresh" to start scanning for idle resources</p>
                    <button onClick={() => scanAllIdleResources(true)} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">
                      Start Scan
                    </button>
                  </Card>
                )}

                {idleResults && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
                      <Card className="p-3 text-center">
                        <Cpu className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.ec2_instances?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle EC2</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Activity className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.auto_scaling_groups?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle ASG</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Scale className="w-5 h-5 mx-auto text-green-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.load_balancers?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle LBs</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Code className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.lambda_functions?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle Lambda</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Container className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.ecs_services?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle ECS</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Network className="w-5 h-5 mx-auto text-red-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.nat_gateways?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle NAT</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Key className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.vpc_endpoints?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle VPCe</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <Settings className="w-5 h-5 mx-auto text-pink-500 mb-1" />
                        <p className="text-xl font-bold">{idleResults.api_gateways?.count || 0}</p>
                        <p className="text-xs text-muted-foreground">Idle APIs</p>
                      </Card>
                      <Card className="p-3 text-center bg-green-50 dark:bg-green-950/20">
                        <Sparkles className="w-5 h-5 mx-auto text-green-600 mb-1" />
                        <p className="text-xl font-bold text-green-600">${idleResults.total_savings?.toFixed(2) || 0}</p>
                        <p className="text-xs text-muted-foreground">Monthly Savings</p>
                      </Card>
                    </div>

                    {idleResults.total_findings === 0 && (
                      <Card className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold">No Idle Resources Found!</h3>
                        <p className="text-muted-foreground">All your AWS resources appear to be actively used.</p>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==================== CONNECT ==================== */}
            {selectedMenu === "connect" && (
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Connect Your AWS Account</h3>
                <p className="text-muted-foreground mb-6">
                  Securely connect your AWS account to monitor costs, resources, and security
                </p>

                {awsAccounts.length > 0 && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">{awsAccounts.length} AWS account(s) already connected</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <button
                    onClick={createRoleInAws}
                    disabled={awsLoading}
                    className="w-full h-12 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {awsLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating External ID...
                      </span>
                    ) : (
                      "Generate External ID (Required for Trust Policy)"
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Step 5: Enter Role ARN</h4>
                  <div className="space-y-4">
                    <input
                      value={roleArn}
                      onChange={(e) => setRoleArn(e.target.value)}
                      placeholder="arn:aws:iam::123456789012:role/CloudCostReadOnlyRole"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={!externalId}
                    />
                    <button
                      onClick={connectAccount}
                      disabled={awsLoading || !roleArn.trim()}
                      className="w-full h-12 px-6 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {awsLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </span>
                      ) : (
                        "Connect AWS Account"
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* ==================== EMPTY STATES ==================== */}
            {!["overview", "connect", "breakdown", "github", "deployments", "forecast", "rightsizing", "storage", "idle"].includes(selectedMenu) && (
              <Card>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {menuItems.find((m) => m.id === selectedMenu)?.label}
                  </h3>
                  <p className="text-muted-foreground">This feature is coming soon</p>
                </div>
              </Card>
            )}

            {selectedMenu === "overview" && !accountId && awsAccounts.length === 0 && (
              <Card>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No AWS Account Connected</h3>
                  <p className="text-muted-foreground mb-6">Connect an AWS account to view cost analytics and insights</p>
                  <button
                    onClick={() => setSelectedMenu("connect")}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
                  >
                    Connect AWS Account
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CostAnalyticsProvider