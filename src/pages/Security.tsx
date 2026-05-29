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
  Cpu,
  HardDrive,
  Network,
  Container,
  Zap,
  Search,
  Cloud,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  Sparkles,
  Server,
  Wifi,
  Unlock,
  Link2,
  Plus,
  Minus,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  MessageSquare,
  X
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

// Public Exposure Finding Type
interface PublicExposureFinding {
  id: number
  exposure_type: string
  exposure_type_display: string
  severity: string
  severity_display: string
  resource_name: string
  resource_id: string
  region: string
  public_ip: string
  port: number
  protocol: string
  cidr: string
  security_group_name: string
  security_group_id: string
  details: any
  title: string
  description: string
  recommendation: string
  detected_at: string
  is_resolved: boolean
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const Security: React.FC = () => {
  const navigate = useNavigate()
  const [selectedMenu, setSelectedMenu] = useState<SecurityMenuItem>("dashboard")
 
  const [accountId, setAccountId] = useState<number | null>(null)
  const [awsAccounts, setAwsAccounts] = useState<AwsAccount[]>([])
  
  // IAM Security States
  const [iamFindings, setIamFindings] = useState<any[]>([])
  const [iamSummary, setIamSummary] = useState({ critical: 0, high: 0, medium: 0, low: 0, total: 0 })
  const [iamScanning, setIamScanning] = useState(false)
  const [iamCached, setIamCached] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null)
  const [reportSummary, setReportSummary] = useState<any>(null)
  
  // Public Exposure States
  const [exposureFindings, setExposureFindings] = useState<PublicExposureFinding[]>([])
  const [exposureSummary, setExposureSummary] = useState({ critical: 0, high: 0, medium: 0, low: 0, total: 0 })
  const [exposureScanning, setExposureScanning] = useState(false)
  const [exposureCached, setExposureCached] = useState(false)
  const [exposureAiAnalysis, setExposureAiAnalysis] = useState<string | null>(null)
  const [exposureReportSummary, setExposureReportSummary] = useState<any>(null)
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Security Group Analyzer States
const [securityGroups, setSecurityGroups] = useState<any[]>([])
const [selectedSecurityGroup, setSelectedSecurityGroup] = useState<any>(null)
const [sgLoading, setSgLoading] = useState(false)
const [sgScanning, setSgScanning] = useState(false)
const [sgCached, setSgCached] = useState(false)
const [sgSearchQuery, setSgSearchQuery] = useState("")
const [sgSeverityFilter, setSgSeverityFilter] = useState<string>("all")
const [sgExpandedSection, setSgExpandedSection] = useState("overview")
const [sgStatus, setSgStatus] = useState("")

// Encryption Checker States
const [encryptionSummary, setEncryptionSummary] = useState<any>(null)
const [encryptionFindings, setEncryptionFindings] = useState<any[]>([])
const [encryptionRecommendations, setEncryptionRecommendations] = useState<any[]>([])
const [encryptionLoading, setEncryptionLoading] = useState(false)
const [encryptionScanning, setEncryptionScanning] = useState(false)
const [encryptionCached, setEncryptionCached] = useState(false)
const [encryptionFilterSeverity, setEncryptionFilterSeverity] = useState<string>("all")
const [encryptionSearchQuery, setEncryptionSearchQuery] = useState("")
const [encryptionStatus, setEncryptionStatus] = useState("")
const [selectedResource, setSelectedResource] = useState<any>(null)
const [showActionModal, setShowActionModal] = useState(false)
const [actionInProgress, setActionInProgress] = useState(false)
const [actionResult, setActionResult] = useState<any>(null)
  
// Load security groups when account changes
useEffect(() => {
  if (accountId && selectedMenu === "security-groups") {
    loadSecurityGroups()
  }
}, [accountId, selectedMenu])

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

  // Load cached IAM findings (GET request) - NO AWS CALL
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
        setAiRecommendations(data.ai_recommendations)
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
        setAiRecommendations(data.ai_recommendations)
        setReportSummary(data.report_summary)
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

  // Clear cached IAM findings (DELETE request)
  const clearIamFindings = async () => {
    if (!accountId) return
    
    if (!window.confirm('⚠️ Are you sure you want to clear all IAM findings? This will remove cached data and you will need to scan again.')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/iam/clear/${accountId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setIamFindings([])
        setIamSummary({ critical: 0, high: 0, medium: 0, low: 0, total: 0 })
        setAiRecommendations(null)
      }
    } catch (error) {
      console.error('Error clearing IAM findings:', error)
    }
  }

  // Load encryption data when account changes or menu selects encryption
useEffect(() => {
  if (accountId && selectedMenu === "encryption") {
    loadEncryptionSummary()
    loadEncryptionFindings()
    loadEncryptionRecommendations()
  }
}, [accountId, selectedMenu, encryptionFilterSeverity])

  // ============================================================
  // PUBLIC EXPOSURE FUNCTIONS
  // ============================================================

