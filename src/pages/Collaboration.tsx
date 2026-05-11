"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card } from "../components/ui/Card"
import { Users, User, Shield, Clock, CheckCircle, XCircle, Bot } from "lucide-react"

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@company.com", role: "Admin", status: "active", lastActive: "2 min ago" },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@company.com",
    role: "Developer",
    status: "active",
    lastActive: "15 min ago",
  },
  { id: 3, name: "Bob Wilson", email: "bob@company.com", role: "Viewer", status: "inactive", lastActive: "2 days ago" },
]

const mockPermissionRequests = [
  {
    id: 1,
    user: "Alice Johnson",
    resource: "S3 Bucket: production-data",
    permission: "Read/Write",
    requested: "1 hour ago",
    reason: "Need to deploy new version",
  },
  {
    id: 2,
    user: "Charlie Brown",
    resource: "EC2 Instance: web-server",
    permission: "SSH Access",
    requested: "3 hours ago",
    reason: "Debug production issue",
  },
]

const mockAuditLogs = [
  {
    id: 1,
    user: "john@company.com",
    action: "Created IAM user",
    resource: "iam-user-dev-01",
    timestamp: "2024-12-15 14:23",
    status: "success",
  },
  {
    id: 2,
    user: "jane@company.com",
    action: "Modified security group",
    resource: "sg-web-public",
    timestamp: "2024-12-15 13:45",
    status: "success",
  },
  {
    id: 3,
    user: "bob@company.com",
    action: "Attempted to delete S3 bucket",
    resource: "prod-backups",
    timestamp: "2024-12-15 12:10",
    status: "denied",
  },
]

export const Collaboration: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "audit" | "drift">("users")

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
          <h1 className="text-3xl font-bold text-foreground">Collaboration & Team Features</h1>
          <p className="text-muted-foreground">Cloud access management and team workflows</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <p className="text-2xl font-bold text-foreground">{mockUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                <p className="text-2xl font-bold text-warning">{mockPermissionRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl font-bold text-success">
                  {mockUsers.filter((u) => u.status === "active").length}
                </p>
              </div>
              <User className="w-8 h-8 text-success" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Audit Events</p>
                <p className="text-2xl font-bold text-foreground">{mockAuditLogs.length}</p>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {[
              { id: "users", label: "Users & Roles" },
              { id: "permissions", label: "Permission Requests" },
              { id: "audit", label: "Audit Logs" },
              { id: "drift", label: "IAM Drift" },
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

        {/* Users & Roles */}
        {activeTab === "users" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.status === "active" ? (
                          <span className="flex items-center gap-2 text-success text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-muted-foreground text-sm">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.lastActive}</td>
                      <td className="py-3 px-4">
                        <button className="text-sm text-primary hover:underline">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Permission Requests */}
        {activeTab === "permissions" && (
          <div className="space-y-4">
            {mockPermissionRequests.map((request) => (
              <Card key={request.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{request.user}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Requesting <strong>{request.permission}</strong> access to <strong>{request.resource}</strong>
                    </p>
                    <p className="text-sm text-foreground mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">{request.requested}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-success text-white rounded-lg text-sm hover:opacity-90 transition-all">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-error text-white rounded-lg text-sm hover:opacity-90 transition-all">
                      Deny
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === "audit" && (
          <Card>
            <div className="space-y-3">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        log.status === "success" ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      {log.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.user} • {log.resource}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* IAM Drift */}
        {activeTab === "drift" && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center py-8">
              <Bot className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">AI-Powered IAM Drift Detection</h3>
              <p className="text-muted-foreground mb-6">
                Monitor and detect unauthorized changes to IAM policies and permissions
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all">
                Run Drift Analysis
              </button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
