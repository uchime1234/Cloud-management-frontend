"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { useAppStore } from "../store/appStore"
import type { FeatureType } from "../types"
import {
  DollarSign,
  Bot,
  BookOpen,
  Rocket,
  Activity,
  Database,
  Shield,
  Wrench,
  Users,
  Briefcase,
  Cloud,
} from "lucide-react"

interface Feature {
  id: FeatureType
  icon: React.ReactNode
  label: string
  description: string
  route: string
  gradient: string
}

const features: Feature[] = [
  {
    id: "cost-analytics",
    icon: <DollarSign className="w-8 h-8" />,
    label: "Cloud Cost Analytics",
    description: "Track and optimize your cloud spending across all providers",
    route: "/cost-analytics",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "ai-agents",
    icon: <Bot className="w-8 h-8" />,
    label: "AI Agents",
    description: "Intelligent assistants for cost optimization and troubleshooting",
    route: "/ai-agents",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "infrastructure-guides",
    icon: <BookOpen className="w-8 h-8" />,
    label: "Multi-Cloud Infrastructure Guides",
    description: "Step-by-step guides for deploying infrastructure",
    route: "/infrastructure-guides",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "deployment-playbooks",
    icon: <Rocket className="w-8 h-8" />,
    label: "Deployment Playbooks",
    description: "Automated deployment templates and best practices",
    route: "/deployment-playbooks",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "monitoring",
    icon: <Activity className="w-8 h-8" />,
    label: "Monitoring & Alerting",
    description: "Real-time monitoring and intelligent alerts",
    route: "/monitoring",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: "inventory",
    icon: <Database className="w-8 h-8" />,
    label: "Resource Inventory Management",
    description: "Comprehensive view of all your cloud resources",
    route: "/inventory",
    gradient: "from-teal-500/20 to-cyan-500/20",
  },
  {
    id: "security",
    icon: <Shield className="w-8 h-8" />,
    label: "Cloud Security & Compliance",
    description: "Security scanning and compliance monitoring",
    route: "/security",
    gradient: "from-red-500/20 to-rose-500/20",
  },
  {
    id: "automation",
    icon: <Wrench className="w-8 h-8" />,
    label: "Automation Tools",
    description: "Infrastructure as code generators and automation",
    route: "/automation",
    gradient: "from-indigo-500/20 to-blue-500/20",
  },
  {
    id: "collaboration",
    icon: <Users className="w-8 h-8" />,
    label: "Collaboration & Team Features",
    description: "Cloud access management and team workflows",
    route: "/collaboration",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "business",
    icon: <Briefcase className="w-8 h-8" />,
    label: "Business Features",
    description: "Reporting, exports, and client management",
    route: "/business",
    gradient: "from-slate-500/20 to-gray-500/20",
  },
]

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { selectedFeature, setSelectedFeature } = useAppStore()

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature.id)
  }

  const handleEnter = () => {
    const feature = features.find((f) => f.id === selectedFeature)
    if (feature) {
      navigate(feature.route)
    }
  }

  const selectedFeatureData = features.find((f) => f.id === selectedFeature)

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT PANEL - Feature Cards */}
        <div className="w-1/2 border-r border-border p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Choose a Feature</h2>
              <p className="text-muted-foreground">Select a feature to manage your cloud infrastructure</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  hover
                  selected={selectedFeature === feature.id}
                  onClick={() => handleFeatureClick(feature)}
                  className="cursor-pointer aspect-square flex flex-col items-center justify-center text-center p-6 group"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <div className="text-foreground">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{feature.label}</h3>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Feature Preview */}
        <div className="w-1/2 p-8 flex items-center justify-center">
          {selectedFeatureData ? (
            <div className="max-w-lg text-center space-y-8">
              {/* Background Image Placeholder */}
              <div
                className={`relative w-full h-64 rounded-2xl bg-gradient-to-br ${selectedFeatureData.gradient} flex items-center justify-center overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
                <div className="text-foreground relative z-10">{selectedFeatureData.icon}</div>
              </div>

              {/* Feature Info */}
              <div className="space-y-4">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedFeatureData.gradient}`}
                >
                  <div className="text-foreground">{selectedFeatureData.icon}</div>
                </div>

                <h2 className="text-3xl font-bold text-foreground">{selectedFeatureData.label}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{selectedFeatureData.description}</p>

                <button
                  onClick={handleEnter}
                  className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  Enter
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Cloud className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Select a Feature</h3>
              <p className="text-muted-foreground">Choose a feature from the left to get started</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
