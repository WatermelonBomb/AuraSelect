"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

type QuickStatsProps = {
  title: string
  value: string | number
  icon: LucideIcon
  color?: "blue" | "green" | "purple" | "yellow" | "red" | "indigo"
  trend?: {
    value: number
    label: string
  }
}

export default function QuickStats({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue",
  trend 
}: QuickStatsProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600", 
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600",
  }

  const trendColor = trend && trend.value > 0 ? "text-green-600" : "text-red-600"

  return (
    <Card className="glass-effect border-0 rounded-3xl luxury-shadow hover:luxury-shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold luxury-text-gradient">{value}</p>
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <p className={`text-sm font-semibold ${trendColor}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </p>
              <p className="text-xs text-gray-500">{trend.label}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}