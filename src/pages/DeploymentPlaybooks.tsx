"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Cloud, Bot, Copy, Check } from "lucide-react"
import type { CloudProvider } from "../types"

const providers: Array<{ id: CloudProvider; name: string; icon: string }> = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "⚡" },
  { id: "gcp", name: "GCP", icon: "🔷" },
]

const playbookTypes = [
  { id: "backend", name: "Backend API", icon: "🔧" },
  { id: "frontend", name: "Frontend App", icon: "🎨" },
  { id: "database", name: "Database", icon: "💾" },
  { id: "containers", name: "Containers", icon: "📦" },
]

export const DeploymentPlaybooks: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const mockConfig = `# Deployment Configuration
name: my-application
region: us-east-1
instance_type: t3.medium
auto_scaling:
  min: 2
  max: 10
  target_cpu: 70
environment:
  NODE_ENV: production
  PORT: 3000
`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT - Selection */}
        <div className="w-80 border-r border-border overflow-y-auto p-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Deployment Playbooks</h2>

          {/* Provider Selection */}
          <div className="space-y-4 mb-8">
            <p className="text-sm font-medium text-muted-foreground">Select Provider</p>
            {providers.map((provider) => (
              <Card
                key={provider.id}
                hover
                selected={selectedProvider === provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id)
                  setSelectedType(null)
                }}
                className="cursor-pointer p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-medium text-foreground">{provider.name}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Type Selection */}
          {selectedProvider && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">Select Type</p>
              {playbookTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                    selectedType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  {type.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Playbook Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedProvider && selectedType ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Deploy {playbookTypes.find((t) => t.id === selectedType)?.name} on{" "}
                  {providers.find((p) => p.id === selectedProvider)?.name}
                </h1>
                <p className="text-muted-foreground">Automated deployment playbook with best practices</p>
              </div>

              {/* Architecture Preview */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Architecture preview</p>
                  </div>
                </div>
              </Card>

              {/* Timeline Steps */}
              <Card>
                <h3 className="text-lg font-semibold text-foreground mb-6">Deployment Timeline</h3>
                <div className="space-y-6">
                  {[
                    { title: "Setup Infrastructure", duration: "5 min", status: "pending" },
                    { title: "Configure Networking", duration: "3 min", status: "pending" },
                    { title: "Deploy Application", duration: "10 min", status: "pending" },
                    { title: "Configure Monitoring", duration: "2 min", status: "pending" },
                    { title: "Run Health Checks", duration: "1 min", status: "pending" },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{step.title}</p>
                        <p className="text-sm text-muted-foreground">Estimated: {step.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Configuration */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Configuration</h3>
                  <button
                    onClick={() => handleCopy(mockConfig)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-secondary rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto whitespace-pre">
                  {mockConfig}
                </div>
              </Card>

              {/* AI Generate Button */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Generate with AI</h3>
                    <p className="text-sm text-muted-foreground">
                      Let AI customize this playbook based on your specific requirements
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Generate
                  </button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Cloud className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Select a Playbook</h3>
                <p className="text-muted-foreground">Choose a provider and deployment type to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
