"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Check } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import type { UserTier } from "../../types"

const tiers = [
  {
    id: "free" as UserTier,
    name: "Genesis (Free)",
    duration: "60 Days",
    price: "$0",
    features: ["1 Cloud Account", "Basic Cost Analytics", "5 AI Prompts/mo", "Email Support"],
  },
  {
    id: "freelancer" as UserTier,
    name: "Freelancer Lite",
    duration: "Monthly",
    price: "$7",
    features: ["2 Cloud Accounts", "Weekly Reports", "Basic Playbooks", "Slack Integration"],
  },
  {
    id: "pro" as UserTier,
    name: "Pro Developer",
    duration: "Monthly",
    price: "$15",
    features: ["5 Cloud Accounts", "Full AI Agent Access", "Real-time Monitoring", "Priority Support"],
    popular: true,
  },
  {
    id: "startup" as UserTier,
    name: "Startup Scale",
    duration: "Monthly",
    price: "$39",
    features: ["10 Cloud Accounts", "Team Collaboration (CAM)", "1-Click IaC Templates", "API Access"],
  },
  {
    id: "business" as UserTier,
    name: "Business Elite",
    duration: "Monthly",
    price: "$85",
    features: ["Unlimited Accounts", "IAM Drift Detection", "White-label Reports", "Custom SSO"],
  },
  {
    id: "gov" as UserTier,
    name: "Gov & Security",
    duration: "Monthly",
    price: "$199",
    features: ["CIS Benchmarks", "FedRAMP Monitoring", "VPC Flow Analysis", "Audit Logs"],
  },
]

export const TierSelection: React.FC = () => {
  const navigate = useNavigate()
  const setUserTier = useAuthStore((state) => state.setUserTier)
  const [selectedTier, setSelectedTier] = useState<UserTier>("pro")

  const handleContinue = () => {
    setUserTier(selectedTier)
    navigate("/dashboard")
  }

  return (
    <AuthLayout
      title="Choose Your Plan"
      subtitle="Select the plan that fits your needs"
      step={{ current: 2, total: 3 }}
      wide // New prop to handle wider horizontal layout
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            hover
            selected={selectedTier === tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className="relative cursor-pointer flex flex-col justify-between"
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  POPULAR
                </span>
              </div>
            )}

            <div>
              <div className="flex flex-col mb-4">
                <h3 className="font-bold text-xl text-slate-900">{tier.name}</h3>
                <p className="text-sm text-slate-500">{tier.duration}</p>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                  <span className="text-slate-500 text-sm ml-1">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="max-w-md mx-auto mt-10">
        <Button onClick={handleContinue} className="w-full py-6 text-lg text-slate-700 font-bold shadow-xl">
          Continue with {tiers.find((t) => t.id === selectedTier)?.name}
        </Button>
      </div>
    </AuthLayout>
  )
}