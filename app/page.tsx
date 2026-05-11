"use client"

import { useEffect } from "react"

export default function Page() {
  useEffect(() => {
    // Redirect to the main app
    window.location.href = "/index.html"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Loading CloudCost Platform...</h1>
        <p className="text-muted-foreground">Redirecting to application</p>
      </div>
    </div>
  )
}
