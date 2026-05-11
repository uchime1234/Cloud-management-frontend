"use client"
import React from "react"
import { useState, useEffect  } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
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

type MenuItem =
  | "overview"
  | "connect"
  | "services"
  | "forecast"
  | "resources"
  | "anomalies"
  | "idle"
  | "rightsizing"
  | "savings"
  | "storage"
  | "regions"
  | "tags"
  | "heatmap"
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
  service: string;
  amount: number;
  percentage: number;
  recommendation?: string;
  estimated_savings?: number;
}

type PaidResourceCategory = {
  name: string;
  description: string;
  cost_level: 'HIGH' | 'MEDIUM' | 'LOW';
  cost_driver: string;
  resources: any[];
  count: number;
  estimated_monthly_cost: number;
}

type PaidResourcesData = {
  cost_categories: {
    [key: string]: PaidResourceCategory;
  };
  summary: {
    total_paid_resources: number;
    high_cost_resources: number;
    medium_cost_resources: number;
    low_cost_resources: number;
    categories_found: number;
    timestamp: string;
  };
  raw_resources?: any;
  permissions_issues?: string[];
}

type CostAnalysisData = {
  high_risk_findings: Array<{
    category: string;
    issue: string;
    impact: string;
    recommendation: string;
    potential_savings: string;
  }>;
  medium_risk_findings: Array<{
    category: string;
    issue: string;
    impact: string;
    recommendation: string;
    potential_savings?: string;
  }>;
  low_risk_findings: Array<{
    category: string;
    issue: string;
    impact: string;
    recommendation: string;
    potential_savings?: string;
  }>;
  recommendations: string[];
  estimated_savings_potential: number;
  summary: {
    total_resources: number;
    high_cost_categories: number;
    medium_cost_categories: number;
    low_cost_categories: number;
  };
}
type ResourceData = {
  total_resources: number;
  total_monthly_cost?: number;  
  cached?: boolean;
  last_updated?: string;
  source?: string;
  permissions_issues?: string[];
  
  ec2: {
    total: number;
    running: number;
    stopped: number;
    avg_running_hours: number;
  };
  
  s3: {
    total_buckets: number;
    avg_age_days: number;
  };
  
  lambda: {
    total_functions: number;
  };
  
  rds: {
    total_instances: number;
  };
  
  eks?: {
    total: number;
  };
  
  elasticache?: {
    total: number;
  };
  
  dynamodb?: {
    total: number;
  };
  
  redshift?: {
    total: number;
  };
  
  cloudfront?: {
    total: number;
  };
  
  load_balancers?: {
    total: number;
  };
  
  api_gateway?: {
    total: number;
  };
  
  sqs?: {
    total: number;
  };
  
  sns?: {
    total: number;
  };
  
  efs?: {
    total: number;
  };
  
  ecr?: {
    total: number;
  };
  
  elastic_beanstalk?: {
    total: number;
  };
  
  secretsmanager?: {
    total: number;
  };
  
  logs?: {
    total: number;
  };
  
  ssm?: {
    total: number;
  };
  
  config?: {
    total: number;
  };
  
  codebuild?: {
    total: number;
  };
  
  workspaces?: {
    total: number;
  };
  
  kinesis?: {
    total: number;
  };
  
  ebs?: {
    total: number;
  };
  
  opensearch?: {
    total: number;
  };
  
  route53?: {
    total: number;
  };
}

type ProviderData = {
  total_spend: number;
  today_spend: number;
  current_month_spend: number;
  current_month_name: string;
  monthly_change: number;
  forecast: Forecast;
  daily_spend: DailySpend[];
  service_breakdown?: ServiceBreakdown[];
  cost_drivers?: any[];
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

// GitHub types
type GitHubRepo = {
  id: number;
  repo_id: number;
  repo_name: string;
  repo_full_name: string;
  repo_url: string;
  aws_account_id?: number;
  aws_account_name?: string;
  status: string;
  webhook_id?: number;
  last_sync_at?: string;
  connected_at: string;
}

type Deployment = {
  id: number;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  merged_by: string;
  merged_at: string;
  files_changed: string[];
  services_affected: string[];
  cost_impact?: number;
  is_correlated: boolean;
}

type ScanResult = {
  repo_id: number;
  repo_name: string;
  has_terraform: boolean;
  status: string;
  error?: string;
}

interface LowLevelServicePricing {
  price_per_hour?: number;
  price_per_gb_month?: number;
  price_per_million?: number;
  price_per_gb?: number;
  price_per_vcpu_hour?: number;
  price_per_month?: number;
  unit: string;
}

interface LowLevelService extends LowLevelServicePricing {
  id: string;
  name: string;
  description: string;
}

interface LowLevelServiceResource {
  service_id: string;
  resource_id: string;
  resource_name: string;
  count: number;
  region: string;
  estimated_monthly_cost: number;
  details: Record<string, any>;
}

interface LowLevelServiceCategoryData {
  service_info: LowLevelService;
  category: string;
  resources: LowLevelServiceResource[];
  total_count: number;
  total_monthly_cost: number;
}

interface LowLevelServicesData {
  services_by_category: Record<string, LowLevelServiceCategoryData>;
  all_resources: LowLevelServiceResource[];
  summary: {
    total_services: number;
    estimated_monthly_cost: number;
    unique_service_types: number;
    unique_services_discovered: number;
    regions_scanned: string[];
    timestamp: string;
    scan_duration?: number;
  };
  source?: string;
  cached?: boolean;
  error?: string;
}


// Add these type definitions for storage optimization
// Replace the StorageScanResult interface with this:
// Replace the StorageScanResult interface with this (around line 430)
interface StorageScanResult {
  success: boolean;
  cached?: boolean;  // Add this property
  total_findings: number;
  total_potential_savings: number;
  ebs_volumes: {
    total: number;
    unattached: number;
    unattached_volumes: Array<{
      volume_id: string;
      size_gb: number;
      volume_type: string;
      monthly_cost: number;
      region: string;
    }>;
    items: Array<{
      volume_id: string;
      size_gb: number;
      volume_type: string;
      state: string;
      is_attached: boolean;
      monthly_cost: number;
    }>;
  };
  rds_instances: {
    total: number;
    items: Array<{
      instance_id: string;
      engine: string;
      instance_class: string;
      storage_gb: number;
      status: string;
      is_idle: boolean;
    }>;
  };
  elastic_ips: {
    total: number;
    unused: number;
    items: Array<{
      public_ip: string;
      allocation_id: string;
      domain: string;
      is_associated: boolean;
    }>;
  };
  snapshots: {
    total: number;
    old: number;
    items: Array<{
      snapshot_id: string;
      volume_size: number;
      age_days: number;
      monthly_cost: number;
    }>;
  };
  idle_rds_instances: {
    count: number;
    items: Array<{
      instance_id: string;
      instance_class: string;
      avg_cpu: number;
      storage_gb: number;
      monthly_cost: number;
    }>;
  };
  unused_amis: {
    count: number;
    items: Array<{
      ami_id: string;
      name: string;
      age_days: number;
      volume_size_gb: number;
      monthly_cost: number;
    }>;
  };
  duplicate_snapshots: {
    count: number;
    items: Array<{
      volume_id: string;
      total_snapshots: number;
      redundant_count: number;
      redundant_snapshots: string[];
      total_size_gb: number;
      monthly_cost: number;
    }>;
  };
}

interface UnusedResourceItem {
  id: string;
  resource_type: string;
  resource_type_display: string;
  resource_id: string;
  resource_name: string;
  region: string;
  size_gb: number | null;
  estimated_monthly_cost: number;
  confidence_score: number;
  reason: string;
  recommendation: string;
  severity: string;
  severity_display: string;
  status: string;
  detected_at: string;
}

interface StorageFilters {
  resource_type: string;
  severity: string;
  region: string;
}


interface DuplicateFindingItem {
  id: string;
  duplicate_type: string;
  duplicate_type_display: string;
  group_id: string;
  group_name: string;
  resources: string[];
  total_wasted_size_gb: number | null;
  estimated_savings: number;
  reason: string;
  recommendation: string;
  detected_at: string;
}

// Add this near your other type definitions (around line 453):
interface CpuDataItem {
  id: string;
  name: string;
  avg_cpu: number;
  max_cpu: number;
  is_idle: boolean;
  recommendation: string;
  estimated_savings: number;
}

interface CpuData {
  ec2_instances: CpuDataItem[];
  rds_instances: CpuDataItem[];
  summary: {
    total_resources_monitored: number;
    idle_resources: number;
    avg_ec2_cpu: number;
    avg_rds_cpu: number;
    total_potential_savings: number;
  };
}

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

  const [resourceData, setResourceData] = useState<ResourceData | null>(null)
  const [resourceLoading, setResourceLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [awsAccounts, setAwsAccounts] = useState<AwsAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")

  const [paidResources, setPaidResources] = useState<PaidResourcesData | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisData | null>(null);
  
  // GitHub states
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [connectedRepos, setConnectedRepos] = useState<GitHubRepo[]>([]);
  const [availableRepos, setAvailableRepos] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [selectedReposForScan, setSelectedReposForScan] = useState<number[]>([]);
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [selectedReposForCostAnalysis, setSelectedReposForCostAnalysis] = useState<number[]>([]);
  const [analyzingCosts, setAnalyzingCosts] = useState<boolean>(false);
  const [costAnalysisResults, setCostAnalysisResults] = useState<any[]>([]);
  const [costSummary, setCostSummary] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'2days' | '1week' | '1month' | '2months' | '3months'>('1month');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  // AI Recommendations states
const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
const [aiAnalysisGeneratedAt, setAiAnalysisGeneratedAt] = useState<string | null>(null);
const [showFullAnalysis, setShowFullAnalysis] = useState(false);
// Add these state declarations inside the CostAnalyticsProvider component
// (around line 500-550 where other states are declared)

// Storage Optimization States
// Replace the storage optimization states with typed versions
const [storageScanning, setStorageScanning] = useState<boolean>(false);
const [storageResults, setStorageResults] = useState<StorageScanResult | null>(null);
const [storageActiveTab, setStorageActiveTab] = useState<string>('unused');

// Idle Resources States
const [idleScanning, setIdleScanning] = useState<boolean>(false);
const [idleResults, setIdleResults] = useState<any>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchPaidResources = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resources/${accountId}/paid-resources/`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch paid resources');
      
      const data: PaidResourcesData = await response.json();
      console.log("Paid resources data:", data)
      setPaidResources(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCostAnalysis = async () => {
    if (!accountId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/resources/${accountId}/cost-analysis/`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch cost analysis');
      
      const data: CostAnalysisData = await response.json();
      console.log("Cost analysis data:", data)
      setCostAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchPaidResources();
      fetchCostAnalysis();
    }
  }, [accountId]);

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
  if (accountId && selectedMenu === "rightsizing") {
    fetchCachedAIAnalysis();
  }
}, [accountId, selectedMenu]);

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
        
        if (!response.ok) {
          throw new Error("Failed to load AWS info")
        }
        
        const data = await response.json()
        setAwsInfo(data)
      } catch (error) {
        console.error("Error fetching AWS info:", error)
        setConnectionStatus("Failed to load AWS platform information")
      }
    }

    fetchAwsInfo()
  }, [navigate])

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
      console.log("📋 Accounts from API:", data);
      
      // Handle both response formats
      let accountsArray = [];
      if (data.accounts && Array.isArray(data.accounts)) {
        accountsArray = data.accounts;
      } else if (Array.isArray(data)) {
        accountsArray = data;
      }
      
      setAwsAccounts(accountsArray)
      
      if (accountsArray.length > 0) {
        // Find the first connected account
      const connectedAccount = accountsArray.find((acc: AwsAccount) => acc.status === 'connected');
        const accountToUse = connectedAccount || accountsArray[0];
        
        setAccountId(accountToUse.id);
        console.log("✅ Selected account:", accountToUse.aws_account_id, "Status:", accountToUse.status);
        
        // Force refresh cost data for the selected account
        if (selectedMenu === "overview") {
          await fetchCostAnalytics();
        }
      }
    } catch (err: any) {
      console.error("Error fetching AWS accounts:", err)
      setError(err.message)
      setAwsAccounts([])
    }
  }

  useEffect(() => {
    fetchUserAccounts()
  }, [provider, navigate])

  // Add this function to your frontend
const fetchServiceBreakdownFromDB = async () => {
  if (!accountId) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/service-breakdown-db/`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const data = await response.json();
      setProviderData(prev => ({
        ...prev,
        service_breakdown: data.service_breakdown,
        current_month_spend: data.total_monthly
      }));
    }
  } catch (error) {
    console.error('Error fetching DB service breakdown:', error);
  }
};

// Call this after loading the account
useEffect(() => {
  if (accountId && selectedMenu === "services") {
    fetchServiceBreakdownFromDB();
  }
}, [accountId, selectedMenu]);

  useEffect(() => {
    const loadExternalId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/aws/setup/`, {
          method: "GET",
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.external_id) {
            setExternalId(data.external_id);
            console.log("📌 Loaded external ID from database:", data.external_id);
          }
        }
      } catch (error) {
        console.error("Error loading external ID:", error);
      }
    };
    
    loadExternalId();
  }, []);

  useEffect(() => {
  if (selectedMenu === "forecast" && accountId) {
    fetchForecastData();
  }
}, [selectedMenu, accountId]);



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
          console.error("Backend error details:", errorData)
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      console.log("📊 Cost analytics data received:", data);

    const serviceBreakdown = (data.service_breakdown || [])
    .filter(service => service.amount > 0.50)  // Only show services > $0.50
    .filter(service => service.percentage > 0.5)  // Only show > 0.5% of total
    .slice(0, 10);  // Limit to top 10
      
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
  if (!accountId) return;
  
  if (!window.confirm('⚠️ Are you sure you want to clear all saved data? This will delete all cost and resource data for this account. You will need to sync again to get fresh data.')) {
    return;
  }
  
  setLoading(true);
  setStatus('Clearing all data...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/clear-data/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${getAuthToken()}`,
      },
      // Don't include credentials or CSRF token
    });

    if (response.status === 401) {
      navigate('/login');
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clear data');
    }
    
    const data = await response.json();
    setStatus('✅ ' + data.message);
    setIsConnectionSuccess(true);
    
    // Reset data
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
    });
    setResourceData(null);
    setPaidResources(null);
    
    setTimeout(() => setStatus(''), 3000);
    
  } catch (error) {
    console.error('Error clearing data:', error);
    setStatus('❌ ' + (error instanceof Error ? error.message : 'Failed to clear data'));
    setIsConnectionSuccess(false);
  } finally {
    setLoading(false);
  }
};