  // Load cached exposure findings (GET request)
  const loadExposureFindings = async () => {
    if (!accountId) return
    
    setExposureScanning(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/exposure/findings/${accountId}/`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setExposureFindings(data.findings || [])
        setExposureAiAnalysis(data.ai_analysis)
        setExposureReportSummary(data.report_summary)
        setExposureSummary({
          critical: data.critical || 0,
          high: data.high || 0,
          medium: data.medium || 0,
          low: data.low || 0,
          total: data.total_findings || 0
        })
      }
    } catch (error) {
      console.error('Error loading exposure findings:', error)
    } finally {
      setExposureScanning(false)
    }
  }

  // ============================================================
// ENCRYPTION CHECKER FUNCTIONS
// ============================================================

// Load encryption summary
const loadEncryptionSummary = async () => {
  if (!accountId) return
  
  setEncryptionLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/encryption/summary/${accountId}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to load encryption summary')
    
    const data = await response.json()
    
    if (data.success) {
      setEncryptionSummary(data.summary)
      setEncryptionCached(data.cached || false)
    }
  } catch (error: any) {
    console.error('Error loading encryption summary:', error)
  } finally {
    setEncryptionLoading(false)
  }
}

// Load encryption findings
const loadEncryptionFindings = async () => {
  if (!accountId) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/encryption/findings/${accountId}/?severity=${encryptionFilterSeverity}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to load encryption findings')
    
    const data = await response.json()
    
    if (data.success) {
      setEncryptionFindings(data.findings || [])
    }
  } catch (error: any) {
    console.error('Error loading encryption findings:', error)
  }
}

// Load encryption recommendations (AI)
const loadEncryptionRecommendations = async () => {
  if (!accountId) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/encryption/recommendations/list/${accountId}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to load encryption recommendations')
    
    const data = await response.json()
    
    if (data.success) {
      setEncryptionRecommendations(data.recommendations || [])
    }
  } catch (error: any) {
    console.error('Error loading encryption recommendations:', error)
  }
}

// Scan encryption status
const scanEncryptionStatus = async (forceRefresh = false) => {
  if (!accountId) {
    setEncryptionStatus("❌ Please select an AWS account first")
    return
  }
  
  setEncryptionScanning(true)
  setEncryptionStatus(forceRefresh ? "🔄 Scanning encryption status..." : "📦 Loading cached results...")
  
  try {
    const url = `${API_BASE_URL}/api/security/encryption/scan/${accountId}/?force_refresh=${forceRefresh}`
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to scan encryption status')
    
    const data = await response.json()
    
    if (data.success) {
      setEncryptionSummary({
        total_resources: data.total_resources,
        encrypted_resources: data.encrypted_resources,
        unencrypted_resources: data.unencrypted_resources,
        encryption_coverage: data.encryption_coverage,
        critical_count: data.critical_count,
        high_count: data.high_count,
        medium_count: data.medium_count,
        low_count: data.low_count
      })
      setEncryptionCached(data.cached || false)
      setEncryptionStatus(`✅ Scan complete - ${data.encryption_coverage}% encryption coverage`)
      
      // Refresh findings and recommendations
      await loadEncryptionFindings()
      await loadEncryptionRecommendations()
    } else if (data.error) {
      throw new Error(data.error)
    }
  } catch (error: any) {
    console.error('Scan error:', error)
    setEncryptionStatus(`❌ ${error.message}`)
  } finally {
    setEncryptionScanning(false)
    setTimeout(() => setEncryptionStatus(''), 4000)
  }
}

// Generate AI recommendations
const generateEncryptionRecommendations = async () => {
  if (!accountId) return
  
  setEncryptionStatus("🤖 Generating AI recommendations...")
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/encryption/recommendations/generate/${accountId}/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to generate recommendations')
    
    const data = await response.json()
    
    if (data.success) {
      await loadEncryptionRecommendations()
      setEncryptionStatus(`✅ Generated ${data.recommendations_count} AI recommendations`)
    }
  } catch (error: any) {
    console.error('Error generating recommendations:', error)
    setEncryptionStatus(`❌ ${error.message}`)
  } finally {
    setTimeout(() => setEncryptionStatus(''), 3000)
  }
}

// Execute one-click encryption action
const executeEncryptionAction = async (resource: any) => {
  setActionInProgress(true)
  setActionResult(null)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/encryption/action/create/${accountId}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        resource_type: resource.resource_type,
        resource_id: resource.resource_id,
        resource_name: resource.resource_name,
        region: resource.region,
        action_type: resource.one_click_action_type || 'enable_bucket_encryption',
        action_params: {
          kms_key_id: resource.recommended_kms_key || null
        }
      })
    })
    
    if (!response.ok) throw new Error('Failed to start encryption action')
    
    const data = await response.json()
    
    if (data.success) {
      setActionResult({
        success: true,
        message: data.message || 'Encryption action started successfully',
        action_id: data.action_id,
        requires_migration: data.requires_migration || false,
        migration_steps: data.migration_steps || []
      })
      
      // Refresh findings after a delay
      setTimeout(() => {
        loadEncryptionFindings()
        loadEncryptionSummary()
      }, 5000)
    } else {
      throw new Error(data.error || 'Action failed')
    }
  } catch (error: any) {
    setActionResult({
      success: false,
      message: error.message
    })
  } finally {
    setActionInProgress(false)
  }
}

// Clear encryption cache
const clearEncryptionCache = async () => {
  if (!accountId) return
  
  if (!window.confirm('⚠️ Are you sure you want to clear all encryption cache? You will need to scan again.')) return
  
  setEncryptionStatus('🗑️ Clearing cache...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/encryption/clear/${accountId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to clear cache')
    
    const data = await response.json()
    setEncryptionSummary(null)
    setEncryptionFindings([])
    setEncryptionRecommendations([])
    setEncryptionStatus(`✅ ${data.message}`)
  } catch (error: any) {
    setEncryptionStatus(`❌ ${error.message}`)
  } finally {
    setTimeout(() => setEncryptionStatus(''), 3000)
  }
}

// Helper functions for encryption
const getEncryptionSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 dark:bg-red-950/30 text-red-700 border-red-500'
    case 'HIGH': return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 border-orange-500'
    case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 border-yellow-500'
    case 'LOW': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 border-blue-500'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700'
  }
}

const getEncryptionScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getResourceIcon = (resourceType: string) => {
  const icons: Record<string, React.ReactNode> = {
    'ec2_volume': <HardDrive className="w-5 h-5" />,
    'ebs_snapshot': <Copy className="w-5 h-5" />,
    'rds': <Database className="w-5 h-5" />,
    's3_bucket': <HardDrive className="w-5 h-5" />,
    'dynamodb_table': <Database className="w-5 h-5" />,
    'lambda_function': <Zap className="w-5 h-5" />,
    'sqs_queue': <MessageSquare className="w-5 h-5" />,
    'sns_topic': <Bell className="w-5 h-5" />,
    'efs_filesystem': <Server className="w-5 h-5" />,
    'elasticache_cluster': <Zap className="w-5 h-5" />,
    'secretsmanager_secret': <Key className="w-5 h-5" />,
  }
  return icons[resourceType] || <Shield className="w-5 h-5" />
}

const filteredEncryptionFindings = () => {
  let findings = [...encryptionFindings]
  
  if (encryptionFilterSeverity !== "all") {
    findings = findings.filter(f => f.severity === encryptionFilterSeverity)
  }
  
  if (encryptionSearchQuery) {
    const query = encryptionSearchQuery.toLowerCase()
    findings = findings.filter(f => 
      f.resource_name.toLowerCase().includes(query) ||
      f.resource_id.toLowerCase().includes(query) ||
      f.resource_type_display.toLowerCase().includes(query)
    )
  }
  
  return findings
}

const getResourceRecommendation = (resourceId: string) => {
  return encryptionRecommendations.find(r => r.resource_id === resourceId)
}
  // Scan public exposures (POST request)

  // ============================================================
// SECURITY GROUP ANALYZER FUNCTIONS
// ============================================================

// Load cached security groups
const loadSecurityGroups = async () => {
  if (!accountId) return
  
  setSgLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/security-groups/list/${accountId}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to load security groups')
    
    const data = await response.json()
    
    if (data.success) {
      setSecurityGroups(data.results || [])
      setSgCached(data.cached || false)
    }
  } catch (error: any) {
    console.error('Error loading:', error)
  } finally {
    setSgLoading(false)
  }
}

// Scan security groups
const scanSecurityGroups = async (forceRefresh = false) => {
  if (!accountId) {
    setSgStatus("❌ Please select an AWS account first")
    return
  }
  
  setSgScanning(true)
  setSgStatus(forceRefresh ? "🔄 Scanning security groups..." : "📦 Loading cached results...")
  
  try {
    const url = `${API_BASE_URL}/api/security/security-groups/scan/${accountId}/?force_refresh=${forceRefresh}`
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to scan security groups')
    
    const data = await response.json()
    
    if (data.success) {
      setSecurityGroups(data.results || [])
      setSgCached(data.cached || false)
      setSgStatus(`✅ Found ${data.total_security_groups} security groups`)
    } else if (data.error) {
      throw new Error(data.error)
    }
  } catch (error: any) {
    console.error('Scan error:', error)
    setSgStatus(`❌ ${error.message}`)
  } finally {
    setSgScanning(false)
    setTimeout(() => setSgStatus(''), 4000)
  }
}

// Load security group detail
const loadSecurityGroupDetail = async (sgId: string) => {
  if (!accountId) return
  
  setSgLoading(true)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/security-groups/detail/${accountId}/${sgId}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to load security group detail')
    
    const data = await response.json()
    
    if (data.success) {
      setSelectedSecurityGroup(data.analysis)
    }
  } catch (error: any) {
    console.error('Error loading detail:', error)
  } finally {
    setSgLoading(false)
  }
}

// Clear security group cache
const clearSecurityGroupsCache = async () => {
  if (!accountId) return
  
  if (!window.confirm('⚠️ Are you sure you want to clear all security group cache? You will need to scan again.')) return
  
  setSgStatus('🗑️ Clearing cache...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/security-groups/clear/${accountId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to clear cache')
    
    const data = await response.json()
    setSecurityGroups([])
    setSelectedSecurityGroup(null)
    setSgStatus(`✅ ${data.message}`)
  } catch (error: any) {
    setSgStatus(`❌ ${error.message}`)
  } finally {
    setTimeout(() => setSgStatus(''), 3000)
  }
}

// Helper functions for security groups
const getSgSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 dark:bg-red-950/30 text-red-700'
    case 'HIGH': return 'bg-orange-100 dark:bg-orange-950/30 text-orange-700'
    case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700'
    case 'LOW': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700'
  }
}

const getSgHealthScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getSgHealthScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-100 dark:bg-green-950/30'
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-950/30'
  if (score >= 40) return 'bg-orange-100 dark:bg-orange-950/30'
  return 'bg-red-100 dark:bg-red-950/30'
}

const filteredSecurityGroups = () => {
  let groups = [...securityGroups]
  
  if (sgSeverityFilter !== "all") {
    groups = groups.filter(g => g.overall_severity === sgSeverityFilter)
  }
  
  if (sgSearchQuery) {
    const query = sgSearchQuery.toLowerCase()
    groups = groups.filter(g => 
      g.sg_name.toLowerCase().includes(query) ||
      g.sg_id.toLowerCase().includes(query)
    )
  }
  
  return groups
}

const securityGroupsStats = {
  total: securityGroups.length,
  critical: securityGroups.filter(g => g.overall_severity === 'CRITICAL').length,
  high: securityGroups.filter(g => g.overall_severity === 'HIGH').length,
  medium: securityGroups.filter(g => g.overall_severity === 'MEDIUM').length,
  low: securityGroups.filter(g => g.overall_severity === 'LOW').length,
  orphaned: securityGroups.filter(g => g.is_orphaned).length,
  duplicate: securityGroups.filter(g => g.is_duplicate).length,
  avgHealth: securityGroups.length > 0 
    ? Math.round(securityGroups.reduce((sum, g) => sum + g.health_score, 0) / securityGroups.length)
    : 0
}


  const scanPublicExposures = async (forceRefresh = false) => {
    if (!accountId) return
    
    setExposureScanning(true)
    try {
      const url = forceRefresh 
        ? `${API_BASE_URL}/api/security/exposure/scan/${accountId}/?force_refresh=true`
        : `${API_BASE_URL}/api/security/exposure/scan/${accountId}/`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setExposureFindings(data.findings || [])
        setExposureAiAnalysis(data.ai_analysis)
        setExposureReportSummary(data.report_summary)
        setExposureCached(data.cached || false)
        
        const critical = data.findings?.filter((f: any) => f.severity === 'CRITICAL').length || 0
        const high = data.findings?.filter((f: any) => f.severity === 'HIGH').length || 0
        const medium = data.findings?.filter((f: any) => f.severity === 'MEDIUM').length || 0
        const low = data.findings?.filter((f: any) => f.severity === 'LOW').length || 0
        
        setExposureSummary({ critical, high, medium, low, total: data.total_findings || 0 })
      }
    } catch (error) {
      console.error('Error scanning exposures:', error)
    } finally {
      setExposureScanning(false)
    }
  }

  // Clear cached exposure findings
  const clearExposureFindings = async () => {
    if (!accountId) return
    
    if (!window.confirm('⚠️ Are you sure you want to clear all public exposure findings? This will remove cached data and you will need to scan again.')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/exposure/clear/${accountId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        setExposureFindings([])
        setExposureSummary({ critical: 0, high: 0, medium: 0, low: 0, total: 0 })
        setExposureAiAnalysis(null)
      }
    } catch (error) {
      console.error('Error clearing exposure findings:', error)
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

  // Load Exposure findings when account changes or menu selects public-exposure
  useEffect(() => {
    if (accountId && selectedMenu === "public-exposure") {
      loadExposureFindings()
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
  // HELPER FUNCTIONS
  // ============================================================

  const getExposureIcon = (exposureType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'public_ec2': <Cpu className="w-5 h-5" />,
      'open_sg_rule': <Shield className="w-5 h-5" />,
      'public_rds': <Database className="w-5 h-5" />,
      'public_s3': <HardDrive className="w-5 h-5" />,
      'public_lb': <Network className="w-5 h-5" />,
      'public_eks': <Container className="w-5 h-5" />,
      'public_redis': <Zap className="w-5 h-5" />,
      'public_opensearch': <Search className="w-5 h-5" />,
      'public_api': <Cloud className="w-5 h-5" />,
      'missing_waf': <Shield className="w-5 h-5" />,
    }
    return icons[exposureType] || <Globe className="w-5 h-5" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 dark:bg-red-900/30 text-red-700 border-l-red-500'
      case 'HIGH': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 border-l-orange-500'
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 border-l-yellow-500'
      case 'LOW': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 border-l-blue-500'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 border-l-gray-500'
    }
  }

  const getExposureRiskExplanation = (finding: PublicExposureFinding): string => {
    switch (finding.exposure_type) {
      case 'public_ec2':
        return `This EC2 instance is directly accessible from the internet via ${finding.public_ip || 'a public IP'}. Attackers can scan for this instance and attempt to exploit any open ports or vulnerabilities. Without proper security group restrictions, this significantly increases the risk of unauthorized access, data breach, or using your instance for malicious activities like crypto mining or DDoS attacks.`
      case 'open_sg_rule':
        return `This security group allows traffic from anywhere on the internet (0.0.0.0/0). If port ${finding.port} is open, anyone can attempt to connect. For SSH (port 22) or RDP (port 3389), this enables brute-force password attacks. For databases like MySQL (3306) or PostgreSQL (5432), this exposes your data directly to the internet, which is extremely dangerous.`
      case 'public_rds':
        return `Your RDS database is publicly accessible and exposed on port ${finding.port}. Databases should never be directly exposed to the internet. Attackers actively scan for exposed databases to steal data, deploy ransomware, or use them as jump hosts. This is one of the most critical security risks.`
      case 'public_s3':
        return `This S3 bucket allows public access. Anyone with the bucket URL can ${finding.details?.public_details?.includes('write') ? 'write to, delete, or modify' : 'read'} your data. This has led to countless data breaches exposing millions of customer records, credentials, and sensitive documents.`
      case 'public_lb':
        return `This load balancer is internet-facing and accessible from anywhere. Without WAF protection, it is vulnerable to DDoS attacks, SQL injection, cross-site scripting (XSS), and other web application attacks.`
      case 'public_eks':
        return `Your Kubernetes API server is exposed to the internet. This is extremely dangerous as attackers can attempt to compromise your cluster, deploy malicious containers, or steal credentials.`
      case 'public_redis':
        return `Redis has no built-in authentication. Exposing it to the internet makes it an easy target for attackers who can steal cached data, inject malicious data, or use it for DDoS amplification attacks.`
      case 'public_opensearch':
        return `Your OpenSearch/Elasticsearch domain is publicly accessible. This exposes all your indexed data - which often includes logs, metrics, and sometimes sensitive information - to anyone on the internet.`
      case 'public_api':
        return `This API Gateway has no authentication configured. Anyone can invoke your API endpoints without credentials, leading to potential data exposure, quota exhaustion, or abuse of your backend services.`
      case 'missing_waf':
        return `This public resource lacks Web Application Firewall (WAF) protection. Without WAF, you are vulnerable to common web exploits like SQL injection, cross-site scripting (XSS), and automated attacks.`
      default:
        return finding.description
    }
  }

  const getExposureQuickFix = (finding: PublicExposureFinding): string => {
    switch (finding.exposure_type) {
      case 'public_ec2':
        return `1. Remove the public IP or Elastic IP\n2. Update security group to restrict access to specific IPs (not 0.0.0.0/0)\n3. Use a NAT gateway for outbound internet access\n4. Consider using AWS Systems Manager Session Manager for secure SSH-less access`
      case 'open_sg_rule':
        return `1. Edit security group inbound rules\n2. Change the source from 0.0.0.0/0 to your specific IP range or another security group\n3. Remove any rules that aren't strictly necessary\n4. For web servers, consider using a WAF or CloudFront`
      case 'public_rds':
        return `1. Modify the RDS instance and set "Publicly accessible" to "No"\n2. Move the database to a private subnet\n3. Access it via a bastion host or VPC peering\n4. Use AWS Secrets Manager for credential management`
      case 'public_s3':
        return `1. Go to S3 bucket permissions\n2. Click "Block all public access"\n3. Review and remove any public bucket policies\n4. Remove public ACL grants\n5. Use pre-signed URLs for temporary access when needed`
      case 'public_lb':
        return `1. Change the load balancer scheme from "internet-facing" to "internal" if possible\n2. If it must be public, attach an AWS WAF Web ACL\n3. Implement strict security group rules\n4. Enable AWS Shield Advanced for DDoS protection`
      case 'public_eks':
        return `1. Disable public endpoint access\n2. Enable private endpoint access only\n3. Use VPC endpoints for cluster access\n4. Implement strict IAM roles for Kubernetes RBAC`
      case 'public_redis':
        return `1. Move Redis to a private subnet\n2. Disable public accessibility\n3. Enable Redis AUTH if available\n4. Use VPC peering or VPN for access\n5. Enable encryption at rest and in transit`
      case 'public_opensearch':
        return `1. Move domain to a VPC\n2. Disable public access\n3. Implement fine-grained access control\n4. Enable encryption\n5. Use IP-based restrictions if public access is absolutely required`
      case 'public_api':
        return `1. Add an authorizer (Cognito, IAM, or custom Lambda)\n2. Enable API keys for usage plans\n3. Implement rate limiting\n4. Attach WAF to the API stage`
      case 'missing_waf':
        return `1. Create a WAF Web ACL\n2. Add rules for common threats (SQL injection, XSS, etc.)\n3. Attach the WAF to your load balancer or API Gateway\n4. Consider AWS Managed Rules for broader protection`
      default:
        return finding.recommendation
    }
  }

