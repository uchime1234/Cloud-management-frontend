"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { useAppStore } from "../store/appStore"
import type { CloudProvider } from "../types"
import { Cloud } from "lucide-react"

interface Provider {
  id: CloudProvider
  name: string
  icon: string
  color: string
  gradient: string
}

const providers: Provider[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    icon: "☁️",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-yellow-500/20",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: "⚡",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    icon: "🔷",
    color: "text-red-500",
    gradient: "from-red-500/20 to-yellow-500/20",
  },
  {
    id: "oci",
    name: "Oracle Cloud",
    icon: "🟥",
    color: "text-red-600",
    gradient: "from-red-600/20 to-orange-600/20",
  },
  {
    id: "ibm",
    name: "IBM Cloud",
    icon: "💙",
    color: "text-blue-600",
    gradient: "from-blue-600/20 to-indigo-600/20",
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    icon: "🌊",
    color: "text-cyan-500",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    icon: "🟠",
    color: "text-orange-600",
    gradient: "from-orange-600/20 to-red-600/20",
  },
  {
    id: "tencent",
    name: "Tencent Cloud",
    icon: "🔵",
    color: "text-blue-700",
    gradient: "from-blue-700/20 to-indigo-700/20",
  },
]

export const CostAnalytics: React.FC = () => {
  const navigate = useNavigate()
  const { selectedProvider, setSelectedProvider } = useAppStore()

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider.id)
  }

  const handleEnter = () => {
    if (selectedProvider) {
      navigate(`/cost-analytics/${selectedProvider}`)
    }
  }

  const selectedProviderData = providers.find((p) => p.id === selectedProvider)

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT PANEL - Provider Cards */}
        <div className="w-1/2 border-r border-border p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h2 className="text-3xl font-bold text-foreground mb-2">Cloud Cost Analytics</h2>
              <p className="text-muted-foreground">Select a cloud provider to analyze costs</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  hover
                  selected={selectedProvider === provider.id}
                  onClick={() => handleProviderClick(provider)}
                  className="cursor-pointer aspect-square flex flex-col items-center justify-center text-center p-6 group"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-4xl`}
                  >
                    {provider.icon}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{provider.name}</h3>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Provider Preview */}
        <div className="w-1/2 p-8 flex items-center justify-center">
          {selectedProviderData ? (
            <div className="max-w-lg text-center space-y-8">
              <div
                className={`relative w-full h-64 rounded-2xl bg-gradient-to-br ${selectedProviderData.gradient} flex items-center justify-center overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
                <div className="text-8xl relative z-10">{selectedProviderData.icon}</div>
              </div>

              <div className="space-y-4">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedProviderData.gradient} text-4xl`}
                >
                  {selectedProviderData.icon}
                </div>

                <h2 className="text-3xl font-bold text-foreground">{selectedProviderData.name}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  View detailed cost analytics, service breakdown, forecasts, and optimization recommendations
                </p>

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
              <h3 className="text-xl font-semibold text-foreground">Select a Provider</h3>
              <p className="text-muted-foreground">Choose a cloud provider to analyze costs</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