const fetchForecastData = async () => {
  if (!accountId) return;
  
  setForecastLoading(true);
  try {
    console.log("Fetching forecast for account:", accountId);
    const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/forecast/`, {
      headers: getAuthHeaders()
    });
    
    console.log("Forecast response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Forecast error response:", errorText);
      throw new Error('Failed to fetch forecast');
    }
    
    const data = await response.json();
    console.log("Forecast data received:", data);
    setForecastData(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    setStatus('❌ Failed to load forecast data');
  } finally {
    setForecastLoading(false);
  }
};
// Call fetch when account changes or forecast menu is selected

  
  const fetchResourceData = async (forceRefresh = false) => {
    if (!accountId) return;
    setResourceLoading(true);
    try {
      const url = `${API_BASE_URL}/resources/${accountId}/resource_summary/${
        forceRefresh ? '?no_cache=true' : ''
      }`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch resource data');
      }
      
      const data = await response.json();
      setResourceData(data);
    } catch (error) {
      console.error('Error fetching resource data:', error);
      const message = error instanceof Error ? error.message : 'Failed to load resource data';
      setStatus(message);
    } finally {
      setResourceLoading(false);
    }
  };

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
      console.error("Error refreshing analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!accountId) return;
    
    const loadAllData = async () => {
      setLoading(true);
      try {
        if (selectedMenu === "overview" || selectedMenu === "services") {
          await fetchCostAnalytics();
        }
        if (selectedMenu === "resources") {
          await fetchResourceData();
        }
        if (selectedMenu === "services") {
          await fetchPaidResources();
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [accountId, selectedMenu]);

  const createRoleInAws = async () => {
    setAwsLoading(true)
    setConnectionStatus(null)
    setIsConnectionSuccess(false)

    try {
      // First, try to GET existing external ID
      const getResponse = await fetch(`${API_BASE_URL}/aws/setup/`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        if (data.external_id) {
          setExternalId(data.external_id);
          setConnectionStatus("External ID ready! Follow the steps below.")
          setIsConnectionSuccess(true)
          setAwsLoading(false)
          return;
        }
      }
      
      // If no existing external ID, generate a new one via POST
      const res = await fetch(`${API_BASE_URL}/aws/setup/`, {
        method: "POST",
        headers: getAuthHeaders()
      })
      
      if (res.status === 401) {
        navigate('/login')
        return
      }
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate External ID")
      }
      
      const data = await res.json()
      setExternalId(data.external_id)
      setConnectionStatus("External ID generated successfully! Follow the steps below.")
      setIsConnectionSuccess(true)
    } catch (err: any) {
      console.error('Error:', err);
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
      console.log("🔐 Connecting with Role ARN:", roleArn);
      
      const res = await fetch(`${API_BASE_URL}/aws/connect/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          role_arn: roleArn,
        }),
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect account")
      }

      setConnectionStatus(`✅ ${data.message || "AWS account connected successfully!"}`)
      setIsConnectionSuccess(true)
      
      setRoleArn("")
      setExternalId(null)
      
      // IMPORTANT: Refresh the accounts list first
      await fetchUserAccounts();
      
      // Then switch to overview tab after a short delay
      setTimeout(() => {
        setSelectedMenu("overview");
        setStatus("AWS account connected! Loading your cost data...");
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Connection error:', err);
      setConnectionStatus(`❌ ${err.message}`)
      setIsConnectionSuccess(false)
    } finally {
      setAwsLoading(false)
    }
  }

  // Fetch cached AI analysis
const fetchCachedAIAnalysis = async () => {
  if (!accountId) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/cached-analysis/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch cached analysis');
    
    const data = await response.json();
    if (data.success && data.analysis) {
      setAiAnalysis(data.analysis);
      setAiAnalysisGeneratedAt(data.generated_at);
    } else {
      setAiAnalysis(null);
    }
  } catch (error) {
    console.error('Error fetching cached analysis:', error);
  }
};

// Generate new AI analysis
const generateAIAnalysis = async () => {
  if (!accountId) return;
  
  setAiAnalysisLoading(true);
  setStatus('🤖 Generating AI analysis... This may take a moment.');
  
  try {
    const response = await fetch(`${API_BASE_URL}/aws/accounts/${accountId}/ai-analysis/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to generate analysis');
    
    const data = await response.json();
    if (data.success && data.analysis) {
      setAiAnalysis(data.analysis);
      setAiAnalysisGeneratedAt(data.generated_at);
      setStatus('✅ AI analysis generated successfully!');
    } else {
      throw new Error('No analysis returned');
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    setStatus('❌ Failed to generate AI analysis. Please try again.');
  } finally {
    setAiAnalysisLoading(false);
    setTimeout(() => setStatus(''), 3000);
  }
};

  // GitHub Functions - Fixed to handle authentication properly
  const fetchGithubAuthUrl = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/github/auth-url/`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to get auth URL');
      
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Error getting GitHub auth URL:', error);
      setStatus('❌ Failed to connect GitHub');
    }
  };

  
  const fetchConnectedRepos = async () => {
  const token = getAuthToken();
  if (!token) {
    console.log('No auth token found, skipping fetchConnectedRepos');
    setConnectedRepos([]);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/github/connected/`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401 || response.status === 403) {
      console.log('Authentication failed, clearing token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setConnectedRepos([]);
      return;
    }
    
    if (!response.ok) throw new Error('Failed to fetch connected repos');
    
    const data = await response.json();
    setConnectedRepos(data.repos || []);
  } catch (error) {
    console.error('Error fetching connected repos:', error);
    setConnectedRepos([]);
  }
};

const fetchGithubStatus = async () => {
  const token = getAuthToken();
  if (!token) {
    console.log('No auth token found, skipping fetchGithubStatus');
    setGithubConnected(false);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/github/status/`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401 || response.status === 403) {
      console.log('Authentication failed for GitHub status');
      setGithubConnected(false);
      return;
    }
    
    if (response.ok) {
      const data = await response.json();
      setGithubConnected(data.connected);
      if (data.username) {
        setGithubUser(data);
      }
    }
  } catch (error) {
    console.error('Error fetching GitHub status:', error);
    setGithubConnected(false);
  }
};

  const fetchAvailableRepos = async () => {
  setGithubLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/github/repos/`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      setAvailableRepos([]);
      return;
    }
    
    if (!response.ok) throw new Error('Failed to fetch repositories');
    
    const data = await response.json();
    console.log("Repos data:", data); // Debug log
    
    // Make sure each repo has html_url
    const reposWithUrls = (data.repos || []).map((repo: any) => ({
      ...repo,
      html_url: repo.html_url || `https://github.com/${repo.full_name}`, // Fallback
      url: repo.html_url || `https://github.com/${repo.full_name}`,
    }));
    
    setAvailableRepos(reposWithUrls);
  } catch (error) {
    console.error('Error fetching repos:', error);
    setAvailableRepos([]);
  } finally {
    setGithubLoading(false);
  }
};

const connectRepo = async (repo: any, awsAccountId?: number) => {
  console.log("🔍 connectRepo called with:", repo.full_name, awsAccountId);
  
  // Check if already at limit
  if (connectedRepos.length >= 2) {
    setStatus('❌ Maximum 2 repositories already connected. Please disconnect one first.');
    setTimeout(() => setStatus(''), 3000);
    return;
  }
  
  try {
    const token = getAuthToken();
    
    const requestBody = {
      repo_id: repo.id,
      repo_name: repo.name,
      repo_full_name: repo.full_name,
      repo_url: repo.html_url,
      aws_account_id: awsAccountId || accountId
    };
    
    const response = await fetch(`${API_BASE_URL}/github/connect-legacy/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle specific error messages
      if (responseData.error && responseData.error.includes('Maximum 2 repositories')) {
        setStatus('❌ Maximum 2 repositories already connected. Please disconnect one first.');
      } else {
        throw new Error(responseData.error || 'Failed to connect repository');
      }
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    
    await fetchConnectedRepos();
    await fetchAvailableRepos();
    
    setStatus(`✅ Connected ${repo.full_name}`);
    setTimeout(() => setStatus(''), 3000);
  } catch (error) {
    console.error('Error connecting repo:', error);
    setStatus(`❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setTimeout(() => setStatus(''), 3000);
  }
};

  

  const disconnectRepo = async (repoId: number) => {
    if (!confirm('Are you sure you want to disconnect this repository?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/github/repos/${repoId}/disconnect/`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to disconnect repository');
      
      setStatus('✅ Repository disconnected');
      await fetchConnectedRepos();
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error disconnecting repo:', error);
      setStatus('❌ Failed to disconnect repository');
    }
  };

  const fetchDeployments = async (repoId: number) => {
    setSelectedRepoId(repoId);
    try {
      const response = await fetch(`${API_BASE_URL}/github/repos/${repoId}/deployments/`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch deployments');
      
      const data = await response.json();
      setDeployments(data.deployments || []);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      setDeployments([]);
    }
  };


  // Add new state variables

// Add the analyze function
const analyzeTerraformCosts = async () => {
  if (selectedReposForCostAnalysis.length === 0) {
    setStatus('❌ Please select at least one repository to analyze');
    return;
  }
  
  setAnalyzingCosts(true);
  setCostAnalysisResults([]);
  setCostSummary(null);
  
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/github/analyze-terraform-costs/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ repo_ids: selectedReposForCostAnalysis })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze costs');
    }
    
    const data = await response.json();
    setCostAnalysisResults(data.results || []);
    setCostSummary(data.summary);
    setStatus('✅ Cost analysis completed!');
    setTimeout(() => setStatus(''), 3000);
    
  } catch (error) {
    console.error('Error analyzing costs:', error);
    setStatus(`❌ Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setAnalyzingCosts(false);
  }
};

const toggleRepoForCostAnalysis = (repoId: number) => {
  setSelectedReposForCostAnalysis(prev => 
    prev.includes(repoId) 
      ? prev.filter(id => id !== repoId)
      : [...prev, repoId]
  );
};


const startScan = async () => {
  if (selectedReposForScan.length === 0) {
    setStatus('❌ Please select at least one repository to scan');
    return;
  }

  setScanning(true);

  try {
    const token = getAuthToken();
    console.log('Token being sent:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');
    
    if (!token) {
      setStatus('❌ No authentication token found. Please log in again.');
      setScanning(false);
      return;
    }
    
    // Use the new manual endpoint
    const response = await fetch(`${API_BASE_URL}/github/scan/start-manual/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ repo_ids: selectedReposForScan })
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setStatus('❌ Session expired. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      setScanning(false);
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start scan');
    }
    
    const data = await response.json();
    const scanId = data.scan_id;
    console.log('Scan started with ID:', scanId);
    
    // Poll for results
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`${API_BASE_URL}/github/scan/status/${scanId}/`, {
          headers: {
            'Authorization': `Token ${token}`,
          }
        });
        
        if (statusResponse.ok) {
          const scanData = await statusResponse.json();
          console.log('Scan status:', scanData.status);
          
          if (scanData.status === 'complete') {
            setScanResults(scanData.results || []);
            setScanning(false);
            clearInterval(pollInterval);
            setStatus('✅ Scan completed!');
            setTimeout(() => setStatus(''), 3000);
          } else if (scanData.status === 'error') {
            setScanning(false);
            clearInterval(pollInterval);
            setStatus(`❌ Scan failed: ${scanData.error || 'Unknown error'}`);
          } else {
            // Update progress if available
            if (scanData.percentage) {
              setStatus(`Scanning: ${scanData.percentage}% - ${scanData.current_repo || 'Processing...'}`);
            }
          }
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
      }
    }, 2000);
    
    // Timeout after 60 seconds
    setTimeout(() => {
      if (scanning) {
        clearInterval(pollInterval);
        setScanning(false);
        setStatus('⏰ Scan timeout. Please try again.');
      }
    }, 60000);
    
  } catch (error) {
    console.error('Error starting scan:', error);
    setStatus(`❌ Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setScanning(false);
  }
};
  const toggleRepoForScan = (repoId: number) => {
    setSelectedReposForScan(prev => 
      prev.includes(repoId) 
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    );
  };

  useEffect(() => {
     const token = getAuthToken();
  if (!token) {
    navigate('/login');
    return;
  }
    fetchGithubStatus();
    fetchConnectedRepos();
  }, []);

 
// Updated runStorageScan function with force refresh option
 const runStorageScan = async (forceRefresh = false) => {
  if (!accountId) {
    setStatus('❌ Please select an AWS account first');
    return;
  }
  
  setStorageScanning(true);
  setStatus(forceRefresh ? '🔄 Fetching fresh data from AWS...' : '📦 Loading cached results...');
  
  try {
    const url = forceRefresh 
      ? `${API_BASE_URL}/storage-scan/complete/${accountId}/?force_refresh=true`
      : `${API_BASE_URL}/storage-scan/complete/${accountId}/`;
    
    const response = await fetch(url, { headers: getAuthHeaders() });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scan resources');
    }
    
    const data = await response.json();
    
    if (data.success) {
      setStorageResults(data);
      
      if (data.cached) {
        setStatus(`📦 Cached results - ${data.total_findings} optimization opportunities found`);
      } else if (data.total_findings > 0) {
        setStatus(`✅ Found ${data.total_findings} issues, saving $${data.total_potential_savings}/month`);
        setStorageActiveTab('optimizations');
      } else {
        setStatus('✅ No optimization opportunities found');
      }
    } else {
      throw new Error(data.error || 'Scan failed');
    }
    
    setTimeout(() => setStatus(''), 4000);
  } catch (error: any) {
    console.error('Scan error:', error);
    setStatus(`❌ ${error.message}`);
  } finally {
    setStorageScanning(false);
  }
};
// Add a force refresh button in the UI


// Replace your existing scanAllIdleResources function with this:
const scanAllIdleResources = async (forceRefresh = false) => {
  if (!accountId) {
    setStatus('❌ Please select an AWS account first');
    return;
  }
  
  setIdleScanning(true);
  setStatus(forceRefresh ? '🔄 Force refreshing from AWS...' : '📦 Loading cached results...');
  
  try {
    const url = forceRefresh 
      ? `${API_BASE_URL}/idle-resources/advanced-scan/${accountId}/?force_refresh=true`
      : `${API_BASE_URL}/idle-resources/advanced-scan/${accountId}/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to scan idle resources');
    }
    
    const data = await response.json();
    console.log("Idle scan response:", data);
    
    if (data.success) {
      // Transform the data to match frontend expectations
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
      };
      
      setIdleResults(results);
      
      if (data.cached) {
        setStatus(`📦 Using cached results. Found ${results.total_findings} idle resources saving $${results.total_savings?.toFixed(2)}/month`);
      } else {
        setStatus(`✅ Scan complete! Found ${results.total_findings} idle resources saving $${results.total_savings?.toFixed(2)}/month`);
      }
    } else {
      throw new Error(data.error || 'Scan failed');
    }
    
    setTimeout(() => setStatus(''), 5000);
  } catch (error: any) {
    console.error('Idle scan error:', error);
    setStatus(`❌ ${error.message}`);
  } finally {
    setIdleScanning(false);
  }
};