  const filteredExposureFindings = () => {
    let findings = [...exposureFindings]
    
    if (filterSeverity !== "all") {
      findings = findings.filter(f => f.severity === filterSeverity)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      findings = findings.filter(f => 
        f.title.toLowerCase().includes(query) ||
        f.resource_name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
      )
    }
    
    return findings
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
              Results from cache. Click "Scan IAM" for fresh data.
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
            <div className="mb-6 mt-6">
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

  // 3. PUBLIC EXPOSURE DETECTION - COMPLETE IMPLEMENTATION
  const renderPublicExposure = () => {
    const filteredFindings = filteredExposureFindings()
    const stats = exposureSummary

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Public Exposure Detection</h3>
              <p className="text-sm text-muted-foreground">
                Detect EC2, RDS, S3, Load Balancers, EKS, Redis, OpenSearch, API Gateways, and open security groups exposed to the internet
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearExposureFindings}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache
              </button>
              <button
                onClick={() => scanPublicExposures(false)}
                disabled={exposureScanning}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
              >
                <Database className="w-4 h-4" />
                Load Cached
              </button>
              <button
                onClick={() => scanPublicExposures(true)}
                disabled={exposureScanning}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                {exposureScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {exposureScanning ? 'Scanning...' : 'Scan Now'}
              </button>
            </div>
          </div>

          {exposureCached && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700">
              <Database className="w-4 h-4 inline mr-2" />
              Results from cache. Click "Scan Now" for fresh AWS data.
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.low}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Exposures</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <div className="flex gap-2">
              {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filterSeverity === sev
                      ? sev === "CRITICAL" ? "bg-red-500 text-white" :
                        sev === "HIGH" ? "bg-orange-500 text-white" :
                        sev === "MEDIUM" ? "bg-yellow-500 text-white" :
                        sev === "LOW" ? "bg-blue-500 text-white" :
                        "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sev === "all" ? "All" : sev}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search exposures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
          </div>

          {/* Findings List */}
          {exposureScanning && exposureFindings.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-foreground font-medium">Scanning for public exposures...</p>
              <p className="text-sm text-muted-foreground mt-1">Checking EC2, RDS, S3, Load Balancers, EKS, and more</p>
            </div>
          ) : filteredFindings.length === 0 && exposureFindings.length > 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold">No matching exposures</h4>
              <p className="text-muted-foreground">Try changing your filter or search query</p>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold">No Public Exposures Found!</h4>
              <p className="text-muted-foreground">Your AWS resources are not publicly exposed. Great security practice! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  className={`rounded-lg border-l-4 overflow-hidden ${
                    finding.severity === "CRITICAL" ? "border-l-red-500 bg-red-50/30 dark:bg-red-950/10" :
                    finding.severity === "HIGH" ? "border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/10" :
                    finding.severity === "MEDIUM" ? "border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-950/10" :
                    "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          finding.severity === "CRITICAL" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                          finding.severity === "HIGH" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" :
                          finding.severity === "MEDIUM" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" :
                          "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                        }`}>
                          {getExposureIcon(finding.exposure_type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-foreground">{finding.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              finding.severity === "CRITICAL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                              finding.severity === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                              finding.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                              {finding.severity}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {finding.exposure_type_display}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{finding.description}</p>
                          
                          {/* Resource Details Tags */}
                          <div className="flex flex-wrap gap-2 text-xs mb-3">
                            <span className="bg-muted px-2 py-1 rounded">
                              📍 {finding.region || 'N/A'}
                            </span>
                            <span className="bg-muted px-2 py-1 rounded font-mono">
                              🆔 {finding.resource_id || finding.resource_name}
                            </span>
                            {finding.public_ip && (
                              <span className="bg-muted px-2 py-1 rounded font-mono">
                                🌐 IP: {finding.public_ip}
                              </span>
                            )}
                            {finding.port && (
                              <span className="bg-muted px-2 py-1 rounded">
                                🔌 Port: {finding.port}
                              </span>
                            )}
                            {finding.cidr && (
                              <span className="bg-muted px-2 py-1 rounded font-mono">
                                📡 CIDR: {finding.cidr}
                              </span>
                            )}
                            {finding.security_group_name && (
                              <span className="bg-muted px-2 py-1 rounded">
                                🔒 SG: {finding.security_group_name}
                              </span>
                            )}
                          </div>
                          
                          {/* Expandable Risk Explanation */}
                          <button
                            onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {expandedFinding === finding.id ? (
                              <>Show Less <ChevronUp className="w-4 h-4" /></>
                            ) : (
                              <>Why is this dangerous? <ChevronDown className="w-4 h-4" /></>
                            )}
                          </button>
                          
                          {expandedFinding === finding.id && (
                            <div className="mt-3 space-y-3">
                              {/* Risk Explanation */}
                              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">🚨 RISK EXPLANATION</p>
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                      {getExposureRiskExplanation(finding)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Quick Fix Steps */}
                              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-2">
                                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">🔧 HOW TO FIX (Quick Steps)</p>
                                    <div className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                                      {getExposureQuickFix(finding)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        {new Date(finding.detected_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Risk Analysis Section */}
        {exposureAiAnalysis && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">🤖 AI Risk Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent security recommendations based on your public exposures
                </p>
              </div>
              {exposureReportSummary?.generated_at && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Generated: {new Date(exposureReportSummary.generated_at).toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {exposureAiAnalysis.split('\n').map((line, idx) => {
                if (line.trim().startsWith('## ')) {
                  const isCritical = line.includes('CRITICAL') || line.includes('🔴')
                  const bgClass = isCritical ? "border-l-4 border-red-500 pl-3" : "border-l-4 border-purple-500 pl-3"
                  return (
                    <h3 key={idx} className={`font-bold mt-4 mb-2 text-foreground text-lg ${bgClass}`}>
                      {line.replace('## ', '')}
                    </h3>
                  )
                } else if (line.trim().startsWith('### ')) {
                  return (
                    <h4 key={idx} className="font-semibold mt-3 mb-1 text-foreground">
                      {line.replace('### ', '')}
                    </h4>
                  )
                } else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                  return (
                    <li key={idx} className="ml-4 mb-1 text-foreground/90">
                      {line.trim().substring(2)}
                    </li>
                  )
                } else if (line.trim().match(/^\d+\./)) {
                  return (
                    <li key={idx} className="ml-4 mb-1 text-foreground/90 list-decimal">
                      {line.trim().replace(/^\d+\.\s*/, '')}
                    </li>
                  )
                } else if (line.trim() === '') {
                  return <br key={idx} />
                } else if (line.includes('**')) {
                  return (
                    <p key={idx} className="font-semibold mt-2 mb-1 text-foreground">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  )
                } else {
                  return (
                    <p key={idx} className="mb-2 text-foreground/90">
                      {line}
                    </p>
                  )
                }
              })}
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(exposureAiAnalysis)
                // Show toast or status message
              }}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Copy className="w-4 h-4" />
              Copy Analysis
            </button>
          </Card>
        )}
      </div>
    )
  }

  // Placeholder render functions for other sections
// 4. SECURITY GROUP ANALYZER - RENDER FUNCTION
const renderSecurityGroups = () => {
  // If detail view is selected
  if (selectedSecurityGroup) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => setSelectedSecurityGroup(null)}
              className="text-sm text-primary hover:underline mb-2 flex items-center gap-1"
            >
              ← Back to Security Groups
            </button>
            <h2 className="text-2xl font-bold text-foreground">{selectedSecurityGroup.sg_name}</h2>
            <p className="text-sm text-muted-foreground font-mono">{selectedSecurityGroup.sg_id}</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedSecurityGroup.sg_description || "No description"}</p>
          </div>
          <div className="text-right">
            <div className={`w-20 h-20 rounded-full ${getSgHealthScoreBg(selectedSecurityGroup.health_score)} flex items-center justify-center mb-2 mx-auto`}>
              <span className={`text-3xl font-bold ${getSgHealthScoreColor(selectedSecurityGroup.health_score)}`}>{selectedSecurityGroup.health_score}</span>
            </div>
            <p className="text-xs text-muted-foreground">Health Score</p>
            <p className="text-xs text-muted-foreground mt-1">Risk: {selectedSecurityGroup.risk_score}</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 border-b flex-wrap">
          {[
            { id: "overview", label: "Overview", icon: <Shield className="w-4 h-4" /> },
            { id: "risks", label: "Risk Findings", icon: <AlertTriangle className="w-4 h-4" />, count: selectedSecurityGroup.risk_findings?.length || 0 },
            { id: "resources", label: "Attached Resources", icon: <Server className="w-4 h-4" />, count: selectedSecurityGroup.attached_resources?.length || 0 },
            { id: "traffic", label: "Traffic Insights", icon: <Activity className="w-4 h-4" /> },
            { id: "changes", label: "Change History", icon: <Clock className="w-4 h-4" />, count: selectedSecurityGroup.change_history?.length || 0 },
            { id: "ai", label: "AI Recommendations", icon: <Brain className="w-4 h-4" /> }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setSgExpandedSection(section.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                sgExpandedSection === section.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {section.icon}
              {section.label}
              {section.count !== undefined && section.count > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{section.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {sgExpandedSection === "overview" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSgSeverityColor(selectedSecurityGroup.overall_severity)}`}>
                Overall: {selectedSecurityGroup.overall_severity}
              </span>
              {selectedSecurityGroup.unrestricted_inbound && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-950/30 text-red-700">
                  🚨 Unrestricted Inbound
                </span>
              )}
              {selectedSecurityGroup.unrestricted_outbound && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700">
                  ⚠️ Unrestricted Outbound
                </span>
              )}
              {selectedSecurityGroup.is_orphaned && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600">
                  🗑️ Orphaned (No Resources)
                </span>
              )}
              {selectedSecurityGroup.is_duplicate && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-950/30 text-purple-700">
                  🔄 Duplicate Configuration
                </span>
              )}
            </div>

            {/* Exposed Ports */}
            {selectedSecurityGroup.exposed_ports?.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-red-500" />
                  Exposed Ports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSecurityGroup.exposed_ports.map((port: any, idx: number) => (
                    <div key={idx} className={`px-3 py-2 rounded-lg border ${
                      port.severity === 'CRITICAL' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                      port.severity === 'HIGH' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20' :
                      'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{port.port}</span>
                        <span className="text-sm">{port.service}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          port.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                          port.severity === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>{port.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Resource Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">VPC ID:</span><code className="font-mono">{selectedSecurityGroup.vpc_id}</code></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Region:</span><span>{selectedSecurityGroup.region}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Attached Resources:</span><span className="font-semibold">{selectedSecurityGroup.attached_resources?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Analyzed:</span><span>{new Date(selectedSecurityGroup.last_analyzed_at).toLocaleString()}</span></div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Open World Rules</h3>
                {selectedSecurityGroup.open_world_rules?.length === 0 ? (
                  <p className="text-sm text-green-600">✅ No open world rules (0.0.0.0/0)</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSecurityGroup.open_world_rules.slice(0, 5).map((rule: any, idx: number) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded">
                        <span className="font-mono">{rule.protocol}:{rule.from_port}-{rule.to_port}</span>
                        <span className="text-muted-foreground ml-2">from {rule.cidr}</span>
                        <span className="text-xs text-red-600 ml-2">⚠️ Open to internet</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Risk Findings Section */}
        {sgExpandedSection === "risks" && (
          <div className="space-y-4">
            {selectedSecurityGroup.risk_findings?.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">No Risk Findings!</h3>
                <p className="text-muted-foreground">This security group is well configured.</p>
              </Card>
            ) : (
              selectedSecurityGroup.risk_findings.map((finding: any, idx: number) => (
                <Card key={idx} className={`p-5 border-l-4 ${
                  finding.severity === 'CRITICAL' ? 'border-l-red-500' :
                  finding.severity === 'HIGH' ? 'border-l-orange-500' :
                  finding.severity === 'MEDIUM' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      finding.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' :
                      finding.severity === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      finding.severity === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${
                        finding.severity === 'CRITICAL' ? 'text-red-600' :
                        finding.severity === 'HIGH' ? 'text-orange-600' :
                        finding.severity === 'MEDIUM' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-foreground">{finding.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          finding.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          finding.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          finding.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{finding.severity}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{finding.description}</p>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm font-medium text-primary mb-1">🔧 Recommendation</p>
                        <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Attached Resources Section */}
        {sgExpandedSection === "resources" && (
          <div className="space-y-4">
            {selectedSecurityGroup.attached_resources?.length === 0 ? (
              <Card className="p-8 text-center">
                <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold">No Attached Resources</h3>
                <p className="text-muted-foreground">This security group is orphaned.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSecurityGroup.attached_resources.map((resource: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start gap-3">
                      {resource.resource_type === 'EC2' && <Cpu className="w-5 h-5 text-blue-500" />}
                      {resource.resource_type === 'Load Balancer' && <Network className="w-5 h-5 text-green-500" />}
                      {resource.resource_type === 'RDS' && <Database className="w-5 h-5 text-purple-500" />}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{resource.resource_name}</p>
                        <p className="text-xs text-muted-foreground">{resource.resource_type}</p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="text-muted-foreground">{resource.region}</span>
                          <span className={`px-1.5 py-0.5 rounded ${
                            resource.status === 'running' || resource.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>{resource.status}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Traffic Insights Section */}
        {sgExpandedSection === "traffic" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Most Used Ports
              </h3>
              <div className="space-y-3">
                {selectedSecurityGroup.traffic_insights?.most_used_ports?.map((port: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 font-mono font-bold">{port.port}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${port.percentage}%` }} />
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <span className="text-sm capitalize">{port.usage}</span>
                      {port.trend === 'increasing' && <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />}
                      {port.trend === 'decreasing' && <TrendingDown className="w-3 h-3 text-red-500 inline ml-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Inbound Traffic Trend</h3>
                <div className="flex items-end gap-1 h-32">
                  {selectedSecurityGroup.traffic_insights?.inbound_trend?.last_7_days?.map((value: number, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-primary/20 rounded-t" style={{ height: `${(value / 200) * 100}px` }}>
                        <div className="w-full bg-primary rounded-t" style={{ height: `${(value / 200) * 100}px` }} />
                      </div>
                      <span className="text-xs mt-1">Day {idx + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-center mt-3">
                  Trend: <span className={selectedSecurityGroup.traffic_insights?.inbound_trend?.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}>
                    {selectedSecurityGroup.traffic_insights?.inbound_trend?.trend} ({selectedSecurityGroup.traffic_insights?.inbound_trend?.percentage_change}%)
                  </span>
                </p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Top Source IPs</h3>
                <div className="space-y-2">
                  {selectedSecurityGroup.traffic_insights?.top_source_ips?.map((ip: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <code className="text-sm font-mono">{ip.ip_range}</code>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${ip.requests_percentage}%` }} />
                        </div>
                        <span className="text-xs w-12">{ip.requests_percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Change History Section */}
        {sgExpandedSection === "changes" && (
          <div className="space-y-3">
            {selectedSecurityGroup.change_history?.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold">No Change History</h3>
                <p className="text-muted-foreground">No changes recorded for this security group.</p>
              </Card>
            ) : (
              selectedSecurityGroup.change_history.map((change: any, idx: number) => (
                <Card key={idx} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {change.change_type === 'rule_added' && <Plus className="w-4 h-4 text-green-500" />}
                        {change.change_type === 'rule_removed' && <Minus className="w-4 h-4 text-red-500" />}
                        {change.change_type === 'rule_modified' && <RefreshCw className="w-4 h-4 text-yellow-500" />}
                        <span className="font-semibold text-foreground">{change.description}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By <span className="font-medium">{change.changed_by}</span> • {new Date(change.changed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* AI Recommendations Section */}
        {sgExpandedSection === "ai" && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">AI Security Recommendations</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {selectedSecurityGroup.ai_recommendation}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedSecurityGroup.ai_recommendation)
                setSgStatus('✅ Analysis copied to clipboard!')
                setTimeout(() => setSgStatus(''), 2000)
              }}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Copy className="w-4 h-4" />
              Copy Analysis
            </button>
          </Card>
        )}
      </div>
    )
  }

  // Main list view
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Security Group Analyzer</h3>
            <p className="text-sm text-muted-foreground">
              Deep analysis of security group rules, attached resources, traffic patterns, and AI-powered recommendations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearSecurityGroupsCache}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>
            <button
              onClick={() => scanSecurityGroups(false)}
              disabled={sgScanning}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
            >
              <Database className="w-4 h-4" />
              Load Cached
            </button>
            <button
              onClick={() => scanSecurityGroups(true)}
              disabled={sgScanning}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              {sgScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {sgScanning ? 'Scanning...' : 'Scan Security Groups'}
            </button>
          </div>
        </div>

        {sgCached && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700">
            <Database className="w-4 h-4 inline mr-2" />
            Results from cache. Click "Scan Security Groups" for fresh data.
          </div>
        )}

        {sgStatus && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
            {sgStatus}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <Card className="p-3 text-center"><Shield className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{securityGroupsStats.total}</p><p className="text-xs text-muted-foreground">Total Groups</p></Card>
          <Card className="p-3 text-center bg-red-50 dark:bg-red-950/20"><AlertTriangle className="w-5 h-5 mx-auto text-red-600 mb-1" /><p className="text-2xl font-bold text-red-600">{securityGroupsStats.critical}</p><p className="text-xs text-muted-foreground">Critical</p></Card>
          <Card className="p-3 text-center bg-orange-50 dark:bg-orange-950/20"><AlertTriangle className="w-5 h-5 mx-auto text-orange-600 mb-1" /><p className="text-2xl font-bold text-orange-600">{securityGroupsStats.high}</p><p className="text-xs text-muted-foreground">High</p></Card>
          <Card className="p-3 text-center bg-yellow-50 dark:bg-yellow-950/20"><AlertTriangle className="w-5 h-5 mx-auto text-yellow-600 mb-1" /><p className="text-2xl font-bold text-yellow-600">{securityGroupsStats.medium}</p><p className="text-xs text-muted-foreground">Medium</p></Card>
          <Card className="p-3 text-center bg-blue-50 dark:bg-blue-950/20"><Info className="w-5 h-5 mx-auto text-blue-600 mb-1" /><p className="text-2xl font-bold text-blue-600">{securityGroupsStats.low}</p><p className="text-xs text-muted-foreground">Low</p></Card>
          <Card className="p-3 text-center"><Link2 className="w-5 h-5 mx-auto text-purple-500 mb-1" /><p className="text-2xl font-bold">{securityGroupsStats.orphaned}</p><p className="text-xs text-muted-foreground">Orphaned</p></Card>
          <Card className="p-3 text-center bg-green-50 dark:bg-green-950/20"><div className={`w-10 h-10 rounded-full ${getSgHealthScoreBg(securityGroupsStats.avgHealth)} flex items-center justify-center mx-auto mb-1`}><span className={`text-lg font-bold ${getSgHealthScoreColor(securityGroupsStats.avgHealth)}`}>{securityGroupsStats.avgHealth}</span></div><p className="text-xs text-muted-foreground">Avg Health</p></Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button key={sev} onClick={() => setSgSeverityFilter(sev)} className={`px-3 py-1 text-sm rounded-full transition-colors ${sgSeverityFilter === sev ? sev === "CRITICAL" ? "bg-red-500 text-white" : sev === "HIGH" ? "bg-orange-500 text-white" : sev === "MEDIUM" ? "bg-yellow-500 text-white" : sev === "LOW" ? "bg-blue-500 text-white" : "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{sev === "all" ? "All" : sev}</button>
            ))}
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="Search security groups..." value={sgSearchQuery} onChange={(e) => setSgSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64" /></div>
        </div>

        {/* Security Groups List */}
        {sgLoading && securityGroups.length === 0 ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredSecurityGroups().length === 0 ? (
          <Card className="p-12 text-center"><Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" /><h3 className="text-xl font-semibold text-foreground mb-2">No Security Groups Found</h3><p className="text-muted-foreground">{sgSearchQuery || sgSeverityFilter !== "all" ? "Try adjusting your filters" : "Click 'Scan Security Groups' to analyze"}</p></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSecurityGroups().map((sg) => (
              <Card key={sg.sg_id} className="p-5 hover:shadow-lg transition-all cursor-pointer border-l-4" style={{ borderLeftColor: sg.overall_severity === 'CRITICAL' ? '#ef4444' : sg.overall_severity === 'HIGH' ? '#f97316' : sg.overall_severity === 'MEDIUM' ? '#eab308' : '#3b82f6' }} onClick={() => loadSecurityGroupDetail(sg.sg_id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap"><h4 className="font-semibold text-foreground text-lg">{sg.sg_name}</h4><span className={`text-xs px-2 py-0.5 rounded-full ${getSgSeverityColor(sg.overall_severity)}`}>{sg.overall_severity}</span>{sg.is_orphaned && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">🗑️ Orphaned</span>}{sg.is_duplicate && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-600">🔄 Duplicate</span>}</div>
                    <p className="text-sm text-muted-foreground font-mono mb-3">{sg.sg_id}</p>
                    <div className="flex flex-wrap gap-4 text-sm"><div className="flex items-center gap-1 text-muted-foreground"><Server className="w-4 h-4" /><span>{sg.attached_resources_count} resources</span></div><div className="flex items-center gap-1 text-muted-foreground"><AlertTriangle className="w-4 h-4" /><span>{sg.risk_findings_count} risks</span></div><div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" /><span>Analyzed: {new Date(sg.last_analyzed_at).toLocaleDateString()}</span></div></div>
                  </div>
                  <div className="text-right"><div className={`w-16 h-16 rounded-full ${getSgHealthScoreBg(sg.health_score)} flex items-center justify-center mb-2`}><span className={`text-2xl font-bold ${getSgHealthScoreColor(sg.health_score)}`}>{sg.health_score}</span></div><p className="text-xs text-muted-foreground">Health Score</p><ChevronRight className="w-5 h-5 text-muted-foreground mt-2 ml-auto" /></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
 
// 5. ENCRYPTION CHECKER - RENDER FUNCTION
const renderEncryption = () => {
  const stats = encryptionSummary || {
    total_resources: 0,
    encrypted_resources: 0,
    unencrypted_resources: 0,
    encryption_coverage: 0,
    critical_count: 0,
    high_count: 0,
    medium_count: 0,
    low_count: 0
  }

  const filteredFindings = filteredEncryptionFindings()

  // Action Modal Component
  const EncryptionActionModal = () => {
    if (!showActionModal || !selectedResource) return null
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Enable Encryption</h3>
            <button onClick={() => {
              setShowActionModal(false)
              setSelectedResource(null)
              setActionResult(null)
            }} className="p-1 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            {actionResult ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${actionResult.success ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' : 'bg-red-50 dark:bg-red-950/20 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {actionResult.success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                    <span className={actionResult.success ? 'text-green-700' : 'text-red-700'}>{actionResult.message}</span>
                  </div>
                </div>
                
                {actionResult.requires_migration && actionResult.migration_steps?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-foreground mb-2">Migration Steps Required:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {actionResult.migration_steps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowActionModal(false)
                    setSelectedResource(null)
                    setActionResult(null)
                  }}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {getResourceIcon(selectedResource.resource_type)}
                  <div>
                    <p className="font-medium text-foreground">{selectedResource.resource_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedResource.resource_type_display}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {selectedResource.fix_recommendation}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowActionModal(false)
                      setSelectedResource(null)
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeEncryptionAction(selectedResource)}
                    disabled={actionInProgress}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionInProgress ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enable Encryption'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Modal */}
      <EncryptionActionModal />

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Encryption Coverage Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Track encryption status across all AWS resources and get AI-powered recommendations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearEncryptionCache}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>
            <button
              onClick={() => scanEncryptionStatus(false)}
              disabled={encryptionScanning}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
            >
              <Database className="w-4 h-4" />
              Load Cached
            </button>
            <button
              onClick={() => scanEncryptionStatus(true)}
              disabled={encryptionScanning}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              {encryptionScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {encryptionScanning ? 'Scanning...' : 'Scan Encryption'}
            </button>
          </div>
        </div>

        {encryptionCached && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700">
            <Database className="w-4 h-4 inline mr-2" />
            Results from cache. Click "Scan Encryption" for fresh data.
          </div>
        )}

        {encryptionStatus && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
            {encryptionStatus}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <Card className="p-3 text-center">
            <Lock className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{stats.total_resources}</p>
            <p className="text-xs text-muted-foreground">Total Resources</p>
          </Card>
          <Card className="p-3 text-center bg-green-50 dark:bg-green-950/20">
            <Shield className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{stats.encrypted_resources}</p>
            <p className="text-xs text-muted-foreground">Encrypted</p>
          </Card>
          <Card className="p-3 text-center bg-red-50 dark:bg-red-950/20">
            <Unlock className="w-5 h-5 mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-600">{stats.unencrypted_resources}</p>
            <p className="text-xs text-muted-foreground">Unencrypted</p>
          </Card>
          <Card className="p-3 text-center bg-primary/10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${stats.encryption_coverage >= 80 ? 'bg-green-100' : stats.encryption_coverage >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <span className={`text-xl font-bold ${getEncryptionScoreColor(stats.encryption_coverage)}`}>{stats.encryption_coverage}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Coverage</p>
          </Card>
          <Card className="p-3 text-center bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="w-5 h-5 mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-600">{stats.critical_count}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </Card>
          <Card className="p-3 text-center bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="w-5 h-5 mx-auto text-orange-600 mb-1" />
            <p className="text-2xl font-bold text-orange-600">{stats.high_count}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </Card>
          <Card className="p-3 text-center">
            <Brain className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{encryptionRecommendations.length}</p>
            <p className="text-xs text-muted-foreground">AI Recs</p>
          </Card>
        </div>

        {/* Generate AI Recommendations Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={generateEncryptionRecommendations}
            disabled={encryptionFindings.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Recommendations
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => setEncryptionFilterSeverity(sev)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  encryptionFilterSeverity === sev
                    ? sev === "CRITICAL" ? "bg-red-500 text-white" :
                      sev === "HIGH" ? "bg-orange-500 text-white" :
                      sev === "MEDIUM" ? "bg-yellow-500 text-white" :
                      sev === "LOW" ? "bg-blue-500 text-white" :
                      "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {sev === "all" ? "All" : sev}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resources..."
              value={encryptionSearchQuery}
              onChange={(e) => setEncryptionSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
        </div>

        {/* Findings List */}
        {encryptionLoading && encryptionFindings.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredFindings.length === 0 && encryptionFindings.length > 0 ? (
          <Card className="p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No matching findings</h3>
            <p className="text-muted-foreground">Try changing your filter or search query</p>
          </Card>
        ) : filteredFindings.length === 0 ? (
          <Card className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Encryption Findings</h3>
            <p className="text-muted-foreground">
              {encryptionSummary?.total_resources === 0 
                ? "Click 'Scan Encryption' to analyze your resources" 
                : "All your resources are encrypted! Great security practice! 🎉"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFindings.map((finding) => {
              const recommendation = getResourceRecommendation(finding.resource_id)
              return (
                <Card key={finding.id} className={`p-5 border-l-4 ${getEncryptionSeverityColor(finding.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        finding.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' :
                        finding.severity === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        finding.severity === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {getResourceIcon(finding.resource_type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-foreground">{finding.resource_name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getEncryptionSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {finding.resource_type_display}
                          </span>
                          {finding.is_encrypted ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              🔒 Encrypted
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              🔓 Unencrypted
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{finding.business_risk}</p>
                        
                        {/* Resource Details */}
                        <div className="flex flex-wrap gap-2 text-xs mb-3">
                          <span className="bg-muted px-2 py-1 rounded font-mono">
                            🆔 {finding.resource_id}
                          </span>
                          {finding.region && (
                            <span className="bg-muted px-2 py-1 rounded">
                              📍 {finding.region}
                            </span>
                          )}
                          {finding.encryption_type && finding.encryption_type !== 'None' && (
                            <span className="bg-muted px-2 py-1 rounded">
                              🔐 {finding.encryption_type}
                            </span>
                          )}
                          {finding.kms_key_id && (
                            <span className="bg-muted px-2 py-1 rounded font-mono">
                              🔑 {finding.kms_key_id.split('/').pop()}
                            </span>
                          )}
                        </div>
                        
                        {/* AI Recommendation */}
                        {recommendation && (
                          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-start gap-2">
                              <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">🤖 AI Recommendation</p>
                                <p className="text-sm text-purple-700 dark:text-purple-400">{recommendation.recommendation_description}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                                  ⏱️ {recommendation.estimated_time} • {recommendation.difficulty} difficulty
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Fix Recommendation */}
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium text-primary mb-1">🔧 Fix Recommendation</p>
                          <p className="text-sm text-muted-foreground">{finding.fix_recommendation}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Difficulty: {finding.fix_difficulty} • Risk Score: {finding.risk_score}/100
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {!finding.is_encrypted && (
                      <button
                        onClick={() => {
                          setSelectedResource({
                            ...finding,
                            one_click_action_type: recommendation?.one_click_action_type,
                            recommended_kms_key: recommendation?.recommended_kms_key
                          })
                          setShowActionModal(true)
                        }}
                        className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Enable Encryption
                      </button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

  const renderCloudWatchLogs = () => <Card className="p-6"><p>CloudWatch & Logging Security - Coming Soon</p></Card>
  
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