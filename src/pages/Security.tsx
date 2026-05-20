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

  // Scan public exposures (POST request)
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