const clearStorageCache = async () => {
  if (!accountId) return;
  
  if (!window.confirm('⚠️ Are you sure you want to clear ALL storage optimization data? This will remove all cached results. You will need to scan again to see storage issues.')) {
    return;
  }
  
  setStatus('🗑️ Clearing storage cache...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/storage-clear/${accountId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to clear cache');
    
    const data = await response.json();
    setStorageResults(null);
    setStatus(`✅ ${data.message}`);
    setTimeout(() => setStatus(''), 3000);
  } catch (error: any) {
    console.error('Clear cache error:', error);
    setStatus(`❌ ${error.message}`);
    setTimeout(() => setStatus(''), 3000);
  }
};

// Add this function with your other functions (around where scanAllIdleResources is defined)
const clearIdleResultsCache = async () => {
  if (!accountId) {
    setStatus('❌ Please select an AWS account first');
    return;
  }
  
  if (!window.confirm('⚠️ Are you sure you want to clear all idle resource findings? This will remove all cached results. You will need to scan again to see idle resources.')) {
    return;
  }
  
  setStatus('🗑️ Clearing idle results cache...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/idle-resources/clear/${accountId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cache');
    }
    
    const data = await response.json();
    
    // Clear the idle results from state
    setIdleResults(null);
    setStatus(`✅ ${data.message || 'Cleared all idle resource findings'}`);
    
    setTimeout(() => setStatus(''), 3000);
  } catch (error: any) {
    console.error('Clear cache error:', error);
    setStatus(`❌ ${error.message}`);
    setTimeout(() => setStatus(''), 3000);
  }
};

