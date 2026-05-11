"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Search, Download, Server, Database, HardDrive, Globe, CheckCircle, AlertTriangle } from "lucide-react"
import type { CloudProvider } from "../types"

const providers: Array<{ id: CloudProvider; name: string; icon: string }> = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "⚡" },
  { id: "gcp", name: "GCP", icon: "🔷" },
]

const mockResources = [
  {
    id: "i-abc123",
    type: "EC2 Instance",
    name: "web-server-01",
    status: "running",
    region: "us-east-1",
    cost: 145.6,
    tags: ["production", "web"],
    optimization: "Consider rightsizing to t3.medium",
  },
  {
    id: "vol-xyz789",
    type: "EBS Volume",
    name: "app-data",
    status: "attached",
    region: "us-east-1",
    cost: 89.2,
    tags: ["production", "database"],
    optimization: null,
  },
  {
    id: "db-prod-001",
    type: "RDS Instance",
    name: "production-db",
    status: "available",
    region: "us-west-2",
    cost: 456.8,
    tags: ["production", "database"],
    optimization: "Enable auto-scaling",
  },
  {
    id: "bucket-assets",
    type: "S3 Bucket",
    name: "app-assets",
    status: "active",
    region: "us-east-1",
    cost: 23.4,
    tags: ["production", "storage"],
    optimization: "Move to Glacier for 40% savings",
  },
  {
    id: "lb-main",
    type: "Load Balancer",
    name: "main-alb",
    status: "active",
    region: "us-east-1",
    cost: 78.9,
    tags: ["production", "networking"],
    optimization: null,
  },
]

const resourceTypeIcons: Record<string, React.ReactNode> = {
  "EC2 Instance": <Server className="w-4 h-4" />,
  "EBS Volume": <HardDrive className="w-4 h-4" />,
  "RDS Instance": <Database className="w-4 h-4" />,
  "S3 Bucket": <HardDrive className="w-4 h-4" />,
  "Load Balancer": <Globe className="w-4 h-4" />,
}

export const Inventory: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>("aws")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredResources = mockResources.filter(
    (resource) =>
      (selectedType === "all" || resource.type === selectedType) &&
      (searchQuery === "" || resource.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const resourceTypes = ["all", ...Array.from(new Set(mockResources.map((r) => r.type)))]

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-foreground">Resource Inventory</h1>
            <p className="text-muted-foreground">Manage and optimize your cloud resources</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Provider Selection */}
        <div className="flex gap-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedProvider === provider.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-xl">{provider.icon}</span>
              {provider.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-muted-foreground mb-1">Total Resources</p>
            <p className="text-2xl font-bold text-foreground">{mockResources.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold text-foreground">
              ${mockResources.reduce((sum, r) => sum + r.cost, 0).toFixed(2)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-2xl font-bold text-success">
              {mockResources.filter((r) => r.status === "running" || r.status === "active").length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground mb-1">Optimization Hints</p>
            <p className="text-2xl font-bold text-warning">{mockResources.filter((r) => r.optimization).length}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    selectedType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-secondary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Resources Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cost/Month</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Optimization</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {resourceTypeIcons[resource.type]}
                        <span className="text-sm text-foreground">{resource.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {resource.status === "running" || resource.status === "active" ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                        <span className="text-sm text-foreground capitalize">{resource.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{resource.region}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">${resource.cost.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {resource.optimization ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{resource.optimization}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No issues</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
