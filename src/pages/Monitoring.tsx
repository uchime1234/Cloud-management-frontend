"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Bell, Mail, Webhook, MessageSquare, Plus, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import type { CloudProvider } from "../types"

const providers: Array<{ id: CloudProvider; name: string; icon: string }> = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "⚡" },
  { id: "gcp", name: "GCP", icon: "🔷" },
]

const integrations = [
  { id: "slack", name: "Slack", icon: <MessageSquare className="w-5 h-5" />, connected: true },
  { id: "email", name: "Email", icon: <Mail className="w-5 h-5" />, connected: true },
  { id: "webhook", name: "Webhooks", icon: <Webhook className="w-5 h-5" />, connected: false },
  { id: "telegram", name: "Telegram", icon: <Bell className="w-5 h-5" />, connected: false },
]

const mockAlerts = [
  {
    id: 1,
    severity: "high",
    title: "High CPU Usage",
    service: "EC2 Instance i-abc123",
    triggered: "2 minutes ago",
    value: "95%",
    threshold: "80%",
  },
  {
    id: 2,
    severity: "medium",
    title: "Unusual Cost Spike",
    service: "Lambda Functions",
    triggered: "15 minutes ago",
    value: "$456",
    threshold: "$200",
  },
  {
    id: 3,
    severity: "low",
    title: "Memory Warning",
    service: "RDS Database",
    triggered: "1 hour ago",
    value: "72%",
    threshold: "70%",
  },
]

export const Monitoring: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>("aws")
  const [activeTab, setActiveTab] = useState<"rules" | "history" | "integrations">("rules")

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
            <h1 className="text-3xl font-bold text-foreground">Monitoring & Alerting</h1>
            <p className="text-muted-foreground">Configure alerts and monitor your infrastructure</p>
          </div>
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

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {[
              { id: "rules", label: "Alert Rules" },
              { id: "history", label: "Alert History" },
              { id: "integrations", label: "Integrations" },
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

        {/* Alert Rules */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" />
                Create Alert Rule
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Cost Threshold</h3>
                    <p className="text-sm text-muted-foreground">Alert when daily spend exceeds limit</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Threshold Amount</label>
                    <input
                      type="number"
                      defaultValue={1000}
                      className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Enabled</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">CPU Usage</h3>
                    <p className="text-sm text-muted-foreground">Alert on high CPU utilization</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">CPU Percentage</label>
                    <input
                      type="number"
                      defaultValue={80}
                      className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Enabled</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Memory Usage</h3>
                    <p className="text-sm text-muted-foreground">Alert on high memory consumption</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Memory Percentage</label>
                    <input
                      type="number"
                      defaultValue={85}
                      className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Enabled</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Idle Resources</h3>
                    <p className="text-sm text-muted-foreground">Alert when resources are idle</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Idle Duration (days)</label>
                    <input
                      type="number"
                      defaultValue={7}
                      className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Enabled</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Alert History */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "high"
                    ? "border-l-error"
                    : alert.severity === "medium"
                      ? "border-l-warning"
                      : "border-l-success"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        alert.severity === "high"
                          ? "bg-error/10"
                          : alert.severity === "medium"
                            ? "bg-warning/10"
                            : "bg-success/10"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          alert.severity === "high"
                            ? "text-error"
                            : alert.severity === "medium"
                              ? "text-warning"
                              : "text-success"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground">{alert.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {alert.value} / {alert.threshold}
                    </p>
                    <p className="text-xs text-muted-foreground">{alert.triggered}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Integrations */}
        {activeTab === "integrations" && (
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {integration.connected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      integration.connected
                        ? "bg-muted text-foreground hover:bg-secondary"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {integration.connected ? "Configure" : "Connect"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
