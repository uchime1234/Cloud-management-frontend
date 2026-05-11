"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Cloud, CheckCircle, AlertCircle, Copy, Check } from "lucide-react"
import type { CloudProvider } from "../types"

const providers: Array<{ id: CloudProvider; name: string; icon: string }> = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "⚡" },
  { id: "gcp", name: "GCP", icon: "🔷" },
  { id: "oci", name: "Oracle", icon: "🟥" },
]

const guides = {
  aws: [
    { id: "vpc", name: "Virtual Private Cloud (VPC)" },
    { id: "ec2", name: "EC2 Instances" },
    { id: "s3", name: "S3 Storage" },
    { id: "rds", name: "RDS Databases" },
    { id: "lambda", name: "Lambda Functions" },
  ],
  azure: [
    { id: "vnet", name: "Virtual Network" },
    { id: "vm", name: "Virtual Machines" },
    { id: "storage", name: "Storage Accounts" },
    { id: "sql", name: "SQL Database" },
    { id: "functions", name: "Azure Functions" },
  ],
  gcp: [
    { id: "vpc", name: "VPC Network" },
    { id: "compute", name: "Compute Engine" },
    { id: "storage", name: "Cloud Storage" },
    { id: "sql", name: "Cloud SQL" },
    { id: "functions", name: "Cloud Functions" },
  ],
}

const InfrastructureGuides: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const handleCopyCommand = (stepIndex: number, command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedStep(stepIndex)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const mockSteps = [
    {
      title: "Configure AWS CLI",
      description: "Set up your AWS credentials and default region",
      command: "aws configure",
      warning: "Make sure you have AWS CLI v2 installed",
    },
    {
      title: "Create VPC",
      description: "Create a new Virtual Private Cloud with CIDR block",
      command:
        'aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=MyVPC}]"',
      tip: "Use /16 CIDR block for maximum flexibility",
    },
    {
      title: "Create Subnets",
      description: "Create public and private subnets in different availability zones",
      command: "aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a",
      tip: "Create at least 2 subnets in different AZs for high availability",
    },
    {
      title: "Configure Internet Gateway",
      description: "Attach an internet gateway to enable internet access",
      command:
        "aws ec2 create-internet-gateway && aws ec2 attach-internet-gateway --vpc-id vpc-xxxxx --internet-gateway-id igw-xxxxx",
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT - Provider & Guide Selection */}
        <div className="w-80 border-r border-border overflow-y-auto p-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Infrastructure Guides</h2>

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
                  setSelectedGuide(null)
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

          {/* Guide Selection */}
          {selectedProvider && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">Select Service</p>
              {(guides[selectedProvider as keyof typeof guides] || []).map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedGuide === guide.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted text-foreground"
                  }`}
                >
                  {guide.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Guide Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedProvider && selectedGuide ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {guides[selectedProvider as keyof typeof guides]?.find((g) => g.id === selectedGuide)?.name}
                </h1>
                <p className="text-muted-foreground">Step-by-step guide to set up and configure this service</p>
              </div>

              {/* Architecture Diagram Placeholder */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Architecture diagram placeholder</p>
                  </div>
                </div>
              </Card>

              {/* Steps */}
              <div className="space-y-6">
                {mockSteps.map((step, index) => (
                  <Card key={index} className="relative">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>

                        {step.command && (
                          <div className="relative">
                            <div className="bg-muted rounded-lg p-4 pr-12 font-mono text-sm text-foreground overflow-x-auto">
                              {step.command}
                            </div>
                            <button
                              onClick={() => handleCopyCommand(index, step.command)}
                              className="absolute right-2 top-2 p-2 hover:bg-background rounded-lg transition-colors"
                            >
                              {copiedStep === index ? (
                                <Check className="w-4 h-4 text-success" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        )}

                        {step.tip && (
                          <div className="flex gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground">
                              <strong>Tip:</strong> {step.tip}
                            </p>
                          </div>
                        )}

                        {step.warning && (
                          <div className="flex gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground">
                              <strong>Warning:</strong> {step.warning}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Cloud className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Select a Guide</h3>
                <p className="text-muted-foreground">Choose a provider and service to view the setup guide</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InfrastructureGuides
