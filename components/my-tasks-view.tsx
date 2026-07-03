"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Calendar, Flag, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  toggleTaskComplete,
  setActiveTask,
  setActiveProject,
  setActiveView,
  CURRENT_USER,
  type Task,
} from "@/lib/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

function formatDateUTC(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "High" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Medium" },
  low: { color: "text-muted-foreground", bg: "bg-muted", label: "Low" },
  none: { color: "text-transparent", bg: "", label: "" },
}

function ProjectGroup({
  projectId,
  projectName,
  projectColor,
  tasks,
}: {
  projectId: string
  projectName: string
  projectColor: string
  tasks: Task[]
}) {
  const [expanded, setExpanded] = useState(true)
  const today = new Date()
  const todayStr = getDateStr(today)

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/40 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Hash className="h-4 w-4" style={{ color: projectColor }} />
        <span>{projectName}</span>
        <span className="text-xs font-normal text-muted-foreground">{tasks.length}</span>
      </button>

      {expanded && (
        <div>
          {tasks.map((task) => {
            const isOverdue =
              task.dueDate && task.dueDate < todayStr && task.dueDate !== todayStr && !task.completed
            const isToday = task.dueDate === todayStr

            return (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center gap-3 border-b border-border px-6 py-2.5 pl-14 hover:bg-accent/50 transition-colors cursor-pointer",
                  task.completed && "opacity-60"
                )}
                onClick={() => {
                  setActiveTask(task.id)
                  setActiveProject(projectId)
                  setActiveView("project")
                }}
              >
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
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {task.title}
                </span>
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
                {task.dueDate && (
                  <span
                    suppressHydrationWarning
                    className={cn(
                      "flex items-center gap-1 text-xs whitespace-nowrap",
                      isOverdue
                        ? "text-destructive font-medium"
                        : isToday
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    <span suppressHydrationWarning>
                      {isToday ? "Today" : formatDateUTC(task.dueDate)}
                    </span>
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function MyTasksView() {
  const store = useStore()
  const [showCompleted, setShowCompleted] = useState(false)

  const myTasks = store.tasks
    .filter((t) => t.assignee === CURRENT_USER)
    .filter((t) => showCompleted || !t.completed)

  const tasksByProject = store.projects
    .map((project) => ({
      project,
      tasks: myTasks.filter((t) => t.projectId === project.id),
    }))
    .filter((group) => group.tasks.length > 0)

  const totalTasks = store.tasks.filter((t) => t.assignee === CURRENT_USER).length
  const completedCount = store.tasks.filter((t) => t.assignee === CURRENT_USER && t.completed).length

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 pt-8 pb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">My Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount} of {totalTasks} tasks completed
          </p>
        </div>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            showCompleted
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </button>
      </header>

      <ScrollArea className="flex-1">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-6 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <div className="w-4" />
          <div className="flex-1">Task Name</div>
          <div className="w-20 text-center">Priority</div>
          <div className="w-20 text-center">Due Date</div>
        </div>

        {tasksByProject.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <CheckCircle2 className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">No tasks assigned to you</p>
            <p className="text-xs">Tasks assigned to you will appear here</p>
          </div>
        ) : (
          tasksByProject.map(({ project, tasks }) => (
            <ProjectGroup
              key={project.id}
              projectId={project.id}
              projectName={project.name}
              projectColor={project.color}
              tasks={tasks}
            />
          ))
        )}
      </ScrollArea>
    </div>
  )
}
