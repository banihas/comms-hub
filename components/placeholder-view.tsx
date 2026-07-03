"use client"

import { Target, BarChart3, Construction } from "lucide-react"

const iconMap = {
  target: Target,
  chart: BarChart3,
}

export function PlaceholderView({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: "target" | "chart"
}) {
  const Icon = iconMap[icon]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
        <Construction className="h-3.5 w-3.5" />
        Coming soon
      </div>
    </div>
  )
}
