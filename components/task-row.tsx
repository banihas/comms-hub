"use client"

import { useMemo } from "react"
import {
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Task,
  toggleTaskComplete,
  setActiveTask,
  deleteTask,
} from "@/lib/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "High" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Medium" },
  low: { color: "text-muted-foreground", bg: "bg-muted", label: "Low" },
  none: { color: "text-transparent", bg: "", label: "" },
}

function getInitials(name: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDateUTC(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function isDateToday(dateStr: string): boolean {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  return dateStr === todayStr
}

function isDatePast(dateStr: string): boolean {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  return dateStr < todayStr
}

export function TaskRow({
  task,
  draggable,
  onDragStart,
  onDragEnd,
}: {
  task: Task
  draggable?: boolean
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void
}) {
  const { isOverdue, isDueToday, formattedDate } = useMemo(() => {
    if (!task.dueDate) return { isOverdue: false, isDueToday: false, formattedDate: "" }
    const today = isDateToday(task.dueDate)
    const past = isDatePast(task.dueDate)
    return {
      isOverdue: past && !today && !task.completed,
      isDueToday: today,
      formattedDate: today ? "Today" : formatDateUTC(task.dueDate),
    }
  }, [task.dueDate, task.completed])

  return (
    <div
      className={cn(
        "group flex items-center gap-3 border-b border-border px-6 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer",
        task.completed && "opacity-60"
      )}
      onClick={() => setActiveTask(task.id)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle */}
      <GripVertical className="h-4 w-4 shrink-0 text-transparent group-hover:text-muted-foreground transition-colors cursor-grab" />

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleTaskComplete(task.id)
        }}
        className="shrink-0"
      >
        {task.completed ? (
          <CheckCircle2 className="h-[18px] w-[18px] text-success" />
        ) : (
          <Circle className="h-[18px] w-[18px] text-muted-foreground/50 hover:text-primary transition-colors" />
        )}
      </button>

      {/* Task title */}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          task.completed ? "line-through text-muted-foreground" : "text-foreground"
        )}
      >
        {task.title}
      </span>

      {/* Priority */}
      {task.priority !== "none" && (
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            priorityConfig[task.priority].bg,
            priorityConfig[task.priority].color
          )}
        >
          <Flag className="h-3 w-3" />
          {priorityConfig[task.priority].label}
        </span>
      )}

      {/* Due date */}
      {task.dueDate && (
        <span
          suppressHydrationWarning
          className={cn(
            "flex items-center gap-1 text-xs whitespace-nowrap",
            isOverdue
              ? "text-destructive font-medium"
              : isDueToday
              ? "text-primary font-medium"
              : "text-muted-foreground"
          )}
        >
          <Calendar className="h-3 w-3" />
          <span suppressHydrationWarning>{formattedDate}</span>
        </span>
      )}

      {/* Assignee */}
      {task.assignee && (
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
            {getInitials(task.assignee)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* More options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              deleteTask(task.id)
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
