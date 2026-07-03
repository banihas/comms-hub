"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, ArrowUp, ArrowDown, ArrowUpDown, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  addTask,
  setActiveTask,
  moveTask,
  getFilteredTasks,
  setSort,
  setFilter,
  type SortField,
  TEAM_MEMBERS,
} from "@/lib/store"
import { TaskRow } from "@/components/task-row"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function SectionGroup({
  sectionId,
  sectionName,
  tasks,
  projectId,
}: {
  sectionId: string
  sectionName: string
  tasks: ReturnType<typeof useStore>["tasks"]
  projectId: string
}) {
  const [expanded, setExpanded] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  function handleAdd() {
    if (newTitle.trim()) {
      const newTask = addTask(sectionId, projectId, newTitle.trim())
      setActiveTask(newTask.id)
      setNewTitle("")
    }
    setIsAdding(false)
  }

  return (
    <div className="mb-2">
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/40 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span>{sectionName}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {tasks.length}
        </span>
      </button>

      {/* Tasks */}
      {expanded && (
        <div
          className={cn(isDragOver && "bg-primary/5")}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            const taskId = e.dataTransfer.getData("taskId")
            if (taskId) {
              moveTask(taskId, sectionId)
            }
          }}
        >
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("taskId", task.id)
              }}
              onDragEnd={() => setIsDragOver(false)}
            />
          ))}

          {/* Add task row */}
          {isAdding ? (
            <div className="flex items-center gap-3 px-6 py-2.5 pl-[4.25rem]">
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
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className={cn(
                "flex w-full items-center gap-2 px-6 py-2 pl-[4.25rem] text-sm text-muted-foreground hover:text-foreground transition-colors"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Add task</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SortIcon({ field, activeField, direction }: { field: SortField; activeField: SortField; direction: "asc" | "desc" }) {
  if (field !== activeField) return <ArrowUpDown className="h-3 w-3 opacity-40" />
  return direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
}

export function ListView() {
  const store = useStore()
  const sections = store.sections
    .filter((s) => s.projectId === store.activeProjectId)
    .sort((a, b) => a.order - b.order)

  const projectTasks = store.tasks.filter((t) => t.projectId === store.activeProjectId)
  const filteredTasks = getFilteredTasks(projectTasks)

  const { sortField, sortDirection, filterState } = store

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSort(field, sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSort(field, "asc")
    }
  }

  const priorityFilterLabel = filterState.priority === "all" ? null : filterState.priority
  const assigneeFilterLabel = filterState.assignee === "all" ? null : filterState.assignee
  const dueDateFilterLabel = filterState.dueDateRange === "all" ? null : filterState.dueDateRange

  return (
    <ScrollArea className="flex-1">
      {/* Column headers */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-6 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <div className="w-4" />
        <div className="w-[18px]" />

        {/* Task Name — sortable */}
        <button
          onClick={() => handleSort("title")}
          className="flex flex-1 items-center gap-1 hover:text-foreground transition-colors"
        >
          Task Name
          <SortIcon field="title" activeField={sortField} direction={sortDirection} />
        </button>

        {/* Priority — sortable + filterable */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-20 items-center justify-center gap-1 hover:text-foreground transition-colors",
                priorityFilterLabel && "text-foreground"
              )}
            >
              {priorityFilterLabel ? (
                <Filter className="h-3 w-3" />
              ) : (
                <SortIcon field="priority" activeField={sortField} direction={sortDirection} />
              )}
              Priority
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-40">
            <DropdownMenuItem onClick={() => handleSort("priority")}>
              Sort {sortField === "priority" && sortDirection === "asc" ? "↓ Desc" : "↑ Asc"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setFilter({ priority: "all" })}
              className={cn(filterState.priority === "all" && "font-semibold")}
            >
              All priorities
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ priority: "high" })}
              className={cn(filterState.priority === "high" && "font-semibold")}
            >
              High
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ priority: "medium" })}
              className={cn(filterState.priority === "medium" && "font-semibold")}
            >
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ priority: "low" })}
              className={cn(filterState.priority === "low" && "font-semibold")}
            >
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Due Date — sortable + filterable */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-20 items-center justify-center gap-1 hover:text-foreground transition-colors",
                dueDateFilterLabel && "text-foreground"
              )}
            >
              {dueDateFilterLabel ? (
                <Filter className="h-3 w-3" />
              ) : (
                <SortIcon field="dueDate" activeField={sortField} direction={sortDirection} />
              )}
              Due Date
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
            <DropdownMenuItem onClick={() => handleSort("dueDate")}>
              Sort {sortField === "dueDate" && sortDirection === "asc" ? "↓ Desc" : "↑ Asc"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setFilter({ dueDateRange: "all" })}
              className={cn(filterState.dueDateRange === "all" && "font-semibold")}
            >
              All dates
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ dueDateRange: "overdue" })}
              className={cn(filterState.dueDateRange === "overdue" && "font-semibold")}
            >
              Overdue
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ dueDateRange: "today" })}
              className={cn(filterState.dueDateRange === "today" && "font-semibold")}
            >
              Due today
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ dueDateRange: "this-week" })}
              className={cn(filterState.dueDateRange === "this-week" && "font-semibold")}
            >
              This week
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter({ dueDateRange: "next-week" })}
              className={cn(filterState.dueDateRange === "next-week" && "font-semibold")}
            >
              Next week
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assignee — sortable + filterable */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-8 items-center justify-center gap-1 hover:text-foreground transition-colors",
                assigneeFilterLabel && "text-foreground"
              )}
            >
              {assigneeFilterLabel ? (
                <Filter className="h-3 w-3" />
              ) : (
                <SortIcon field="assignee" activeField={sortField} direction={sortDirection} />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleSort("assignee")}>
              Sort {sortField === "assignee" && sortDirection === "asc" ? "↓ Desc" : "↑ Asc"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setFilter({ assignee: "all" })}
              className={cn(filterState.assignee === "all" && "font-semibold")}
            >
              All assignees
            </DropdownMenuItem>
            {TEAM_MEMBERS.map((member) => (
              <DropdownMenuItem
                key={member}
                onClick={() => setFilter({ assignee: member })}
                className={cn(filterState.assignee === member && "font-semibold")}
              >
                {member}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-6" />
      </div>

      {sections.map((section) => {
        const sectionTasks = filteredTasks.filter((t) => t.sectionId === section.id)

        return (
          <SectionGroup
            key={section.id}
            sectionId={section.id}
            sectionName={section.name}
            tasks={sectionTasks}
            projectId={store.activeProjectId}
          />
        )
      })}
    </ScrollArea>
  )
}