// Helper function to get correct day name from date
const getDayNameFromDate = (dateStr: string) => {
  if (!dateStr) return '';
  
  // Parse the date string (e.g., "Apr 22" or "2024-04-22")
  let date: Date;
  
  if (dateStr.includes('-')) {
    date = new Date(dateStr);
  } else {
    // Handle "Apr 22" format
    const currentYear = new Date().getFullYear();
    date = new Date(`${dateStr}, ${currentYear}`);
  }
  
  // Return the day name
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Helper to get full date for display
const getFullDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  
  let date: Date;
  if (dateStr.includes('-')) {
    date = new Date(dateStr);
  } else {
    const currentYear = new Date().getFullYear();
    date = new Date(`${dateStr}, ${currentYear}`);
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Update dismissStorageFinding function
const dismissStorageFinding = async (_findingId: string) => {
  // Since we're not persisting to database yet, just refresh the scan
  setStatus('Finding dismissed (refresh scan to see updated results)');
  setTimeout(() => setStatus(''), 2000);
};
  // Safely get selected account - ensure awsAccounts is an array

const AILowLevelRecommendations: React.FC<{ accountId: number | null }> = ({ accountId }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [ageHours, setAgeHours] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Parsed sections
  const [whySection, setWhySection] = useState<string>("");
  const [howSection, setHowSection] = useState<string>("");
  const [whatSection, setWhatSection] = useState<string>("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': token ? `Token ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Parse analysis into sections
  const parseAnalysisIntoSections = (text: string) => {
    let why = "";
    let how = "";
    let what = "";
    
    // Try to find sections by headers
    const whyMatch = text.match(/(?:##?\s*🔴?\s*WHY|WHY THESE COSTS ARE HIGH)[:\s]*(.*?)(?=##?\s*🟡?\s*HOW|##?\s*🔴?\s*HOW|WHY|$)/is);
    const howMatch = text.match(/(?:##?\s*🟡?\s*HOW|HOW TO FIX)[:\s]*(.*?)(?=##?\s*🟢?\s*WHAT|##?\s*🔴?\s*WHAT|WHAT|$)/is);
    const whatMatch = text.match(/(?:##?\s*🟢?\s*WHAT|WHAT YOU'LL SAVE)[:\s]*(.*?)$/is);
    
    why = whyMatch ? whyMatch[1].trim() : "";
    how = howMatch ? howMatch[1].trim() : "";
    what = whatMatch ? whatMatch[1].trim() : "";
    
    // If parsing failed, try to split by numbered sections or use full text
    if (!why && !how && !what) {
      why = text;
    }
    
    setWhySection(why);
    setHowSection(how);
    setWhatSection(what);
  };

  const loadCachedAnalysis = async () => {
    if (!accountId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/aws/accounts/${accountId}/ai-low-level-recommendations-cached/`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setGeneratedAt(data.generated_at);
          setAgeHours(data.age_hours);
          setSummary(data.summary);
          setError(null);
          parseAnalysisIntoSections(data.analysis);
        } else {
          setAnalysis(null);
          setWhySection("");
          setHowSection("");
          setWhatSection("");
        }
      }
    } catch (error) {
      console.error('Error loading cached analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAnalysis = async () => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/aws/accounts/${accountId}/ai-low-level-recommendations/`,
        { 
          method: 'POST',
          headers: getAuthHeaders()
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        setGeneratedAt(data.generated_at);
        setAgeHours(0);
        setSummary(data.summary);
        setError(null);
        parseAnalysisIntoSections(data.analysis);
      } else {
        setError(data.error || data.message || 'Failed to generate analysis');
      }
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      setError(error.message || 'Failed to generate AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load cached analysis on mount
  useEffect(() => {
    if (accountId) {
      loadCachedAnalysis();
    }
  }, [accountId]);

  // Helper to render formatted text with bullet points
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements = [];
    let inList = false;
    let listItems: JSX.Element[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        const content = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
        listItems.push(<li key={i} className="ml-4 mb-2 text-foreground/90">{content}</li>);
      } else {
        if (inList) {
          elements.push(<ul key={`list-${i}`} className="mb-3">{listItems}</ul>);
          inList = false;
          listItems = [];
        }
        if (trimmed) {
          // Check for subheaders
          if (trimmed.startsWith('**') || trimmed.match(/^\d+\.\s*\*\*/)) {
            const subheader = trimmed.replace(/\*\*/g, '');
            elements.push(<h4 key={i} className="font-semibold text-foreground mt-3 mb-2">{subheader}</h4>);
          } else {
            elements.push(<p key={i} className="mb-2 text-foreground/90">{trimmed}</p>);
          }
        }
      }
    }
    
    if (inList) {
      elements.push(<ul key="last-list" className="mb-3">{listItems}</ul>);
    }
    
    return elements;
  };

  if (!accountId) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Select an AWS account to get AI recommendations</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">AI-Powered Cost Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Deep analysis of your low-level resources with actionable recommendations
                </p>
              </div>
            </div>
            {summary && (
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-muted-foreground">
                  💰 Total: <span className="font-bold text-primary">${summary.total_monthly_cost}/month</span>
                </span>
                <span className="text-muted-foreground">
                  🔧 Resources: <span className="font-bold">{summary.resources_count}</span>
                </span>
                {summary.top_categories && summary.top_categories[0] && (
                  <span className="text-muted-foreground">
                    🏆 Top: <span className="font-medium">{summary.top_categories[0].name}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {generatedAt && (
              <span className="text-xs text-muted-foreground">
                Last analysis: {new Date(generatedAt).toLocaleString()}
                {ageHours !== null && ageHours > 0 && ` (${ageHours} hours ago)`}
              </span>
            )}
            <button
              onClick={generateNewAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {loading ? 'Analyzing...' : (analysis ? 'Regenerate' : 'Generate Analysis')}
            </button>
          </div>
        </div>

        {ageHours !== null && ageHours > 0 && analysis && (
          <div className="mt-3 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
            📦 Cached result from {ageHours} hours ago. Click "Regenerate" for fresh analysis.
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && !analysis && (
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground font-medium">Analyzing your resources...</p>
          <p className="text-sm text-muted-foreground mt-1">Our AI is reviewing your infrastructure for optimization opportunities</p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && !analysis && (
        <Card className="p-6">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button
              onClick={generateNewAnalysis}
              className="mt-3 text-sm text-red-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        </Card>
      )}

      {/* Analysis Results - 3 Separate Cards */}
      {analysis && !loading && (
        <>
          {/* WHY Card */}
          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">🔴 WHY These Costs Are High</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {whySection ? renderFormattedText(whySection) : renderFormattedText(analysis.split(/(?:##?\s*🟡?\s*HOW|##?\s*🔴?\s*HOW)/i)[0])}
            </div>
          </Card>

          {/* HOW Card */}
          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">🟡 HOW To Fix Each Issue</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {howSection ? renderFormattedText(howSection) : renderFormattedText(analysis.split(/(?:##?\s*🟢?\s*WHAT|##?\s*🔴?\s*WHAT)/i)[0])}
            </div>
          </Card>

          {/* WHAT Card */}
          <Card className="p-6 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">🟢 WHAT You'll Save</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {whatSection ? renderFormattedText(whatSection) : renderFormattedText(analysis.split(/(?:##?\s*🟢?\s*WHAT)/i)[1] || analysis)}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis);
                setStatus('✅ Analysis copied to clipboard!');
                setTimeout(() => setStatus(''), 2000);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <FileText className="w-4 h-4" />
              Copy Full Analysis
            </button>
            <button
              onClick={generateNewAnalysis}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Analysis
            </button>
          </div>
        </>
      )}

      {/* Empty State - No Analysis */}
      {!analysis && !loading && !error && (
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h4 className="text-lg font-semibold text-foreground mb-2">Ready for AI Analysis</h4>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click "Generate Analysis" to get intelligent recommendations on how to optimize your AWS costs
          </p>
          <button
            onClick={generateNewAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90"
          >
            Generate Analysis
          </button>
        </Card>
      )}
    </div>
  );
};

const selectedAccount = Array.isArray(awsAccounts) && awsAccounts.length > 0
  ? awsAccounts.find(acc => acc.id === accountId)
  : null
    
const accountName = selectedAccount 
  ? `AWS Account: ${accountId || accountId || 'Unknown'} (${selectedAccount.status || 'unknown'})` 
  : awsAccounts.length > 0 ? "Select an account" : "No accounts connected"

// Add this to debug what accounts are being loaded
console.log("AWS Accounts:", awsAccounts);
console.log("Selected Account ID:", accountId);
console.log("Selected Account:", selectedAccount);

  const manualInstructions = {
    steps: [
      {
        title: "Step 1: Create the Policy",
        instructions: [
          "Navigate to IAM → Policies → Create Policy",
          "Click the 'JSON' tab",
          "Paste the policy JSON (shown below)",
          "Name it: CloudCostReadOnlyPolicy",
          "Click 'Create Policy'"
        ]
      },
      {
        title: "Step 2: Create the Role",
        instructions: [
          "Navigate to IAM → Roles → Create Role",
          "Select 'Another AWS account'",
          `Enter Account ID: ${awsInfo?.platform_account_id || "026395503692"}`,
          "✓ Check 'Require external ID'",
          `Paste External ID: ${externalId || "[Will appear after clicking 'Create Role in AWS']"}`,
          "Click 'Next'"
        ]
      },
      {
        title: "Step 3: Attach the Policy",
        instructions: [
          "On the 'Add permissions' page:",
          "Search for 'CloudCostReadOnlyPolicy'",
          "✓ Check the box next to it",
          "Click 'Next'"
        ]
      },
      {
        title: "Step 4: Complete & Copy ARN",
        instructions: [
          "Name the role: CloudCostReadOnlyRole",
          "Click 'Create Role'",
          "Copy the Role ARN (starts with 'arn:aws:iam::')"
        ]
      }
    ]
  }

  const policyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetDimensionValues",
        "organizations:ListAccounts",
        "ec2:Describe*",
        "s3:ListAllMyBuckets",
        "rds:Describe*",
        "iam:List*",
        "cloudwatch:GetMetricData"
      ],
      "Resource": "*"
    }
  ]
}`

  const menuItems: { id: MenuItem; label: string; icon: React.ReactNode }[] = [
    { id: "connect", label: "Connect Account", icon: <Settings className="w-4 h-4" /> },
    { id: "overview", label: "Total Spend", icon: <DollarSign className="w-4 h-4" /> },
    { id: "services", label: "Service Breakdown", icon: <Settings className="w-4 h-4" /> },
    { id: "resources", label: "Resources", icon: <Server className="w-4 h-4" /> },
    { id: "forecast", label: "Forecast", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "github", label: "GitHub Integration", icon: <Github className="w-4 h-4" /> },
    { id: "deployments", label: "Deployments", icon: <GitMerge className="w-4 h-4" /> },
    { id: "idle", label: "Idle Resources", icon: <Power className="w-4 h-4" /> },
    { id: "storage", label: "Storage Optimization", icon: <Settings className="w-4 h-4" /> },
    { id: "rightsizing", label: "AI Recommendations", icon: <Sparkles className="w-4 h-4" /> },
  ]

  const getYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const getResourceCategoryData = () => {
  if (!paidResources?.cost_categories) return [];
  
  // Convert to array and filter out empty categories
  return Object.entries(paidResources.cost_categories)
    .filter(([_, data]) => data.count > 0 && data.estimated_monthly_cost > 0)
    .sort((a, b) => b[1].estimated_monthly_cost - a[1].estimated_monthly_cost);
};

  const getCostLevelColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCostLevelBgColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'bg-red-100 dark:bg-red-900/20';
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'LOW': return 'bg-green-100 dark:bg-green-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getResourceIcon = (categoryKey: string) => {
    const icons: {[key: string]: React.ReactNode} = {
      'ec2': <Cpu className="w-5 h-5" />,
      'lambda': <Code className="w-5 h-5" />,
      'eks': <Container className="w-5 h-5" />,
      'rds': <Database className="w-5 h-5" />,
      'dynamodb': <Box className="w-5 h-5" />,
      'elasticache': <Zap className="w-5 h-5" />,
      'redshift': <Sparkles className="w-5 h-5" />,
      's3': <HardDrive className="w-5 h-5" />,
      'efs': <FileText className="w-5 h-5" />,
      'ebs': <HardDrive className="w-5 h-5" />,
      'cloudfront': <Globe className="w-5 h-5" />,
      'load_balancers': <Scale className="w-5 h-5" />,
      'api_gateway': <Key className="w-5 h-5" />,
      'sqs': <MessageSquare className="w-5 h-5" />,
      'sns': <Bell className="w-5 h-5" />,
      'ecr': <Layers className="w-5 h-5" />,
      'elastic_beanstalk': <Package className="w-5 h-5" />,
      'secrets_manager': <Lock className="w-5 h-5" />,
      'cloudwatch': <Eye className="w-5 h-5" />,
      'codebuild': <CircuitBoard className="w-5 h-5" />,
      'workspaces': <Monitor className="w-5 h-5" />,
      'kinesis': <Wrench className="w-5 h-5" />,
      'config': <Shield className="w-5 h-5" />,
      'ssm': <Wrench className="w-5 h-5" />,
    };
    
    return icons[categoryKey] || <Server className="w-5 h-5" />;
  };

  // Render GitHub section
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
            <span>Connected as {githubUser?.login || 'GitHub User'}</span>
          </div>
        )}
      </div>

      {githubConnected && (
        <>
          {/* Connected Repositories Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-foreground">
                Connected Repositories ({connectedRepos.length}/2)
              </h4>
              <button
                onClick={fetchConnectedRepos}
                className="text-sm text-primary hover:underline"
              >
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
                        {repo.aws_account_name && (
                          <div className="text-sm text-muted-foreground">
                            AWS Account: {repo.aws_account_name}
                          </div>
                        )}
                        {repo.last_sync_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last sync: {new Date(repo.last_sync_at).toLocaleString()}
                          </div>
                        )}
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

          {/* Available Repositories Section - Only show if less than 2 connected */}
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
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>⭐ {repo.stargazers_count || 0}</span>
                            <span>🍴 {repo.forks_count || 0}</span>
                            <span>{repo.language || 'Unknown'}</span>
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

          {/* Show message when at limit (2 repos connected) */}
          {connectedRepos.length >= 2 && (
            <div className="border-t border-border pt-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Maximum repositories reached (2/2)</span>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                  Please disconnect a repository before connecting a new one.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </Card>

    {/* Terraform Infrastructure Scan Card */}
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
      
      {/* Cost Analysis Results */}
      {costAnalysisResults.length > 0 && (
        <div className="space-y-4">
          <h5 className="font-medium text-foreground">Cost Analysis Results:</h5>
          
          {costAnalysisResults.map((result, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden">
              {/* Repository Header */}
              <div className={`p-4 ${result.error ? 'bg-red-50 dark:bg-red-900/20' : 'bg-primary/5'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    <span className="font-semibold text-foreground">{result.repository_name}</span>
                  </div>
                  {!result.error && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Estimated Monthly Cost</p>
                      <p className="text-xl font-bold text-primary">${result.total_monthly_cost?.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {!result.error && (
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>📁 {result.terraform_files} Terraform files</span>
                    <span>🔧 {result.resources_found} Resources</span>
                    <span>💰 ${result.total_hourly_cost}/hour estimated</span>
                  </div>
                )}
              </div>
              
              {/* Error Display */}
              {result.error && (
                <div className="p-4 text-red-600">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {result.error}
                </div>
              )}
              
              {/* Resources List */}
              {!result.error && result.resources && result.resources.length > 0 && (
                <div className="divide-y divide-border">
                  {result.resources.map((resource: any, resIdx: number) => (
                    <div key={resIdx} className="p-4 hover:bg-muted/30">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {resource.type}
                            </span>
                            <span className="text-sm font-medium text-foreground">{resource.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            File: {resource.file}
                          </div>
                          {resource.config && Object.keys(resource.config).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View configuration ({Object.keys(resource.config).length} attributes)
                              </summary>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(resource.config, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-primary">
                            ${resource.estimated_cost?.monthly_cost}/month
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${resource.estimated_cost?.hourly}/hour
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Summary Card */}
          {costSummary && costSummary.successful_scans > 0 && (
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <h5 className="font-semibold text-foreground mb-3">Summary</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Repositories</p>
                  <p className="text-xl font-bold">{costSummary.successful_scans}/{costSummary.total_repositories}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Cost</p>
                  <p className="text-xl font-bold">${costSummary.total_hourly_cost?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-xl font-bold text-primary">${costSummary.total_monthly_cost?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yearly Cost</p>
                  <p className="text-xl font-bold">${(costSummary.total_monthly_cost * 12)?.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
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
);

const renderAIRecommendationsSection = () => (
  <div className="space-y-6">
    {/* Header Card */}
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
          {aiAnalysisLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {aiAnalysisLoading ? 'Generating...' : 'Generate New Analysis'}
        </button>
      </div>
      
      {aiAnalysisGeneratedAt && (
        <p className="text-xs text-muted-foreground mt-2">
          Last analysis: {new Date(aiAnalysisGeneratedAt).toLocaleString()}
        </p>
      )}
    </Card>

    {/* Analysis Content */}
    {aiAnalysisLoading && !aiAnalysis && (
      <Card className="p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Analyzing Your AWS Costs...</h3>
        <p className="text-muted-foreground">
          Our AI is reviewing your spending patterns and generating personalized recommendations.
          <br />This typically takes 15-30 seconds.
        </p>
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
      <>
        {/* Analysis Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">AI Insights & Recommendations</h3>
          </div>
          
          <div className={`prose prose-sm dark:prose-invert max-w-none ${!showFullAnalysis && 'max-h-96 overflow-hidden relative'}`}>
            <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {aiAnalysis.split('\n').map((paragraph, idx) => {
                if (paragraph.trim().startsWith('#')) {
                  const level = paragraph.match(/^#+/)?.[0].length || 1;
                  const text = paragraph.replace(/^#+\s*/, '');
                  const HeadingTag = `h${Math.min(level, 4)}` as keyof JSX.IntrinsicElements;
                  return (
                    <HeadingTag key={idx} className={`font-bold mt-4 mb-2 text-foreground ${
                      level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'
                    }`}>
                      {text}
                    </HeadingTag>
                  );
                } else if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                  return (
                    <li key={idx} className="ml-4 mb-1 text-foreground/90">
                      {paragraph.trim().substring(1).trim()}
                    </li>
                  );
                } else if (paragraph.trim().match(/^\d+\./)) {
                  return (
                    <li key={idx} className="ml-4 mb-1 text-foreground/90 list-decimal">
                      {paragraph.trim().replace(/^\d+\.\s*/, '')}
                    </li>
                  );
                } else if (paragraph.trim()) {
                  return (
                    <p key={idx} className="mb-2 text-foreground/90">
                      {paragraph}
                    </p>
                  );
                }
                return <br key={idx} />;
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

        {/* Key Takeaways Card */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">💡 Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <p className="font-semibold text-foreground">Optimization Opportunities</p>
              <p className="text-sm text-muted-foreground">Identify top cost-saving opportunities</p>
            </div>
            <div className="text-center p-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
              </div>
              <p className="font-semibold text-foreground">Growth Patterns</p>
              <p className="text-sm text-muted-foreground">Understand your spending trends</p>
            </div>
            <div className="text-center p-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-semibold text-foreground">Actionable Steps</p>
              <p className="text-sm text-muted-foreground">Clear next steps to reduce costs</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(aiAnalysis);
              setStatus('✅ Analysis copied to clipboard!');
              setTimeout(() => setStatus(''), 2000);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4" />
            Copy Analysis
          </button>
          <button
            onClick={generateAIAnalysis}
            disabled={aiAnalysisLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </>
    )}
  </div>
);

  
const renderForecastSection = () => {
  if (forecastLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading forecast data...</span>
      </div>
    );
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
    );
  }
  
  const getTimeframeData = () => {
    switch(selectedTimeframe) {
      case '2days': return forecastData.two_days;
      case '1week': return forecastData.one_week;
      case '1month': return forecastData.one_month;
      case '2months': return forecastData.two_months;
      case '3months': return forecastData.three_months;
      default: return forecastData.one_month;
    }
  };
  
  const timeframeData = getTimeframeData();
  
  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
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
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTimeframe === tf.id
                  ? `${tf.color} text-white shadow-lg scale-105`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </Card>
      
      {/* Main Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Month</p>
              <p className="text-2xl font-bold text-foreground">
                ${(forecastData.current_month_cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                ${(forecastData.one_week?.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                ${(forecastData.one_month?.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              {forecastData.one_month?.vs_current_month !== 0 && (
                <p className={`text-xs ${forecastData.one_month?.vs_current_month > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {forecastData.one_month?.vs_current_month > 0 ? '↑' : '↓'} 
                  {Math.abs(forecastData.one_month?.vs_current_month)}% vs current
                </p>
              )}
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
                ${(forecastData.three_months?.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Daily/Weekly Breakdown Table */}
      {selectedTimeframe === '1week' && timeframeData?.daily_breakdown && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Forecast Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Day</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Estimated Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {timeframeData.daily_breakdown.map((day: any, idx: number) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Day {day.day}</td>
                    <td className="py-3 px-4 text-right">${day.cost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">${day.cumulative?.toLocaleString() || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30">
                <tr>
                  <td className="py-3 px-4 font-semibold">Total</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">${timeframeData.total?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right"></td>
                 </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
      
      {/* Weekly Breakdown for Monthly Forecast */}
      {selectedTimeframe === '1month' && timeframeData?.weekly_breakdown && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Forecast Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeframeData.weekly_breakdown.map((week: any, idx: number) => (
              <Card key={idx} className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">Week {week.week}</p>
                <p className="text-2xl font-bold text-primary">${week.cost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">Cumulative: ${week.cumulative?.toLocaleString()}</p>
              </Card>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total Monthly Forecast:</span>
              <span className="text-2xl font-bold text-primary">${timeframeData.total?.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}
      
      {/* Monthly Breakdown for 3-Month Forecast */}
      {selectedTimeframe === '3months' && timeframeData?.months_breakdown && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Forecast Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timeframeData.months_breakdown.map((month: any, idx: number) => (
              <Card key={idx} className="p-4 text-center bg-muted/30">
                <p className="text-sm text-muted-foreground">Month {month.month}</p>
                <p className="text-3xl font-bold text-primary mt-2">${month.cost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">Cumulative: ${month.cumulative?.toLocaleString()}</p>
              </Card>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total 3-Month Forecast:</span>
              <span className="text-2xl font-bold text-primary">${timeframeData.total?.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}
      
      {/* Individual Service Forecasts */}
      {forecastData.service_forecasts?.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-foreground">Service Cost Forecasts</h3>
            {selectedService && (
              <button
                onClick={() => setSelectedService(null)}
                className="text-sm text-primary hover:underline"
              >
                ← Back to All Services
              </button>
            )}
          </div>
          
          {selectedService ? (
            // Detailed view for a single service
            (() => {
              const service = forecastData.service_forecasts.find((s: any) => s.service === selectedService);
              if (!service) return null;
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{service.service}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current monthly cost: <span className="font-semibold">${service.current_cost?.toLocaleString()}</span>
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.trend === 'increasing' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      service.trend === 'decreasing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {service.trend === 'increasing' ? '↑' : service.trend === 'decreasing' ? '↓' : '→'} 
                      {Math.abs(service.trend_rate)}% per month
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {service.predictions?.map((pred: any, idx: number) => (
                      <Card key={idx} className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">{pred.date || `Month ${pred.month}`}</p>
                        <p className="text-2xl font-bold text-primary mt-2">${pred.cost?.toLocaleString()}</p>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card className="p-4 bg-primary/5">
                      <p className="text-sm text-muted-foreground">Next Month Forecast</p>
                      <p className="text-2xl font-bold text-primary">${service.next_month_cost?.toLocaleString()}</p>
                    </Card>
                    <Card className="p-4 bg-primary/5">
                      <p className="text-sm text-muted-foreground">Quarterly Total (3 months)</p>
                      <p className="text-2xl font-bold text-primary">${service.quarterly_cost?.toLocaleString()}</p>
                    </Card>
                  </div>
                </div>
              );
            })()
          ) : (
            // List view of all services
            <div className="space-y-2">
              {forecastData.service_forecasts.map((service: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSelectedService(service.service)}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        service.trend === 'increasing' ? 'bg-red-500' :
                        service.trend === 'decreasing' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                      <p className="font-semibold text-foreground">{service.service}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current: <span className="font-medium">${service.current_cost?.toLocaleString()}/month</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Next Month</p>
                      <p className="font-bold text-primary">${service.next_month_cost?.toLocaleString()}</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      service.trend === 'increasing' ? 'text-red-500' :
                      service.trend === 'decreasing' ? 'text-green-500' :
                      'text-gray-500'
                    }`}>
                      {service.trend === 'increasing' ? '↑' : service.trend === 'decreasing' ? '↓' : '→'}
                      {Math.abs(service.trend_rate)}%
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {/* Top Growing Services Alert */}
      {forecastData.top_growing_services?.length > 0 && !selectedService && (
        <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">⚠️ Fastest Growing Services</h3>
          </div>
          <div className="space-y-3">
            {forecastData.top_growing_services.map((service: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{service.service}</p>
                  <p className="text-sm text-muted-foreground">
                    ${service.previous_cost?.toLocaleString()} → ${service.current_cost?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-500">+{service.growth_rate}%</p>
                  <p className="text-sm text-muted-foreground">+${service.cost_increase?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            These services are growing faster than average. Consider reviewing their usage patterns.
          </p>
        </Card>
      )}
    </div>
  );
};

// Helper functions for chart data
const getChartData = () => {
  if (!forecastData) return [10, 10, 10, 10, 10, 10, 10]; // Show placeholder bars
  
  switch(selectedTimeframe) {
    case '2days':
      return forecastData.two_days?.predictions?.map((d: any) => d.cost) || [10, 10];
    case '1week':
      return forecastData.one_week?.daily_breakdown?.map((d: any) => d.cost) || Array(7).fill(10);
    case '1month':
      return forecastData.one_month?.weekly_breakdown?.map((w: any) => w.cost) || Array(4).fill(10);
    case '2months':
      return [forecastData.two_months?.month1 || 10, forecastData.two_months?.month2 || 10];
    case '3months':
      return [
        forecastData.three_months?.month1 || 10,
        forecastData.three_months?.month2 || 10,
        forecastData.three_months?.month3 || 10
      ];
    default:
      return Array(7).fill(10);
  }
};

const getChartLabels = () => {
  if (!forecastData) return ['', '', '', '', '', '', ''];
  
  switch(selectedTimeframe) {
    case '2days':
      return ['Day 1', 'Day 2'];
    case '1week':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case '1month':
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    case '2months':
      return ['Month 1', 'Month 2'];
    case '3months':
      return ['Month 1', 'Month 2', 'Month 3'];
    default:
      return ['', '', '', '', '', '', ''];
  }
};
 

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
            <p className="text-muted-foreground mb-6">
              Connect GitHub repositories to track deployment events
            </p>
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
                value={selectedRepoId || ''}
                onChange={(e) => fetchDeployments(Number(e.target.value))}
                className="w-full max-w-md px-3 py-2 bg-card border border-border rounded-lg text-sm"
              >
                <option value="">Select a repository...</option>
                {connectedRepos.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.repo_full_name}
                  </option>
                ))}
              </select>
            </div>

            {deployments.length === 0 && selectedRepoId && (
              <div className="text-center py-8 text-muted-foreground">
                <GitMerge className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No deployment events found for this repository</p>
                <p className="text-sm mt-2">Make sure webhooks are configured correctly</p>
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
                          {deployment.is_correlated && (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                              Correlated with cost spike
                            </span>
                          )}
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
                        {deployment.cost_impact && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Estimated cost impact: </span>
                            <span className="font-semibold text-red-600">${deployment.cost_impact.toFixed(2)}</span>
                          </div>
                        )}
                        {deployment.files_changed.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Files changed ({deployment.files_changed.length})
                            </summary>
                            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                              {deployment.files_changed.map((file, idx) => (
                                <div key={idx} className="text-xs font-mono text-muted-foreground">
                                  {file}
                                </div>
                              ))}
                            </div>
                          </details>
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
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-72 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-4">
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
                        const newId = Number(e.target.value);
                        setAccountId(newId);
                        // Force refresh data when account changes
                        if (selectedMenu === "overview") {
                          fetchCostAnalytics();
                        }
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
                              {account.aws_account_id || account.aws_account_id  || 'Unknown'} {account.status === 'connected' ? "✓" : "⏳"}
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

            {/* Menu items */}
            <div className="space-y-1">
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

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {accountName}
                </h1>
                <p className="text-muted-foreground">Detailed cost insights and optimization recommendations</p>
              </div>
              {selectedMenu !== "connect" && accountId && selectedMenu !== "github" && selectedMenu !== "deployments" && (
                <div className="flex gap-2">
                  <button
                    onClick={refreshAnalytics}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
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
                  {isConnectionSuccess ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error" />
                  )}
                  <span className={isConnectionSuccess ? "text-success" : "text-error"}>
                    {status}
                  </span>
                </div>
              </div>
            )}

            {connectionStatus && (
              <div className={`p-4 rounded-lg ${isConnectionSuccess ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="flex items-center gap-2">
                  {isConnectionSuccess ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error" />
                  )}
                  <span className={isConnectionSuccess ? "text-success" : "text-error"}>
                    {connectionStatus}
                  </span>
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

             {selectedMenu === "forecast" && accountId && renderForecastSection()}

             {/* AI Recommendations Section */}
            {selectedMenu === "rightsizing" && accountId && renderAIRecommendationsSection()}

   {selectedMenu === "storage" && accountId && (
  <div className="space-y-6">
    {/* Header with buttons */}
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Storage Optimization</h2>
        <p className="text-muted-foreground">Find unattached volumes, idle databases, unused IPs, old snapshots, duplicate backups, and unused AMIs</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={clearStorageCache}
          disabled={storageScanning}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          title="Clear all cached storage data"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cache
        </button>
        <button
          onClick={() => runStorageScan(false)}
          disabled={storageScanning}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          <Database className="w-4 h-4" />
          Load Cached
        </button>
        <button
          onClick={() => runStorageScan(true)}
          disabled={storageScanning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {storageScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {storageScanning ? 'Scanning...' : 'Scan AWS Now'}
        </button>
      </div>
    </div>

    {/* Cache info banner */}
    {storageResults && (storageResults as any).cached && (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Results from database cache. Click "Scan AWS Now" for fresh data or "Clear Cache" to delete.</span>
        </div>
        <button
          onClick={clearStorageCache}
          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
        >
          Clear
        </button>
      </div>
    )}

    {/* Loading state */}
    {storageScanning && !storageResults && (
      <Card className="p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Scanning AWS Resources...</h3>
        <p className="text-muted-foreground">Checking EBS volumes, RDS, Elastic IPs, Snapshots, Duplicates, and AMIs</p>
      </Card>
    )}

    {/* Results */}
    {storageResults && (
      <>
        {/* Summary Cards - 7 cards for all features */}
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

        {/* Tabs */}
        <div className="flex gap-1 border-b flex-wrap">
          <button 
            onClick={() => setStorageActiveTab('optimizations')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'optimizations' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔧 Findings ({storageResults.total_findings})
          </button>
          <button 
            onClick={() => setStorageActiveTab('ebs')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'ebs' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💾 EBS ({storageResults.ebs_volumes?.total || 0})
          </button>
          <button 
            onClick={() => setStorageActiveTab('elastic_ips')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'elastic_ips' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🌐 Elastic IPs ({storageResults.elastic_ips?.total || 0})
          </button>
          <button 
            onClick={() => setStorageActiveTab('rds')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'rds' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🗄️ RDS ({storageResults.rds_instances?.total || 0})
          </button>
          <button 
            onClick={() => setStorageActiveTab('snapshots')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'snapshots' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📸 Snapshots ({storageResults.snapshots?.total || 0})
          </button>
          <button 
            onClick={() => setStorageActiveTab('amis')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'amis' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🖼️ AMIs ({storageResults.unused_amis?.count || 0})
          </button>
          <button 
            onClick={() => setStorageActiveTab('duplicates')} 
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              storageActiveTab === 'duplicates' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔄 Duplicates ({storageResults.duplicate_snapshots?.count || 0})
          </button>
        </div>

        {/* TAB 1: OPTIMIZATIONS (FINDINGS) */}
        {storageActiveTab === 'optimizations' && (
          <div className="space-y-6">
            {/* Unattached EBS Volumes */}
            {storageResults.ebs_volumes?.unattached_volumes?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Unattached EBS Volumes ({storageResults.ebs_volumes.unattached_volumes.length})
                </h3>
                <div className="space-y-2">
                  {storageResults.ebs_volumes.unattached_volumes.map((vol: any, i: number) => (
                    <Card key={i} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm font-semibold">{vol.volume_id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {vol.size_gb} GB • {vol.volume_type} • {vol.region}
                          </p>
                          <p className="text-xs text-yellow-600 mt-2">⚠️ Not attached to any EC2 instance</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold text-lg">${vol.monthly_cost}/month</p>
                          <p className="text-xs text-muted-foreground">wasted</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Unused Elastic IPs */}
            {storageResults.elastic_ips?.unused > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Unused Elastic IPs ({storageResults.elastic_ips?.unused})
                </h3>
                <div className="space-y-2">
                  {storageResults.elastic_ips?.items?.filter((ip: any) => !ip.is_associated).map((ip: any, i: number) => (
                    <Card key={i} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm font-semibold">{ip.public_ip}</p>
                          <p className="text-xs text-muted-foreground mt-1">Allocation ID: {ip.allocation_id?.substring(0, 20)}...</p>
                          <p className="text-xs text-yellow-600 mt-2">⚠️ Not associated with any resource</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">~$3.65/month</p>
                          <p className="text-xs text-muted-foreground">wasted</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Idle RDS Instances */}
            {storageResults.idle_rds_instances?.items?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Idle RDS Instances ({storageResults.idle_rds_instances.items.length})
                </h3>
                <div className="space-y-2">
                  {storageResults.idle_rds_instances.items.map((rds: any, i: number) => (
                    <Card key={i} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{rds.instance_id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rds.instance_class} • {rds.avg_cpu}% CPU avg • {rds.storage_gb} GB storage
                          </p>
                          <p className="text-xs text-yellow-600 mt-2">⚠️ Very low CPU utilization</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold text-lg">${rds.monthly_cost}/month</p>
                          <p className="text-xs text-muted-foreground">potential savings</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Old Snapshots */}
            {storageResults.snapshots?.old > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Old Snapshots (&gt;30 days) ({storageResults.snapshots?.old})
                </h3>
                <div className="space-y-2">
                  {storageResults.snapshots?.items?.filter((s: any) => s.age_days > 30).slice(0, 10).map((snap: any, i: number) => (
                    <Card key={i} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-xs">{snap.snapshot_id?.substring(0, 40)}...</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {snap.volume_size} GB • {snap.age_days} days old
                          </p>
                          <p className="text-xs text-yellow-600 mt-2">⚠️ Older than 30 days</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">${snap.monthly_cost?.toFixed(2)}/month</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Unused AMIs */}
            {storageResults.unused_amis?.items?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Unused AMIs ({storageResults.unused_amis.items.length})
                </h3>
                <div className="space-y-2">
                  {storageResults.unused_amis.items.map((ami: any, i: number) => (
                    <Card key={i} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{ami.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ami.ami_id} • {ami.age_days} days old • {ami.volume_size_gb} GB
                          </p>
                          <p className="text-xs text-yellow-600 mt-2">⚠️ Not used by any EC2 instance</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">${ami.monthly_cost}/month</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate Snapshots */}
            {storageResults.duplicate_snapshots?.items?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Duplicate Snapshots ({storageResults.duplicate_snapshots.items.length})
                </h3>
                <div className="space-y-2">
                  {storageResults.duplicate_snapshots.items.map((dup: any, i: number) => (
                    <Card key={i} className="p-4 border-l-4 border-l-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm">Volume: {dup.volume_id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dup.total_snapshots} total snapshots, {dup.redundant_count} redundant • {dup.total_size_gb} GB
                          </p>
                          <p className="text-xs text-orange-600 mt-2">⚠️ Keeping more than 2-3 snapshots is redundant</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">${dup.monthly_cost}/month</p>
                          <p className="text-xs text-muted-foreground">wasted</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No findings */}
            {storageResults.total_findings === 0 && (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">No Issues Found!</h3>
                <p className="text-muted-foreground">All your resources are optimally configured.</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: EBS VOLUMES */}
        {storageActiveTab === 'ebs' && (
          <div className="space-y-2">
            {storageResults.ebs_volumes?.items?.length > 0 ? (
              storageResults.ebs_volumes.items.map((vol: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-500" />
                        <span className="font-mono text-sm font-semibold">{vol.volume_id}</span>
                        {!vol.is_attached && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 px-2 py-0.5 rounded-full">Unattached</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">{vol.size_gb} GB</span>
                        <span className="text-muted-foreground">{vol.volume_type}</span>
                        <span className="text-muted-foreground">{vol.state}</span>
                        <span className="text-red-600 font-semibold">${vol.monthly_cost?.toFixed(2)}/mo</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No EBS volumes found</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: ELASTIC IPS */}
        {storageActiveTab === 'elastic_ips' && (
          <div className="space-y-2">
            {storageResults.elastic_ips?.items?.length > 0 ? (
              storageResults.elastic_ips.items.map((ip: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="font-mono text-sm font-semibold">{ip.public_ip}</span>
                        {!ip.is_associated && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 px-2 py-0.5 rounded-full">Unused</span>
                        )}
                        {ip.is_associated && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 px-2 py-0.5 rounded-full">In Use</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{ip.allocation_id}</p>
                    </div>
                    <div className="text-right">
                      {!ip.is_associated && (
                        <p className="text-red-600 font-semibold">~$3.65/month</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No Elastic IPs found</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 4: RDS INSTANCES */}
        {storageActiveTab === 'rds' && (
          <div className="space-y-2">
            {storageResults.rds_instances?.items?.length > 0 ? (
              storageResults.rds_instances.items.map((inst: any, i: number) => {
                const isIdle = storageResults.idle_rds_instances?.items?.some((r: any) => r.instance_id === inst.instance_id);
                return (
                  <Card key={i} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold">{inst.instance_id}</span>
                          {isIdle && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 px-2 py-0.5 rounded-full">Idle (&lt;10% CPU)</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">{inst.engine}</span>
                          <span className="text-muted-foreground">{inst.instance_class}</span>
                          <span className="text-muted-foreground">{inst.storage_gb} GB</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          inst.status === 'available' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
                        }`}>
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No RDS instances found</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 5: SNAPSHOTS */}
        {storageActiveTab === 'snapshots' && (
          <div className="space-y-2">
            {storageResults.snapshots?.items?.length > 0 ? (
              storageResults.snapshots.items.map((snap: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-yellow-500" />
                        <span className="font-mono text-xs">{snap.snapshot_id?.substring(0, 40)}...</span>
                        {snap.age_days > 30 && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 px-2 py-0.5 rounded-full">Old (&gt;30d)</span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">{snap.volume_size} GB</span>
                        <span className="text-muted-foreground">{snap.age_days} days old</span>
                        <span className="text-red-600 font-semibold">${snap.monthly_cost?.toFixed(2)}/mo</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No snapshots found</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 6: UNUSED AMIs */}
        {storageActiveTab === 'amis' && (
          <div className="space-y-2">
            {storageResults.unused_amis?.items?.length > 0 ? (
              storageResults.unused_amis.items.map((ami: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-sm">{ami.name}</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="font-mono text-xs">{ami.ami_id}</span>
                        <span className="text-muted-foreground">{ami.age_days} days old</span>
                        <span className="text-muted-foreground">{ami.volume_size_gb} GB</span>
                        <span className="text-red-600 font-semibold">${ami.monthly_cost}/mo</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No unused AMIs found</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 7: DUPLICATE SNAPSHOTS */}
        {storageActiveTab === 'duplicates' && (
          <div className="space-y-3">
            {storageResults.duplicate_snapshots?.items?.length > 0 ? (
              storageResults.duplicate_snapshots.items.map((dup: any, i: number) => (
                <Card key={i} className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-orange-500" />
                        <span className="font-mono text-sm font-semibold">Volume: {dup.volume_id}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">{dup.total_snapshots} total snapshots</p>
                        <p className="text-sm text-yellow-600">{dup.redundant_count} redundant snapshots can be deleted</p>
                        <p className="text-xs text-muted-foreground">Total wasted: {dup.total_size_gb} GB</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-bold text-lg">${dup.monthly_cost}/month</p>
                      <p className="text-xs text-muted-foreground">wasted</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No duplicate snapshots found</p>
              </Card>
            )}
          </div>
        )}
      </>
    )}

    {/* No account connected state */}
    {!accountId && (
      <Card className="p-12 text-center">
        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No AWS Account Selected</h3>
        <p className="text-muted-foreground">Select or connect an AWS account to scan for storage optimizations</p>
      </Card>
    )}
  </div>
)}

            {/* GitHub Integration Section */}
            {selectedMenu === "github" && renderGitHubSection()}
            
            {/* Deployments Section */}
            {selectedMenu === "deployments" && renderDeploymentsSection()}

            {/* Existing sections continue here... */}
            {selectedMenu === "services" && accountId && (
              <div className="space-y-6">
                
                {accountId && <LowLevelServicesComponent accountId={accountId} />}
                 <AILowLevelRecommendations accountId={accountId} />
              </div>
            )}

            {selectedMenu === "resources" && accountId && (
  <div className="space-y-6">
    {/* Paid Resources Section */}
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Paid Resources Overview</h3>
          <p className="text-muted-foreground">
            All AWS resources that can incur charges, categorized by cost impact
          </p>
        </div>
        <button
          onClick={fetchPaidResources}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading resource data...</span>
        </div>
      ) : paidResources && Object.keys(paidResources.cost_categories).length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <Server className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{paidResources.summary?.total_paid_resources || 0}</p>
              <p className="text-sm text-muted-foreground">Total Paid Resources</p>
            </Card>
            <Card className="p-4 text-center bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold text-red-600">{paidResources.summary?.high_cost_resources || 0}</p>
              <p className="text-sm text-muted-foreground">High Cost (&gt;$50/mo)</p>
            </Card>
            <Card className="p-4 text-center bg-yellow-50 dark:bg-yellow-950/20">
              <Activity className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{paidResources.summary?.medium_cost_resources || 0}</p>
              <p className="text-sm text-muted-foreground">Medium Cost ($10-$50/mo)</p>
            </Card>
            <Card className="p-4 text-center bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-600">{paidResources.summary?.low_cost_resources || 0}</p>
              <p className="text-sm text-muted-foreground">Low Cost (&lt;$10/mo)</p>
            </Card>
          </div>

          {/* Resource Categories Grid */}
          <h4 className="text-lg font-semibold text-foreground mb-4">
            Resource Categories ({Object.keys(paidResources.cost_categories).length} categories found)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(paidResources.cost_categories).map(([key, category]: [string, any]) => (
              <Card key={key} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`p-4 ${
                  category.cost_level === 'HIGH' ? 'bg-red-50 dark:bg-red-950/20' : 
                  category.cost_level === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-950/20' : 
                  'bg-green-50 dark:bg-green-950/20'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-foreground">{category.name}</h5>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                        category.cost_level === 'HIGH' ? 'bg-red-200 text-red-800' :
                        category.cost_level === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {category.cost_level} COST
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">${category.estimated_monthly_cost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resources:</span>
                      <span className="font-medium text-foreground">{category.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost Driver:</span>
                      <span className="font-medium text-foreground truncate max-w-[180px]" title={category.cost_driver}>
                        {category.cost_driver}
                      </span>
                    </div>
                  </div>
                  {category.resources && category.resources.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-sm text-primary cursor-pointer hover:underline">
                        View {category.count} resource{category.count !== 1 ? 's' : ''}
                      </summary>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                        {category.resources.slice(0, 10).map((resource: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-muted/30 rounded flex justify-between">
                            <span className="font-mono">{resource.resource_id}</span>
                            <span className="font-semibold text-primary">${resource.amount.toFixed(2)}/mo</span>
                          </div>
                        ))}
                        {category.resources.length > 10 && (
                          <p className="text-center text-xs text-muted-foreground pt-1">
                            + {category.resources.length - 10} more resources
                          </p>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No Paid Resource Data</h4>
          <p className="text-muted-foreground mb-6">
            Paid resource data is not available. Sync your AWS account to discover resources.
          </p>
          <button onClick={refreshAnalytics} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">
            Sync Account Data
          </button>
        </div>
      )}
    </Card>

    
  </div>
)}

            {selectedMenu === "overview" && accountId && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total AWS Spend (Last 90 Days)</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${providerData.total_spend.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
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
                          <span className="text-sm text-error">
                            +{Math.min(providerData.monthly_change, 1000).toFixed(1)}% vs last month
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-success" />
                          <span className="text-sm text-success">
                            {providerData.monthly_change.toFixed(1)}% vs last month
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                  
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Yesterday's Spend</p>
                        <p className="text-3xl font-bold text-foreground">
                          ${providerData.today_spend.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      {getYesterday()} • AWS bills with 1-day delay
                    </p>
                  </Card>

                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">This Month ({providerData.current_month_name || 'Current'})</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${providerData.current_month_spend.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
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
<Card className="p-6">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h3 className="text-lg font-semibold text-foreground">Last 7 Days Spend</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Daily actual spends (AWS reports with 1-day delay)
      </p>
    </div>
    {providerData.daily_spend.length > 0 && (
      <div className="text-right">
        <p className="text-sm text-muted-foreground">7-Day Total</p>
        <p className="text-xl font-bold text-primary">
          ${providerData.daily_spend.reduce((sum, day) => sum + (parseFloat(day.amount) || 0), 0).toFixed(2)}
        </p>
      </div>
    )}
  </div>
  
  {providerData.daily_spend.length > 0 ? (
    <div className="space-y-6">
      {/* Vertical Bar Chart */}
      <div className="relative h-80 w-full">
        {(() => {
          // Get amounts and calculate max
          const amounts = providerData.daily_spend.map(d => parseFloat(d.amount) || 0);
          const maxAmount = Math.max(...amounts, 0.01);
          
          return (
            <>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-14 flex flex-col justify-between text-xs text-muted-foreground">
                <div className="text-right pr-2">${maxAmount.toFixed(2)}</div>
                <div className="text-right pr-2">${(maxAmount * 0.75).toFixed(2)}</div>
                <div className="text-right pr-2">${(maxAmount * 0.5).toFixed(2)}</div>
                <div className="text-right pr-2">${(maxAmount * 0.25).toFixed(2)}</div>
                <div className="text-right pr-2">$0.00</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-14 right-0 top-0 bottom-8 pointer-events-none">
                <div className="h-full flex flex-col justify-between">
                  <div className="border-t border-border/40"></div>
                  <div className="border-t border-border/40"></div>
                  <div className="border-t border-border/40"></div>
                  <div className="border-t border-border/40"></div>
                  <div className="border-t border-border/40"></div>
                </div>
              </div>
              
              {/* Bars */}
              {/* Bars - Clean version without percentage labels */}
<div className="absolute left-14 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
  {providerData.daily_spend.map((day, i) => {
    const amount = parseFloat(day.amount) || 0;
    const barHeight = amount === 0 ? 4 : (amount / maxAmount) * 100;
    
    let barColor = "bg-gradient-to-t from-blue-500 to-blue-400";
    if (amount === 0) barColor = "bg-gray-300 dark:bg-gray-700";
    else if (amount === maxAmount) barColor = "bg-gradient-to-t from-purple-600 to-purple-500";
    else if (amount > maxAmount * 0.6) barColor = "bg-gradient-to-t from-red-500 to-red-400";
    else if (amount > maxAmount * 0.3) barColor = "bg-gradient-to-t from-orange-500 to-orange-400";
    else if (amount > 0) barColor = "bg-gradient-to-t from-green-500 to-green-400";
    
    return (
      <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
        {/* Value label above bar - always visible on hover */}
        <div className="text-xs font-bold mb-2 text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 px-2 py-0.5 rounded">
          ${amount.toFixed(2)}
        </div>
        
        {/* Bar container */}
        <div className="relative w-full flex justify-center h-full">
          <div 
            className={`absolute bottom-0 w-12 rounded-t-lg transition-all duration-700 ease-out ${barColor} group-hover:opacity-90 cursor-pointer shadow-md`}
            style={{ 
              height: `${barHeight}%`,
              minHeight: amount > 0 ? '4px' : '2px'
            }}
          />
        </div>
        
        {/* Day label */}
        <div className="mt-3 text-center w-full">
          <div className="text-sm font-semibold text-foreground">
            {getFullDateDisplay(day.date)}
          </div>
          <div className="text-xs text-muted-foreground">
            {getDayNameFromDate(day.date)}
          </div>
          {amount === 0 && (
            <div className="text-xs text-muted-foreground mt-1">$0.00</div>
          )}
        </div>
      </div>
    );
  })}
</div>
            </>
          );
        })()}
      </div>
      
      {/* Stats Cards */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
  {(() => {
    const amounts = providerData.daily_spend.map(d => {
      const val = typeof d.amount === 'number' ? d.amount : Number(d.amount) || 0;
      return val;
    });
    const lowest = amounts.length > 0 ? Math.min(...amounts) : 0;
    const highest = amounts.length > 0 ? Math.max(...amounts) : 0;
    const average = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const total = amounts.reduce((a, b) => a + b, 0);
    
    // Find days with lowest and highest amounts
    const lowestDay = providerData.daily_spend.find(d => {
      const val = typeof d.amount === 'number' ? d.amount : Number(d.amount) || 0;
      return val === lowest;
    });
    const highestDay = providerData.daily_spend.find(d => {
      const val = typeof d.amount === 'number' ? d.amount : Number(d.amount) || 0;
      return val === highest;
    });
    
    return (
      <>
        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Lowest Day</p>
          <p className="text-lg font-bold text-green-600">${lowest.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {lowestDay?.date || '-'}
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Daily Average</p>
          <p className="text-lg font-bold text-blue-600">${average.toFixed(2)}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Highest Day</p>
          <p className="text-lg font-bold text-orange-600">${highest.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {highestDay?.date || '-'}
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Total Week</p>
          <p className="text-lg font-bold text-purple-600">${total.toFixed(2)}</p>
        </div>
      </>
    );
  })()}
</div>
      {/* Trend indicator */}
      <div className="flex items-center justify-center gap-4 pt-2 text-sm">
        {(() => {
          const amounts = providerData.daily_spend.map(d => parseFloat(d.amount) || 0);
          const firstHalf = amounts.slice(0, 3).reduce((a, b) => a + b, 0);
          const secondHalf = amounts.slice(4, 7).reduce((a, b) => a + b, 0);
          const trend = secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'stable';
          const trendPercent = firstHalf > 0 ? Math.abs(((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1) : 0;
          
          return (
            <>
              <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-muted-foreground'}`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                <span>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} 
                  {trendPercent}% vs previous week
                </span>
              </div>
              <div className="text-muted-foreground">
                📊 Daily average: ${(amounts.reduce((a, b) => a + b, 0) / 7).toFixed(2)}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  ) : (
    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground p-8">
      {loading ? (
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mb-3 mx-auto text-primary" />
          <p className="text-foreground/80">Loading daily spend data...</p>
          <p className="text-sm text-muted-foreground mt-1">Fetching from AWS Cost Explorer</p>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
              <DollarSign className="w-10 h-10 text-primary/40" />
            </div>
            <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-pulse"></div>
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">No Daily Data Available</h4>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Connect and sync your AWS account to see daily cost trends
          </p>
          <div className="flex gap-3">
            <button onClick={() => setSelectedMenu("connect")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium">
              Connect Account
            </button>
            {accountId && (
              <button onClick={refreshAnalytics} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition font-medium">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Sync Data
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )}
</Card>
                {selectedAccount?.updated_at && (
                  <div className="text-sm text-muted-foreground text-center">
                    Last updated: {new Date(selectedAccount.updated_at).toLocaleString()}
                  </div>
                )}
              </>
            )}

            {/* Idle Resources Section */}
{/* Idle Resources Section - Redesigned without tabs */}
{selectedMenu === "idle" && accountId && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Idle Resources Detection</h2>
        <p className="text-muted-foreground">
          Identify idle EC2 instances, Auto Scaling Groups, Load Balancers, Lambda functions, ECS services, NAT Gateways, VPC Endpoints, API Gateways, and CloudWatch resources
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={clearIdleResultsCache}
          disabled={idleScanning}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          title="Clear all cached idle resource data"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cache
        </button>
        <button
          onClick={() => scanAllIdleResources(false)}
          disabled={idleScanning}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          {idleScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          Load Cached
        </button>
        <button
          onClick={() => scanAllIdleResources(true)}
          disabled={idleScanning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {idleScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {idleScanning ? 'Scanning...' : 'Force Refresh'}
        </button>
      </div>
    </div>

    {/* Cache info banner */}
    {idleResults?.cached && (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Results from database cache. Click "Force Refresh" for fresh data or "Clear Cache" to delete.</span>
        </div>
        <button
          onClick={clearIdleResultsCache}
          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
        >
          Clear
        </button>
      </div>
    )}

    {/* Loading State */}
    {idleScanning && !idleResults && (
      <Card className="p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Scanning All Resources...</h3>
        <p className="text-muted-foreground">Checking EC2, ASG, Load Balancers, Lambda, ECS, NAT, VPC Endpoints, API Gateway, and CloudWatch</p>
      </Card>
    )}

    {/* No Results State */}
    {!idleScanning && !idleResults && (
      <Card className="p-12 text-center">
        <Power className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Idle Resources Data</h3>
        <p className="text-muted-foreground mb-6">Click "Force Refresh" to start scanning for idle resources</p>
        <button
          onClick={() => scanAllIdleResources(true)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
        >
          Start Scan
        </button>
      </Card>
    )}

    {/* Results Display */}
    {idleResults && (
      <div className="space-y-6">
        {/* Summary Cards */}
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

        {/* EC2 INSTANCES SECTION */}
        {idleResults.ec2_instances?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Cpu className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">EC2 Instances</h3>
              <span className="text-sm text-muted-foreground">({idleResults.ec2_instances.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.ec2_instances.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.ec2_instances.items.map((instance: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{instance.instance_name}</span>
                        <span className="text-xs text-muted-foreground font-mono">({instance.instance_id})</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-full">{instance.instance_type}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">CPU Avg:</span> <span className="font-medium text-red-600">{instance.cpu_avg}%</span></div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${instance.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {instance.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AUTO SCALING GROUPS SECTION */}
        {idleResults.auto_scaling_groups?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Activity className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-foreground">Auto Scaling Groups</h3>
              <span className="text-sm text-muted-foreground">({idleResults.auto_scaling_groups.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.auto_scaling_groups.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.auto_scaling_groups.items.map((asg: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{asg.asg_name}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">Desired:</span> {asg.desired_capacity}</div>
                        <div><span className="text-muted-foreground">Current:</span> {asg.current_instances}</div>
                        <div><span className="text-muted-foreground">Min/Max:</span> {asg.min_size}/{asg.max_size}</div>
                        <div><span className="text-muted-foreground">CPU Avg:</span> <span className="font-medium text-red-600">{asg.avg_cpu}%</span></div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${asg.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {asg.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* LOAD BALANCERS SECTION */}
        {idleResults.load_balancers?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Scale className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Load Balancers</h3>
              <span className="text-sm text-muted-foreground">({idleResults.load_balancers.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.load_balancers.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.load_balancers.items.map((lb: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{lb.lb_name}</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-full">{lb.lb_type}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">Requests:</span> {lb.total_requests?.toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Data:</span> {lb.processed_gb} GB</div>
                        <div><span className="text-muted-foreground">Healthy/Total:</span> {lb.healthy_targets}/{lb.total_targets}</div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${lb.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {lb.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* LAMBDA FUNCTIONS SECTION */}
        {idleResults.lambda_functions?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Code className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-foreground">Lambda Functions</h3>
              <span className="text-sm text-muted-foreground">({idleResults.lambda_functions.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.lambda_functions.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.lambda_functions.items.map((func: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{func.function_name}</span>
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 rounded-full">{func.runtime}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">Memory:</span> {func.memory_mb} MB</div>
                        <div><span className="text-muted-foreground">Invocations:</span> {func.invocations_30d?.toLocaleString()} (30d)</div>
                        <div><span className="text-muted-foreground">Invocations:</span> {func.invocations_7d?.toLocaleString()} (7d)</div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${func.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {func.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ECS SERVICES SECTION */}
        {idleResults.ecs_services?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Container className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">ECS/Fargate Services</h3>
              <span className="text-sm text-muted-foreground">({idleResults.ecs_services.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.ecs_services.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.ecs_services.items.map((service: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{service.service_name}</span>
                        <span className="text-xs text-muted-foreground">Cluster: {service.cluster_name}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">CPU/Memory:</span> {service.cpu}/{service.memory_mb}MB</div>
                        <div><span className="text-muted-foreground">Tasks:</span> {service.running_tasks}/{service.desired_tasks}</div>
                        <div><span className="text-muted-foreground">CPU/Mem Util:</span> {service.cpu_utilization}%/{service.memory_utilization}%</div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${service.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {service.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* NAT GATEWAYS SECTION */}
        {idleResults.nat_gateways?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Network className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">NAT Gateways</h3>
              <span className="text-sm text-muted-foreground">({idleResults.nat_gateways.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.nat_gateways.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.nat_gateways.items.map((nat: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold font-mono text-sm text-foreground">{nat.nat_gateway_id}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">Data:</span> {nat.data_processed_gb} GB</div>
                        <div><span className="text-muted-foreground">Packets:</span> {nat.packets_processed?.toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Connections:</span> {nat.avg_connections}</div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${nat.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-red-600">🔥 {nat.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* VPC ENDPOINTS SECTION */}
        {idleResults.vpc_endpoints?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Key className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-foreground">VPC Endpoints</h3>
              <span className="text-sm text-muted-foreground">({idleResults.vpc_endpoints.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.vpc_endpoints.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.vpc_endpoints.items.map((ep: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold font-mono text-sm text-foreground">{ep.endpoint_id}</span>
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 rounded-full">{ep.endpoint_type}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">Service:</span> {ep.service_name?.split('.')[0]}</div>
                        <div><span className="text-muted-foreground">Packets:</span> {ep.total_packets?.toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${ep.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {ep.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* API GATEWAY SECTION */}
        {idleResults.api_gateways?.items?.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Settings className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-foreground">API Gateway</h3>
              <span className="text-sm text-muted-foreground">({idleResults.api_gateways.count} idle)</span>
              <span className="ml-auto text-sm font-medium text-green-600">Savings: ${idleResults.api_gateways.savings?.toFixed(2)}/month</span>
            </div>
            <div className="space-y-3">
              {idleResults.api_gateways.items.map((api: any, i: number) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{api.api_name}</span>
                        <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 rounded-full">{api.api_type}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                        <div><span className="text-muted-foreground">Requests (30d):</span> {api.total_requests_30d?.toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Requests (7d):</span> {api.requests_7d?.toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Monthly Cost:</span> <span className="font-bold text-red-600">${api.monthly_cost}</span></div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-yellow-600">⚠️ {api.reasons?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CLOUDWATCH RESOURCES SECTION */}
        {(idleResults.cloudwatch?.log_groups?.items?.length > 0 || 
          idleResults.cloudwatch?.alarms?.items?.length > 0 || 
          idleResults.cloudwatch?.dashboards?.items?.length > 0 ||
          idleResults.cloudwatch?.metrics?.items?.length > 0) && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Eye className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-semibold text-foreground">CloudWatch Resources</h3>
            </div>
            
            {/* Log Groups */}
            {idleResults.cloudwatch?.log_groups?.items?.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-foreground">📋 Log Groups ({idleResults.cloudwatch.log_groups.items.length})</h4>
                  <span className="text-sm text-green-600">Savings: ${idleResults.cloudwatch.log_groups.savings?.toFixed(2)}/month</span>
                </div>
                <div className="space-y-2">
                  {idleResults.cloudwatch.log_groups.items.slice(0, 5).map((lg: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-mono text-sm">{lg.log_group_name}</p>
                          <p className="text-xs text-muted-foreground">{lg.stored_gb} GB • {lg.days_since_last_log} days since last log</p>
                          <p className="text-xs text-yellow-600 mt-1">{lg.reasons?.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">${lg.monthly_cost}/month</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {idleResults.cloudwatch.log_groups.items.length > 5 && (
                    <p className="text-center text-xs text-muted-foreground pt-1">
                      + {idleResults.cloudwatch.log_groups.items.length - 5} more log groups
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Alarms */}
            {idleResults.cloudwatch?.alarms?.items?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-foreground mb-2">🔔 Alarms ({idleResults.cloudwatch.alarms.items.length})</h4>
                <div className="space-y-2">
                  {idleResults.cloudwatch.alarms.items.slice(0, 5).map((alarm: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-semibold">{alarm.alarm_name}</p>
                          <p className="text-xs text-muted-foreground">State: {alarm.state} • Actions: {alarm.actions_enabled ? 'Enabled' : 'Disabled'}</p>
                          <p className="text-xs text-yellow-600 mt-1">{alarm.reasons?.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">${alarm.monthly_cost}/month</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboards */}
            {idleResults.cloudwatch?.dashboards?.items?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-foreground mb-2">📊 Dashboards ({idleResults.cloudwatch.dashboards.items.length})</h4>
                <div className="space-y-2">
                  {idleResults.cloudwatch.dashboards.items.map((dash: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-semibold">{dash.dashboard_name}</p>
                          <p className="text-xs text-muted-foreground">{dash.days_since_modified} days since modified</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Metrics */}
            {idleResults.cloudwatch?.metrics?.items?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-foreground">📏 Custom Metrics ({idleResults.cloudwatch.metrics.items.length})</h4>
                  <span className="text-sm text-green-600">Savings: ${idleResults.cloudwatch.metrics.savings?.toFixed(2)}/month</span>
                </div>
                <div className="space-y-2">
                  {idleResults.cloudwatch.metrics.items.slice(0, 5).map((metric: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-yellow-500">
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-mono text-sm">{metric.namespace}/{metric.metric_name}</p>
                          <p className="text-xs text-yellow-600 mt-1">{metric.reasons?.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">${metric.monthly_cost}/month</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* No findings message */}
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

            {selectedMenu === "connect" && (
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Connect Your AWS Account
                </h3>
                <p className="text-muted-foreground mb-6">
                  Securely connect your AWS account to monitor cost and resources
                </p>

                {awsAccounts.length > 0 && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {awsAccounts.length} AWS account(s) already connected
                      </span>
                    </div>
                    <p className="text-sm text-success/80 mt-1">
                      Switch to "Overview" tab to view cost analytics
                    </p>
                  </div>
                )}

                <div className="space-y-6 mb-8">
                  {manualInstructions.steps.map((step, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-blue-700 dark:text-blue-300">
                            {index + 1}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg text-foreground">{step.title}</h4>
                      </div>
                      <ul className="space-y-2 ml-11">
                        {step.instructions.map((instruction, i) => {
                          let displayInstruction = instruction
                          if (instruction.includes("026395503692")) {
                            displayInstruction = instruction.replace(
                              "026395503692",
                              `<span class="font-bold text-blue-600">${awsInfo?.platform_account_id || "026395503692"}</span>`
                            )
                          }
                          if (instruction.includes("CloudCostReadOnlyRole")) {
                            displayInstruction = instruction.replace(
                              "CloudCostReadOnlyRole",
                              `<span class="font-bold text-blue-600">${awsInfo?.role_name || "CloudCostReadOnlyRole"}</span>`
                            )
                          }
                          
                          return (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span 
                                className="text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: displayInstruction }}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {awsInfo && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Required Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform AWS Account ID:</span>
                        <code className="font-mono font-bold text-foreground">
                          {awsInfo.platform_account_id}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role Name:</span>
                        <code className="font-mono font-bold text-foreground">
                          {awsInfo.role_name}
                        </code>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-muted-foreground">Permissions included:</span>
                        <p className="text-sm text-foreground mt-1">
                          Read-only billing, compute, storage, IAM metadata, and cost explorer access
                        </p>
                      </div>
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
                      "Step 1: Generate External ID"
                    )}
                  </button>
                </div>

                {externalId && (
                  <div className="mb-8 space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Step 2: Copy External ID</h4>
                      <div className="relative">
                        <code className="block p-4 bg-muted rounded-lg text-sm font-mono break-all">
                          {externalId}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(externalId)
                            setStatus("External ID copied to clipboard!")
                            setIsConnectionSuccess(true)
                            setTimeout(() => setStatus(''), 2000)
                          }}
                          className="absolute top-2 right-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This External ID is required when creating the IAM role in AWS
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Step 3: Copy Policy JSON</h4>
                      <div className="relative">
                        <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-60">
                          {policyJson}
                        </pre>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(policyJson)
                            setStatus("Policy JSON copied to clipboard!")
                            setIsConnectionSuccess(true)
                            setTimeout(() => setStatus(''), 2000)
                          }}
                          className="absolute top-2 right-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        Important Notes
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                        <li>• Complete all 4 steps in the AWS Console before proceeding</li>
                        <li>• The External ID ensures secure cross-account access</li>
                        <li>• The policy provides read-only access only</li>
                        <li>• After creating the role, AWS will provide a Role ARN</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    Step 4: Enter Role ARN
                  </h4>
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
                  <p className="text-sm text-muted-foreground mt-3">
                    Paste the Role ARN exactly as shown in AWS IAM Console
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Need Help?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ensure you have IAM permissions to create roles in your AWS account</li>
                    <li>• Verify the External ID matches exactly</li>
                    <li>• Check that the trust relationship includes Account ID: {awsInfo?.platform_account_id || "026395503692"}</li>
                    <li>• Make sure the role name is exactly "CloudCostReadOnlyRole"</li>
                  </ul>
                </div>
              </Card>
            )}

            {!["overview", "connect", "services", "resources", "github", "deployments", "forecast", "rightsizing", "storage", "idle"].includes(selectedMenu) && (
              <Card>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {menuItems.find((m) => m.id === selectedMenu)?.label}
                  </h3>
                  <p className="text-muted-foreground">This feature is coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect your AWS account to access detailed cost analytics
                  </p>
                </div>
              </Card>
            )}

            {selectedMenu === "overview" && !accountId && awsAccounts.length === 0 && (
              <Card>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No AWS Account Connected
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Connect an AWS account to view cost analytics and insights
                  </p>
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

// At the very bottom of your file, replace the entire LowLevelServicesComponent with this:

const LowLevelServicesComponent: React.FC<{ accountId: number | null }> = ({ accountId: propAccountId }) => {
  const [data, setData] = useState<LowLevelServicesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    categories: [] as string[],
    regions: [] as string[],
    minCost: 0,
    maxCost: Infinity
  });
  const [selectedService, setSelectedService] = useState<LowLevelServiceCategoryData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [localAccountId, setLocalAccountId] = useState<number | null>(propAccountId);
  const [accounts, setAccounts] = useState<AwsAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(propAccountId);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [refreshInProgress, setRefreshInProgress] = useState(false);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': token ? `Token ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchAccounts = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/aws/accounts/`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      // Handle both response formats
      let accountsArray = [];
      if (data.accounts && Array.isArray(data.accounts)) {
        accountsArray = data.accounts;
      } else if (Array.isArray(data)) {
        accountsArray = data;
      }
      
      setAccounts(accountsArray);
      
      if (accountsArray.length > 0 && !selectedAccountId && !propAccountId) {
        setSelectedAccountId(accountsArray[0].id);
        setLocalAccountId(accountsArray[0].id);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

 const fetchServicesFast = async (accountIdToUse: number, forceRefresh: boolean = false) => {
  if (!accountIdToUse) {
    console.error('No account ID provided');
    setError('No AWS account selected');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    const endpoint = forceRefresh 
      ? `${API_BASE_URL}/api/aws/accounts/${accountIdToUse}/low-level-services-refresh/`
      : `${API_BASE_URL}/api/aws/accounts/${accountIdToUse}/low-level-services-fast/`;
    
    console.log(`Fetching low-level services from: ${endpoint}`);
    
    const response = await fetch(endpoint, { 
      headers: getAuthHeaders()
    });

    if (response.status === 401 || response.status === 403) {
      setError('Authentication failed. Please log in again.');
      setLoading(false);
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch low-level services: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Received data:', result);
    
    if (result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format');
    }
    
    setData(result);
    setInitialFetchDone(true);
    
    if (result.services_by_category) {
      try {
        const entries = Object.entries(result.services_by_category);
        const validEntries = entries.filter(([_, a]) => {
          const category = a as LowLevelServiceCategoryData;
          return category && typeof category.total_monthly_cost === 'number' && !isNaN(category.total_monthly_cost);
        });
        
        const topCategories = validEntries
          .sort(([, a], [, b]) => {
            const categoryA = a as LowLevelServiceCategoryData;
            const categoryB = b as LowLevelServiceCategoryData;
            return (categoryB.total_monthly_cost || 0) - (categoryA.total_monthly_cost || 0);
          })
          .slice(0, 3)
          .map(([id]) => id);
        
        setExpandedCategories(new Set(topCategories));
      } catch (err) {
        console.error('Error auto-expanding categories:', err);
      }
    }
    
    if (result.source === 'database') {
      console.log(`✅ Data loaded from database (${result.cached ? 'cached' : 'fresh'})`);
      if (result.scan_duration) {
        console.log(`   Scan took: ${result.scan_duration} seconds`);
      }
    }
    
  } catch (err) {
    console.error('Error fetching services:', err);
    setError(err instanceof Error ? err.message : 'Failed to fetch services');
  } finally {
    setLoading(false);
    setRefreshInProgress(false);
  }
};

  const refreshServices = async () => {
    if (!localAccountId) return;
    setRefreshInProgress(true);
    
    try {
      await fetchServicesFast(localAccountId, true);
    } catch (err) {
      console.error('Error refreshing services:', err);
      setError('Failed to refresh services');
    } finally {
      setRefreshInProgress(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (propAccountId) {
      setLocalAccountId(propAccountId);
      setSelectedAccountId(propAccountId);
      fetchServicesFast(propAccountId, false);
    }
  }, [propAccountId]);

  useEffect(() => {
    if (selectedAccountId && !propAccountId && !initialFetchDone) {
      setLocalAccountId(selectedAccountId);
      fetchServicesFast(selectedAccountId, false);
      setInitialFetchDone(true);
    }
  }, [selectedAccountId, propAccountId]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedAccountId(id);
    setInitialFetchDone(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (data?.services_by_category) {
      try {
        setExpandedCategories(new Set(Object.keys(data.services_by_category)));
      } catch (err) {
        console.error('Error expanding all categories:', err);
      }
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const filteredCategories = () => {
    if (!data?.services_by_category) return [];
    
    try {
      const entries = Object.entries(data.services_by_category);
      
      return entries
        .filter(([_, category]) => {
          const cat = category as LowLevelServiceCategoryData;
          
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matches = 
              (cat.service_info?.name?.toLowerCase() || '').includes(searchLower) ||
              (cat.service_info?.description?.toLowerCase() || '').includes(searchLower) ||
              (cat.category?.toLowerCase() || '').includes(searchLower) ||
              (cat.resources || []).some(r => 
                (r?.resource_name?.toLowerCase() || '').includes(searchLower) ||
                (r?.resource_id?.toLowerCase() || '').includes(searchLower)
              );
            if (!matches) return false;
          }
          
          if (filters.categories.length > 0 && !filters.categories.includes(cat.category)) return false;
          
          if (filters.regions.length > 0) {
            const hasRegion = (cat.resources || []).some(r => 
              r?.region && filters.regions.includes(r.region)
            );
            if (!hasRegion) return false;
          }
          
          const monthlyCost = cat.total_monthly_cost || 0;
          if (monthlyCost < filters.minCost) return false;
          if (monthlyCost > filters.maxCost) return false;
          
          return true;
        })
        .sort(([, a], [, b]) => {
          const catA = a as LowLevelServiceCategoryData;
          const catB = b as LowLevelServiceCategoryData;
          return (catB.total_monthly_cost || 0) - (catA.total_monthly_cost || 0);
        });
    } catch (error) {
      console.error('Error filtering categories:', error);
      return [];
    }
  };
  
  const allCategories = React.useMemo(() => {
    if (!data?.services_by_category) return [];
    
    try {
      const categories = Object.values(data.services_by_category)
        .map(s => {
          const cat = s as LowLevelServiceCategoryData;
          return cat?.category;
        })
        .filter((cat): cat is string => Boolean(cat));
      
      return [...new Set(categories)];
    } catch (err) {
      console.error('Error getting allCategories:', err);
      return [];
    }
  }, [data?.services_by_category]);
  
  const allRegions = React.useMemo(() => {
    if (!data?.all_resources) return [];
    
    try {
      const regions = data.all_resources
        .map(r => r?.region)
        .filter((region): region is string => Boolean(region));
      
      return [...new Set(regions)];
    } catch (err) {
      console.error('Error getting allRegions:', err);
      return [];
    }
  }, [data?.all_resources]);

  const totalMonthlyCost = React.useMemo(() => {
    return typeof data?.summary?.estimated_monthly_cost === 'number' && !isNaN(data.summary.estimated_monthly_cost)
      ? data.summary.estimated_monthly_cost
      : 0;
  }, [data?.summary?.estimated_monthly_cost]);
  
  const totalResources = data?.summary?.total_services ?? 0;
  const uniqueServices = data?.summary?.unique_services_discovered ?? 0;
  const dataSource = data?.source === 'database' ? '📦 Database' : '☁️ AWS API';
  const dataAge = data?.cached ? '(cached)' : '(fresh)';

  useEffect(() => {
    if (data?.services_by_category && !initialFetchDone) {
      try {
        const entries = Object.entries(data.services_by_category);
        const validEntries = entries.filter(([_, a]) => {
          const cat = a as LowLevelServiceCategoryData;
          return cat && typeof cat.total_monthly_cost === 'number' && !isNaN(cat.total_monthly_cost);
        });
        
        const topCategories = validEntries
          .sort(([, a], [, b]) => {
            const catA = a as LowLevelServiceCategoryData;
            const catB = b as LowLevelServiceCategoryData;
            return (catB.total_monthly_cost || 0) - (catA.total_monthly_cost || 0);
          })
          .slice(0, 3)
          .map(([id]) => id);
        
        setExpandedCategories(new Set(topCategories));
      } catch (error) {
        console.error('Error auto-expanding categories:', error);
      }
    }
  }, [data, initialFetchDone]);

  const ServiceIcon = ({ category, className = "w-5 h-5" }: { category: string; className?: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Virtual Private Cloud': <Network className={className} />,
      'Elastic Compute Cloud': <Cpu className={className} />,
      'Simple Storage Service': <HardDrive className={className} />,
      'Relational Database Service': <Database className={className} />,
      'DynamoDB': <Database className={className} />,
      'Lambda': <Cloud className={className} />,
      'Route 53': <Globe className={className} />,
      'CloudFront': <Cloud className={className} />,
      'API Gateway': <Settings className={className} />,
      'Elastic Load Balancing': <Server className={className} />,
      'Identity & Access Management': <Shield className={className} />,
    };
    return iconMap[category] || <Box className={className} />;
  };

  const PricingBadges = ({ service }: { service: LowLevelService }) => {
    if (!service) return null;
    
    const items = [];
    if (service.price_per_hour) items.push(`$${service.price_per_hour}/hour`);
    if (service.price_per_gb_month) items.push(`$${service.price_per_gb_month}/GB-month`);
    if (service.price_per_million) items.push(`$${service.price_per_million}/million`);
    if (service.price_per_gb) items.push(`$${service.price_per_gb}/GB`);
    if (service.price_per_vcpu_hour) items.push(`$${service.price_per_vcpu_hour}/vCPU-hour`);
    if (service.price_per_month) items.push(`$${service.price_per_month}/month`);
    
    if (items.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 3).map((item, idx) => (
          <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
            {item}
          </span>
        ))}
        {items.length > 3 && (
          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
            +{items.length - 3} more
          </span>
        )}
      </div>
    );
  };

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-foreground">Loading Low-Level Services...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Loading from database for fast performance
          </p>
        </div>
      </Card>
    );
  }

  if (!localAccountId && accounts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-foreground">Loading AWS accounts...</p>
        </div>
      </Card>
    );
  }

  if (!localAccountId && accounts.length > 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No AWS Account Selected</h4>
          <p className="text-muted-foreground mb-6">Please select an AWS account to view low-level services</p>
          <div className="max-w-xs mx-auto">
            <label htmlFor="ll-account-select" className="block text-sm font-medium text-muted-foreground mb-2">
              Select AWS Account
            </label>
            <select
              id="ll-account-select"
              title="Select AWS Account for Low-Level Services"
              value={selectedAccountId || ''}
              onChange={handleAccountChange}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select an account...</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_id || account.account_id || 'Unknown'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    );
  }

  const filteredCats = filteredCategories();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Low-Level Services</h3>
          <p className="text-muted-foreground">
            Detailed tracking of AWS low-level services with granular pricing and resource-level visibility
          </p>
          {data && (
            <p className="text-xs text-muted-foreground mt-1">
              {dataSource} {dataAge} • Last updated: {data.summary?.timestamp ? new Date(data.summary.timestamp).toLocaleString() : 'N/A'}
              {data.summary?.scan_duration && ` • Scan: ${data.summary.scan_duration}s`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!propAccountId && accounts.length > 0 && (
            <select
              id="ll-account-select-header"
              title="Select AWS Account for Low-Level Services"
              value={selectedAccountId || ''}
              onChange={handleAccountChange}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_id || account.account_id || 'Unknown'}
                </option>
              ))}
            </select>
          )}
          
          <button 
            onClick={expandAll} 
            disabled={!data?.services_by_category}
            className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            title="Expand all categories"
          >
            Expand All
          </button>
          <button 
            onClick={collapseAll} 
            className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
            title="Collapse all categories"
          >
            Collapse All
          </button>
          <button 
            onClick={refreshServices} 
            disabled={loading || refreshInProgress || !localAccountId} 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {(loading || refreshInProgress) ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search services, resources, or categories..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 pl-10 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border border-border rounded-lg hover:bg-muted transition-colors ${
              showFilters ? 'bg-primary/10 border-primary' : ''
            }`}
            title="Filter"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Categories</label>
                <select
                  multiple
                  value={filters.categories}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    categories: Array.from(e.target.selectedOptions, o => o.value) 
                  })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm"
                  size={4}
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Regions</label>
                <select
                  multiple
                  value={filters.regions}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    regions: Array.from(e.target.selectedOptions, o => o.value) 
                  })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm"
                  size={4}
                >
                  {allRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Min Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minCost || ''}
                  onChange={(e) => setFilters({ ...filters, minCost: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxCost === Infinity ? '' : filters.maxCost}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    maxCost: e.target.value ? Number(e.target.value) : Infinity 
                  })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm"
                  placeholder="No limit"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  search: '',
                  categories: [],
                  regions: [],
                  minCost: 0,
                  maxCost: Infinity
                })}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold text-foreground">
                ${typeof totalMonthlyCost === 'number' && !isNaN(totalMonthlyCost)
                  ? totalMonthlyCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : '0.00'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="text-2xl font-bold text-foreground">{totalResources}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Services</p>
              <p className="text-2xl font-bold text-foreground">{uniqueServices}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regions</p>
              <p className="text-2xl font-bold text-foreground">{allRegions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {allRegions.slice(0, 3).join(', ')}
                {allRegions.length > 3 ? '...' : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {error ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">Unable to Load Services</h4>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => localAccountId && fetchServicesFast(localAccountId, true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : filteredCats.length > 0 ? (
        <div className="space-y-4">
          {filteredCats.map(([serviceId, categoryData]) => {
            const cat = categoryData as LowLevelServiceCategoryData;
            if (!cat || !cat.service_info) return null;
            
            return (
              <Card key={serviceId} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ServiceIcon category={cat.category || ''} className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-foreground">
                          {cat.service_info.name || 'Unknown Service'}
                        </h4>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {cat.category || 'Uncategorized'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {cat.service_info.description || 'No description available'}
                      </p>
                      <PricingBadges service={cat.service_info} />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-foreground">
                      ${typeof cat.total_monthly_cost === 'number' && !isNaN(cat.total_monthly_cost)
                        ? cat.total_monthly_cost.toFixed(2)
                        : '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {cat.total_count || 0} resources
                      </span>
                      <button
                        onClick={() => toggleCategory(serviceId)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {expandedCategories.has(serviceId) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedCategories.has(serviceId) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-foreground">
                        Resources ({cat.resources?.length || 0})
                      </h5>
                      <button
                        onClick={() => {
                          setSelectedService(cat);
                          setModalOpen(true);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(cat.resources || [])
                        .filter(r => r && typeof r.estimated_monthly_cost === 'number' && !isNaN(r.estimated_monthly_cost))
                        .sort((a, b) => (b.estimated_monthly_cost || 0) - (a.estimated_monthly_cost || 0))
                        .slice(0, 5)
                        .map((resource, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">
                                {resource.resource_name || 'Unnamed Resource'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {resource.resource_id || 'No ID'}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-semibold text-foreground">
                                ${(resource.estimated_monthly_cost || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      
                      {cat.resources && cat.resources.length > 5 && (
                        <div className="text-center pt-2">
                          <p className="text-sm text-muted-foreground">
                            + {cat.resources.length - 5} more resources
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No Services Found</h4>
          <p className="text-muted-foreground">
            {filters.search || filters.categories.length > 0 || filters.regions.length > 0
              ? 'Try adjusting your filters'
              : data ? 'No low-level services discovered in this account' : 'Click Refresh to discover services'}
          </p>
          {!data && !loading && (
            <button
              onClick={() => localAccountId && fetchServicesFast(localAccountId, true)}
              className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
            >
              Discover Services
            </button>
          )}
        </div>
      )}

      {modalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {selectedService.service_info?.name || 'Unknown Service'}
                </h3>
                <p className="text-sm text-muted-foreground">{selectedService.category || 'Uncategorized'}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {(selectedService.resources || [])
                  .filter(r => r && typeof r.estimated_monthly_cost === 'number' && !isNaN(r.estimated_monthly_cost))
                  .sort((a, b) => (b.estimated_monthly_cost || 0) - (a.estimated_monthly_cost || 0))
                  .map((resource, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {resource.resource_name || 'Unnamed Resource'}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {resource.resource_id || 'No ID'}
                          </p>
                          <div className="mt-2">
                            <span className="font-bold text-primary">
                              ${(resource.estimated_monthly_cost || 0).toFixed(2)}/month
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(selectedService.total_monthly_cost || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedService.total_count || 0}
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                  Close
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default CostAnalyticsProvider;