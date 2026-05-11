import type React from "react"
import { Cloud } from "lucide-react"
import { Card } from "../ui/Card"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  step?: { current: number; total: number }
  wide?: boolean // New prop
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, step, wide }) => {
  return (
    // Changed bg-gradient to bg-white
    <div className="min-h-screen flex items-center justify-center bg-white p-6 font-sans">
      <div className={`w-full ${wide ? "max-w-6xl" : "max-w-md"}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
            <Cloud className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{title}</h1>
          {subtitle && <p className="text-lg text-slate-500">{subtitle}</p>}

          {step && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: step.total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i <= step.current ? "w-10 bg-blue-600" : "w-10 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Removed standard Card wrap here to let the grid shine, or kept with light styling */}
        <div className="mt-4">{children}</div>

        <p className="text-center text-sm text-slate-400 mt-12 font-medium">
          🛡️ Enterprise-grade 256-bit AES Encryption
        </p>
      </div>
    </div>
  )
}