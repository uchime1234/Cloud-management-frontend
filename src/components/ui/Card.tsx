"use client"

import type React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  selected?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ children, className = "", hover = false, selected = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-2xl p-6 transition-all ${
        hover ? "glow-effect cursor-pointer" : ""
      } ${selected ? "selected-card" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
