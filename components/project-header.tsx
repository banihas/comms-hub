"use client"

import { List, LayoutGrid, CalendarDays, GanttChart, Plus, Search, Filter, SlidersHorizontal, X, ArrowUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setViewMode,
  setSearchQuery,
  addSection,
  setFilter,
  setSort,
  clearFilters,
  TEAM_MEMBERS,
  type SortField,
  type SortDirection,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProjectHeader() {
  const store = useStore()
  const project = store.projects.find((p) => p.id === store.activeProjectId)
  const [showSearch, setShowSearch] = useState(false)
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [sectionName, setSectionName] = useState("")

  if (!project) return null

  function handleAddSection() {
    if (sectionName.trim()) {
      addSection(store.activeProjectId, sectionName.trim())
      setSectionName("")
      setIsAddingSection(false)
    }
  }

  const taskCount = store.tasks.filter((t) => t.projectId === store.activeProjectId).length
  const completedCount = store.tasks.filter(
    (t) => t.projectId === store.activeProjectId && t.completed
  ).length

  const hasActiveFilters =
    store.filterState.priority !== "all" ||
    store.filterState.assignee !== "all" ||
    store.filterState.completed !== "all" ||
    store.filterState.dueDateRange !== "all"

  const SORT_OPTIONS: { label: string; field: SortField }[] = [
    { label: "Created Date", field: "createdAt" },
    { label: "Due Date", field: "dueDate" },
    { label: "Priority", field: "priority" },
    { label: "Title", field: "title" },
    { label: "Assignee", field: "assignee" },
  ]

  return (
    <header className="flex flex-col border-b border-border bg-card">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
            style={{ backgroundColor: project.color + "20", color: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight text-balance">
              {project.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {taskCount} tasks completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <Input
              autoFocus
              placeholder="Search tasks..."
              value={store.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!store.searchQuery) setShowSearch(false)
              }}
              className="h-8 w-56 text-sm"
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  hasActiveFilters && "text-primary hover:text-primary"
                )}
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={() => clearFilters()}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {/* Priority filter */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                  <Select
                    value={store.filterState.priority}
                    onValueChange={(val) => setFilter({ priority: val as any })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee filter */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Assignee</label>
                  <Select
                    value={store.filterState.assignee}
                    onValueChange={(val) => setFilter({ assignee: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {TEAM_MEMBERS.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Completion filter */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                    value={store.filterState.completed}
                    onValueChange={(val) => setFilter({ completed: val as any })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date Range */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Due Date</label>
                  <Select
                    value={store.filterState.dueDateRange}
                    onValueChange={(val) => setFilter({ dueDateRange: val as any })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="today">Due Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="next-week">Next Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Sort by</div>
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.field}
                  onClick={() =>
                    setSort(
                      opt.field,
                      store.sortField === opt.field && store.sortDirection === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  <span className="flex-1">{opt.label}</span>
                  {store.sortField === opt.field && (
                    <span className="text-xs text-muted-foreground">
                      {store.sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => clearFilters()}>
                Reset sort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Tabs and Add */}
      <div className="flex items-center justify-between px-6 pb-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              store.viewMode === "list"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              store.viewMode === "board"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              store.viewMode === "calendar"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("gantt")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              store.viewMode === "gantt"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <GanttChart className="h-4 w-4" />
            Gantt
          </button>
        </div>

        <div className="flex items-center gap-2 pb-1">
          {isAddingSection ? (
            <div className="flex items-center gap-1">
              <Input
                autoFocus
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection()
                  if (e.key === "Escape") {
                    setIsAddingSection(false)
                    setSectionName("")
                  }
                }}
                placeholder="Section name..."
                className="h-7 w-36 text-xs"
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingSection(true)}
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
