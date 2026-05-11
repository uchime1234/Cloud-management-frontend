"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { FileCode, Copy, Check, Download } from "lucide-react"
import type { CloudProvider } from "../types"

const providers: Array<{ id: CloudProvider; name: string; icon: string }> = [
  { id: "aws", name: "AWS", icon: "☁️" },
  { id: "azure", name: "Azure", icon: "⚡" },
  { id: "gcp", name: "GCP", icon: "🔷" },
]

const tools = [
  { id: "terraform", name: "Terraform Generator", description: "Generate Terraform configurations" },
  { id: "cloudformation", name: "CloudFormation Templates", description: "AWS CloudFormation YAML/JSON" },
  { id: "iam", name: "IAM Policy Generator", description: "Create custom IAM policies" },
  { id: "multi-cloud", name: "Multi-Cloud IaC", description: "Cross-platform infrastructure code" },
]

const mockTerraform = `resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  
  tags = {
    Name        = "web-server"
    Environment = "production"
  }

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }
}

resource "aws_security_group" "web_sg" {
  name        = "web-security-group"
  description = "Security group for web server"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`

export const Automation: React.FC = () => {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>("aws")
  const [selectedTool, setSelectedTool] = useState<string>("terraform")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(mockTerraform)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <h1 className="text-3xl font-bold text-foreground">Automation Tools</h1>
          <p className="text-muted-foreground">Infrastructure as code generators and automation</p>
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

        {/* Tool Selection */}
        <div className="grid grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              hover
              selected={selectedTool === tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Code Output */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Generated Code</h3>
              <p className="text-sm text-muted-foreground">{tools.find((t) => t.id === selectedTool)?.name}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto">
            <pre className="whitespace-pre">{mockTerraform}</pre>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
