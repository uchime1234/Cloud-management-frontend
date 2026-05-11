"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { FileText, Mail, Briefcase, Key, Download, Plus } from "lucide-react"

const mockProjects = [
  { id: 1, name: "Project Alpha", client: "Acme Corp", spend: 12450.5, status: "active" },
  { id: 2, name: "Project Beta", client: "TechStart Inc", spend: 8234.2, status: "active" },
  { id: 3, name: "Project Gamma", client: "Global Solutions", spend: 15678.9, status: "paused" },
]

const mockApiKeys = [
  { id: 1, name: "Production API Key", created: "2024-01-15", lastUsed: "2 hours ago", status: "active" },
  { id: 2, name: "Development API Key", created: "2024-03-20", lastUsed: "5 days ago", status: "active" },
  { id: 3, name: "Legacy API Key", created: "2023-11-01", lastUsed: "30 days ago", status: "inactive" },
]

export const Business: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"exports" | "reports" | "projects" | "api">("exports")

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">Business Features</h1>
          <p className="text-muted-foreground">Reporting, exports, and client management</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {[
              { id: "exports", label: "PDF Exports" },
              { id: "reports", label: "Email Reports" },
              { id: "projects", label: "Projects/Clients" },
              { id: "api", label: "API Keys" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PDF Exports */}
        {activeTab === "exports" && (
          <div className="grid grid-cols-2 gap-4">
            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Monthly Cost Report</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive cost breakdown by service</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>

            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Security Audit Report</h3>
                  <p className="text-sm text-muted-foreground">Detailed security findings and recommendations</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>

            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Resource Inventory</h3>
                  <p className="text-sm text-muted-foreground">Complete list of all cloud resources</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>

            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Optimization Report</h3>
                  <p className="text-sm text-muted-foreground">Cost savings opportunities and recommendations</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
        )}

        {/* Email Reports */}
        {activeTab === "reports" && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Schedule Email Reports</h3>
                <p className="text-sm text-muted-foreground">Automatically send reports to your team</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Report Type</label>
                  <select className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Weekly Cost Summary</option>
                    <option>Monthly Cost Report</option>
                    <option>Security Audit</option>
                    <option>Optimization Recommendations</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
                  <select className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Recipients</label>
                <input
                  type="text"
                  placeholder="email@company.com, team@company.com"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all">
                Schedule Report
              </button>
            </div>
          </Card>
        )}

        {/* Projects/Clients */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            {mockProjects.map((project) => (
              <Card key={project.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">${project.spend.toLocaleString()}</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        project.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* API Keys */}
        {activeTab === "api" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" />
                Generate New Key
              </button>
            </div>

            {mockApiKeys.map((key) => (
              <Card key={key.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Key className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{key.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {key.created} • Last used {key.lastUsed}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        key.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {key.status}
                    </span>
                    <button className="text-sm text-error hover:underline">Revoke</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
