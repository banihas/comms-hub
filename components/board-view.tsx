"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  addTask,
  toggleTaskComplete,
  setActiveTask,
  moveTask,
  deleteTask,
  getFilteredTasks,
  type Task,
} from "@/lib/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

const priorityConfig = {
  high: { color: "text-destructive", label: "High" },
  medium: { color: "text-warning", label: "Medium" },
  low: { color: "text-muted-foreground", label: "Low" },
  none: { color: "text-transparent", label: "" },
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

function BoardCard({ task, sections }: { task: Task; sections: { id: string; name: string }[] }) {
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
      onClick={() => setActiveTask(task.id)}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-all",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleTaskComplete(task.id)
          }}
          className="mt-0.5 shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-[16px] w-[16px] text-success" />
          ) : (
            <Circle className="h-[16px] w-[16px] text-muted-foreground/50 hover:text-primary transition-colors" />
          )}
        </button>
        <span
          className={cn(
            "flex-1 text-sm leading-snug",
            task.completed ? "line-through text-muted-foreground" : "text-foreground"
          )}
        >
          {task.title}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {sections
              .filter((s) => s.id !== task.sectionId)
              .map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveTask(task.id, s.id)
                  }}
                >
                  Move to {s.name}
                </DropdownMenuItem>
              ))}
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

      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        {task.priority !== "none" && (
          <span className={cn("flex items-center gap-0.5 text-xs", priorityConfig[task.priority].color)}>
            <Flag className="h-3 w-3" />
            {priorityConfig[task.priority].label}
          </span>
        )}
        {task.dueDate && (
          <span
            suppressHydrationWarning
            className={cn(
              "flex items-center gap-0.5 text-xs",
              isOverdue
                ? "text-destructive"
                : isDueToday
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            <span suppressHydrationWarning>{formattedDate}</span>
          </span>
        )}
        {task.tags.length > 0 && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
            {task.tags[0]}
          </span>
        )}
        {task.assignee && (
          <Avatar className="ml-auto h-5 w-5 shrink-0">
            <AvatarFallback className="bg-muted text-[9px] font-semibold text-muted-foreground">
              {getInitials(task.assignee)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

function BoardColumn({
  sectionId,
  sectionName,
  tasks,
  projectId,
  sections,
}: {
  sectionId: string
  sectionName: string
  tasks: Task[]
  projectId: string
  sections: { id: string; name: string }[]
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  function handleAdd() {
    if (newTitle.trim()) {
      const newTask = addTask(sectionId, projectId, newTitle.trim())
      setActiveTask(newTask.id)
      setNewTitle("")
    }
    setIsAdding(false)
  }

  return (
    <div
      className={cn(
        "flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-xl bg-muted/50 transition-colors",
        dragOverId === sectionId && "ring-2 ring-primary/30"
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOverId(sectionId)
      }}
      onDragLeave={() => setDragOverId(null)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOverId(null)
        const taskId = e.dataTransfer.getData("taskId")
        if (taskId) {
          moveTask(taskId, sectionId)
        }
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{sectionName}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 px-2.5 pb-2.5">
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("taskId", task.id)
              }}
            >
              <BoardCard task={task} sections={sections} />
            </div>
          ))}

          {isAdding && (
            <div className="rounded-lg border border-primary/30 bg-card p-3 shadow-sm">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd()
                  if (e.key === "Escape") {
                    setIsAdding(false)
                    setNewTitle("")
                  }
                }}
                onBlur={handleAdd}
                placeholder="Write a task name..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function BoardView() {
  const store = useStore()
  const sections = store.sections
    .filter((s) => s.projectId === store.activeProjectId)
    .sort((a, b) => a.order - b.order)

  const projectTasks = store.tasks.filter((t) => t.projectId === store.activeProjectId)
  const filteredTasks = getFilteredTasks(projectTasks)
  const sectionsList = sections.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto p-4">
      {sections.map((section) => {
        const sectionTasks = filteredTasks.filter((t) => t.sectionId === section.id)

        return (
          <BoardColumn
            key={section.id}
            sectionId={section.id}
            sectionName={section.name}
            tasks={sectionTasks}
            projectId={store.activeProjectId}
            sections={sectionsList}
          />
        )
      })}
    </div>
  )
}
