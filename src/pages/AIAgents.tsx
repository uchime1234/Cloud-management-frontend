"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import {
  Bot,
  DollarSign,
  Cloud,
  Rocket,
  Wrench,
  Shield,
  BookOpen,
  GraduationCap,
  Send,
  FileText,
  ImageIcon,
  FileCode,
} from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
  capabilities: string[]
}

const agents: Agent[] = [
  {
    id: "cost-optimization",
    name: "Cost Optimization Agent",
    description: "Analyzes spending patterns and provides actionable cost-saving recommendations",
    icon: <DollarSign className="w-6 h-6" />,
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
    capabilities: ["Cost analysis", "Savings recommendations", "Resource optimization", "Budget forecasting"],
  },
  {
    id: "cloud-architect",
    name: "Cloud Architect Agent",
    description: "Designs optimal cloud architectures based on your requirements and best practices",
    icon: <Cloud className="w-6 h-6" />,
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
    capabilities: ["Architecture design", "Best practices", "Scalability planning", "Cost estimation"],
  },
  {
    id: "deployment",
    name: "Deployment Agent",
    description: "Guides you through deployment processes with step-by-step instructions",
    icon: <Rocket className="w-6 h-6" />,
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
    capabilities: ["Deployment guides", "CI/CD setup", "Configuration generation", "Rollback strategies"],
  },
  {
    id: "troubleshooting",
    name: "Troubleshooting Agent",
    description: "Diagnoses issues and provides solutions for common cloud problems",
    icon: <Wrench className="w-6 h-6" />,
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-amber-500/20",
    capabilities: ["Error diagnosis", "Log analysis", "Performance troubleshooting", "Quick fixes"],
  },
  {
    id: "security",
    name: "Security Agent",
    description: "Audits your infrastructure and recommends security improvements",
    icon: <Shield className="w-6 h-6" />,
    color: "text-red-500",
    gradient: "from-red-500/20 to-rose-500/20",
    capabilities: ["Security audits", "Compliance checks", "Vulnerability scanning", "IAM recommendations"],
  },
  {
    id: "documentation",
    name: "Documentation Agent",
    description: "Generates comprehensive documentation for your infrastructure",
    icon: <BookOpen className="w-6 h-6" />,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
    capabilities: ["Auto-documentation", "Diagram generation", "Runbook creation", "API docs"],
  },
  {
    id: "learning",
    name: "Learning Agent",
    description: "Teaches cloud concepts and answers your questions about cloud technologies",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "text-indigo-500",
    gradient: "from-indigo-500/20 to-violet-500/20",
    capabilities: ["Cloud tutorials", "Concept explanations", "Best practice guides", "Q&A support"],
  },
]

const AIAgents: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [activeTab, setActiveTab] = useState<"chat" | "reports" | "diagrams" | "policies">("chat")

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
    setMessages([
      {
        role: "assistant",
        content: `Hello! I'm the ${agent.name}. ${agent.description} How can I help you today?`,
      },
    ])
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    setMessages([...messages, { role: "user", content: input }])
    setInput("")

    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've analyzed your request. Here's what I recommend: [This is a mock response. In production, this would connect to an actual AI service.]",
        },
      ])
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* LEFT SIDEBAR - Agent Selection */}
        <div className="w-80 border-r border-border bg-card/50 overflow-y-auto p-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <h2 className="text-xl font-bold text-foreground mb-4">AI Agents</h2>

          <div className="space-y-2">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                hover
                selected={selectedAgent?.id === agent.id}
                onClick={() => handleAgentSelect(agent)}
                className="cursor-pointer p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground mb-1">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {selectedAgent ? (
            <>
              {/* Agent Header */}
              <div className="border-b border-border p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedAgent.gradient} flex items-center justify-center`}
                  >
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedAgent.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities.map((cap, i) => (
                    <span key={i} className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tool Tabs */}
              <div className="border-b border-border px-6">
                <div className="flex gap-4">
                  {[
                    { id: "chat", label: "Chat", icon: <Bot className="w-4 h-4" /> },
                    { id: "reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
                    { id: "diagrams", label: "Diagrams", icon: <ImageIcon className="w-4 h-4" /> },
                    { id: "policies", label: "Policies", icon: <FileCode className="w-4 h-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              {activeTab === "chat" && (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message, i) => (
                      <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-2xl rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border text-foreground"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="border-t border-border p-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button onClick={handleSendMessage} className="px-6">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Other Tabs */}
              {activeTab !== "chat" && (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      {activeTab === "reports" && <FileText className="w-8 h-8 text-muted-foreground" />}
                      {activeTab === "diagrams" && <ImageIcon className="w-8 h-8 text-muted-foreground" />}
                      {activeTab === "policies" && <FileCode className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 capitalize">{activeTab}</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "reports" && "Generated reports will appear here"}
                      {activeTab === "diagrams" && "Architecture diagrams will be displayed here"}
                      {activeTab === "policies" && "Generated policies and code will be shown here"}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Bot className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Select an AI Agent</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose an agent from the sidebar to start a conversation and get intelligent assistance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AIAgents
