"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  toggleTaskComplete,
  getFilteredTasks,
  type Task,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground/40",
  none: "bg-transparent",
}

const visualPriorities = new Set(["high", "medium", "low"])

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  // Previous month padding
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false })
  }

  // Current month
  for (let i = 1; i <= totalDays; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }

  // Next month padding to fill the grid
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  }

  return days
}

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function CalendarTask({ task }: { task: Task }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setActiveTask(task.id)
      }}
      className={cn(
        "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-[11px] leading-tight transition-colors hover:bg-accent",
        task.completed && "line-through opacity-50"
      )}
    >
      {visualPriorities.has(task.priority) && (
        <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", priorityDot[task.priority])} />
      )}
      <span className="truncate">{task.title}</span>
    </button>
  )
}

export function CalendarView() {
  const store = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const days = useMemo(() => getMonthData(year, month), [year, month])

  const projectTasks = store.tasks.filter((t) => t.projectId === store.activeProjectId)
  const filteredTasks = getFilteredTasks(projectTasks)

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const task of filteredTasks) {
      if (task.dueDate) {
        if (!map[task.dueDate]) map[task.dueDate] = []
        map[task.dueDate].push(task)
      }
    }
    return map
  }, [filteredTasks])

  const todayStr = getDateStr(new Date())

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToday() {
    setCurrentDate(new Date())
  }

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[160px] text-center text-sm font-semibold text-foreground">
            {monthLabel}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday} className="h-8 text-xs">
          Today
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 auto-rows-fr">
        {days.map(({ date, isCurrentMonth }, index) => {
          const dateStr = getDateStr(date)
          const dayTasks = tasksByDate[dateStr] || []
          const isToday = dateStr === todayStr

          return (
            <div
              key={index}
              className={cn(
                "border-b border-r border-border p-1.5 overflow-hidden",
                !isCurrentMonth && "bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday
                    ? "bg-primary text-primary-foreground font-bold"
                    : isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                {date.getDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <CalendarTask key={task.id} task={task} />
                ))}
                {dayTasks.length > 3 && (
                  <span className="px-1.5 text-[10px] text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
