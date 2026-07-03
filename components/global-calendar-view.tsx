"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  List,
  LayoutGrid,
  CalendarDays,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  setActiveProject,
  setActiveView,
  setSearchQuery,
  setFilter,
  setSort,
  clearFilters,
  toggleTaskComplete,
  deleteTask,
  getFilteredTasks,
  TEAM_MEMBERS,
  type SortField,
  type Task,
  type Project,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const visualPriorities = new Set(["high", "medium", "low"])

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "text-destructive", label: "High" },
  medium: { color: "text-warning", label: "Medium" },
  low: { color: "text-muted-foreground", label: "Low" },
  none: { color: "text-transparent", label: "" },
}

function getInitials(name: string) {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatDateUTC(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function isDatePast(dateStr: string): boolean {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  return dateStr < todayStr
}

function isDateToday(dateStr: string): boolean {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  return dateStr === todayStr
}

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false })
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  }

  return days
}

function getWeekDays(baseDate: Date): Date[] {
  const day = baseDate.getDay()
  const sunday = new Date(baseDate)
  sunday.setDate(baseDate.getDate() - day)
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    days.push(d)
  }
  return days
}

function getWeekLabel(weekDays: Date[]): string {
  const start = weekDays[0]
  const end = weekDays[6]
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }
  const sameYear = start.getFullYear() === end.getFullYear()
  if (sameYear) {
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.toLocaleDateString("en-US", { month: "short" })} ${end.getDate()}, ${start.getFullYear()}`
  }
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function GlobalCalendarTask({
  task,
  project,
  onShowPopup,
}: {
  task: Task
  project: Project | undefined
  onShowPopup?: (task: Task, rect: DOMRect) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        if (onShowPopup && ref.current) {
          onShowPopup(task, ref.current.getBoundingClientRect())
        }
      }}
      className={cn(
        "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-[11px] leading-tight transition-colors hover:bg-accent group",
        task.completed && "line-through opacity-50"
      )}
    >
      {/* Project color indicator */}
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-sm"
        style={{ backgroundColor: project?.color ?? "#888" }}
        title={project?.name}
      />
      <span className="truncate">{task.title}</span>
    </button>
  )
}

// ─── Weekly Calendar Card (richer detail) ─────────────────────────────────────

function WeeklyCalendarCard({ task, project }: { task: Task; project: Project | undefined }) {
  const isOverdue = task.dueDate ? isDatePast(task.dueDate) && !isDateToday(task.dueDate) && !task.completed : false
  const isDueToday = task.dueDate ? isDateToday(task.dueDate) : false
  const formattedDate = task.dueDate ? (isDueToday ? "Today" : formatDateUTC(task.dueDate)) : ""

  return (
    <div
      onClick={() => {
        setActiveProject(task.projectId)
        setActiveTask(task.id)
        setActiveView("project")
      }}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-all",
        task.completed && "opacity-50"
      )}
    >
      {/* Top row: completion toggle + title */}
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id) }}
          className="mt-0.5 shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors" />
          )}
        </button>
        <span className={cn("flex-1 text-sm font-medium leading-snug", task.completed && "line-through text-muted-foreground")}>
          {task.title}
        </span>
      </div>

      {/* Project chip */}
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-sm"
          style={{ backgroundColor: project?.color ?? "#888" }}
        />
        <span
          className="truncate text-[11px] font-medium"
          style={{ color: project?.color ?? "#888" }}
        >
          {project?.name ?? "Unknown"}
        </span>
      </div>

      {/* Meta row: priority, date, assignee */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {visualPriorities.has(task.priority) && (
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
              isOverdue ? "text-destructive" : isDueToday ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            <span suppressHydrationWarning>{formattedDate}</span>
          </span>
        )}
        {task.assignee && (
          <div className="ml-auto flex items-center gap-1">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarFallback className="bg-muted text-[9px] font-semibold text-muted-foreground">
                {getInitials(task.assignee)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-[11px] text-muted-foreground lg:inline">{task.assignee.split(" ")[0]}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Global List Row ─────────────────────────────────────────────────────────

function GlobalListRow({ task, project }: { task: Task; project: Project | undefined }) {
  const formattedDate = task.dueDate ? (isDateToday(task.dueDate) ? "Today" : formatDateUTC(task.dueDate)) : ""
  const isOverdue = task.dueDate ? isDatePast(task.dueDate) && !isDateToday(task.dueDate) && !task.completed : false
  const isDueToday = task.dueDate ? isDateToday(task.dueDate) : false

  return (
    <div
      className={cn(
        "group flex items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer",
        task.completed && "opacity-60"
      )}
      onClick={() => {
        setActiveProject(task.projectId)
        setActiveTask(task.id)
        setActiveView("project")
      }}
    >
      {/* Completion toggle */}
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

      {/* Project color dot */}
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-sm"
        style={{ backgroundColor: project?.color ?? "#888" }}
        title={project?.name}
      />

      {/* Title */}
      <span className={cn("flex-1 truncate text-sm", task.completed && "line-through text-muted-foreground")}>
        {task.title}
      </span>

      {/* Project name chip */}
      <span
        className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex"
        style={{ backgroundColor: (project?.color ?? "#888") + "22", color: project?.color ?? "#888" }}
      >
        {project?.name ?? "Unknown"}
      </span>

      {/* Priority */}
      {visualPriorities.has(task.priority) && (
        <span className={cn("flex shrink-0 items-center gap-0.5 text-xs", priorityConfig[task.priority].color)}>
          <Flag className="h-3 w-3" />
          <span className="hidden lg:inline">{priorityConfig[task.priority].label}</span>
        </span>
      )}

      {/* Due date */}
      {task.dueDate && (
        <span
          suppressHydrationWarning
          className={cn(
            "flex shrink-0 items-center gap-1 text-xs",
            isOverdue ? "text-destructive" : isDueToday ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Calendar className="h-3 w-3" />
          <span suppressHydrationWarning>{formattedDate}</span>
        </span>
      )}

      {/* Assignee */}
      {task.assignee && (
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarFallback className="bg-muted text-[9px] font-semibold text-muted-foreground">
            {getInitials(task.assignee)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Delete */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
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

// ─── Global Board Card ────────────────────────────────────────────────────────

function GlobalBoardCard({ task, project }: { task: Task; project: Project | undefined }) {
  const formattedDate = task.dueDate ? (isDateToday(task.dueDate) ? "Today" : formatDateUTC(task.dueDate)) : ""
  const isOverdue = task.dueDate ? isDatePast(task.dueDate) && !isDateToday(task.dueDate) && !task.completed : false
  const isDueToday = task.dueDate ? isDateToday(task.dueDate) : false

  return (
    <div
      onClick={() => {
        setActiveProject(task.projectId)
        setActiveTask(task.id)
        setActiveView("project")
      }}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-all",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id) }}
          className="mt-0.5 shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-[16px] w-[16px] text-success" />
          ) : (
            <Circle className="h-[16px] w-[16px] text-muted-foreground/50 hover:text-primary transition-colors" />
          )}
        </button>
        <span className={cn("flex-1 text-sm leading-snug", task.completed ? "line-through text-muted-foreground" : "text-foreground")}>
          {task.title}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {visualPriorities.has(task.priority) && (
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
              isOverdue ? "text-destructive" : isDueToday ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            <span suppressHydrationWarning>{formattedDate}</span>
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

export function GlobalCalendarView() {
  const store = useStore()
  const [globalViewMode, setGlobalViewMode] = useState<"list" | "board" | "calendar">("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekBaseDate, setWeekBaseDate] = useState(new Date())
  const [showSearch, setShowSearch] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    () => new Set(store.projects.map((p) => p.id))
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = useMemo(() => getMonthData(year, month), [year, month])

  const weekDays = useMemo(() => getWeekDays(weekBaseDate), [weekBaseDate])
  const weekLabel = useMemo(() => getWeekLabel(weekDays), [weekDays])

  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {}
    for (const p of store.projects) map[p.id] = p
    return map
  }, [store.projects])

  // Base tasks: scoped to selected projects
  const scopedTasks = useMemo(
    () => store.tasks.filter((t) => selectedProjects.has(t.projectId)),
    [store.tasks, selectedProjects]
  )

  // Apply global search/filter/sort from the store
  const filteredTasks = useMemo(() => getFilteredTasks(scopedTasks), [
    scopedTasks,
    store.searchQuery,
    store.filterState,
    store.sortField,
    store.sortDirection,
  ])

  const todayStr = getDateStr(new Date())

  // ── Task popup state ──────────────────────────────────────────────────
  const [popupTask, setPopupTask] = useState<Task | null>(null)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)

  const handleShowPopup = useCallback((task: Task, rect: DOMRect) => {
    const popupWidth = 320
    const popupHeight = 220
    let left = rect.left + rect.width / 2 - popupWidth / 2
    let top = rect.bottom + 8

    // Keep within viewport
    if (left < 16) left = 16
    if (left + popupWidth > window.innerWidth - 16) left = window.innerWidth - 16 - popupWidth
    if (top + popupHeight > window.innerHeight - 16) top = rect.top - popupHeight - 8

    setPopupTask(task)
    setPopupPos({ top, left })
  }, [])

  const closePopup = useCallback(() => {
    setPopupTask(null)
    setPopupPos(null)
  }, [])

  // Calendar: group by date
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

  // Stats for sidebar (current month)
  const monthTasks = filteredTasks.filter((t) => {
    if (!t.dueDate) return false
    const [y, m] = t.dueDate.split("-").map(Number)
    return y === year && m === month + 1
  })
  const completedThisMonth = monthTasks.filter((t) => t.completed).length
  const overdueThisMonth = monthTasks.filter((t) => !t.completed && t.dueDate! < todayStr).length

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }
  function goToday()   { setCurrentDate(new Date()) }

  function prevWeek() {
    setWeekBaseDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }
  function nextWeek() {
    setWeekBaseDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }
  function goTodayWeek() { setWeekBaseDate(new Date()) }

  function toggleProject(projectId: string) {
    setSelectedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        if (next.size > 1) next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

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

  // Board: one column per selected project
  const visibleProjects = store.projects.filter((p) => selectedProjects.has(p.id))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col border-b border-border bg-card">
        {/* Title row */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Global Project Calendar
            </h1>
            <p className="text-xs text-muted-foreground">
              All tasks across every project, in one place.
            </p>
          </div>

          {/* Search / Filter / Sort */}
          <div className="flex items-center gap-2">
            {showSearch ? (
              <Input
                autoFocus
                placeholder="Search tasks..."
                value={store.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!store.searchQuery) setShowSearch(false) }}
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

            {/* Filter */}
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
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
                    <Select value={store.filterState.priority} onValueChange={(val) => setFilter({ priority: val as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Assignee</label>
                    <Select value={store.filterState.assignee} onValueChange={(val) => setFilter({ assignee: val })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        {TEAM_MEMBERS.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                    <Select value={store.filterState.completed} onValueChange={(val) => setFilter({ completed: val as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tasks</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Due Date</label>
                    <Select value={store.filterState.dueDateRange} onValueChange={(val) => setFilter({ dueDateRange: val as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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

            {/* Sort */}
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
                <DropdownMenuItem onClick={() => clearFilters()}>Reset sort</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 px-6 pb-0">
          {(["calendar", "list", "board"] as const).map((mode) => {
            const Icon = mode === "list" ? List : mode === "board" ? LayoutGrid : CalendarDays
            const label = mode.charAt(0).toUpperCase() + mode.slice(1)
            return (
              <button
                key={mode}
                onClick={() => setGlobalViewMode(mode)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  globalViewMode === mode
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar filter panel */}
        <div className="hidden w-52 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border p-4 md:flex">
          {/* Project toggles */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </h3>
            <div className="flex flex-col gap-1">
              {store.projects.map((project) => {
                const active = selectedProjects.has(project.id)
                return (
                  <button
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground/60 hover:bg-accent/60"
                    )}
                  >
                    <Hash
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: active ? project.color : undefined }}
                    />
                    <span className="truncate">{project.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {store.tasks.filter((t) => t.projectId === project.id && !t.completed).length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Month stats — only relevant for calendar view */}
          {globalViewMode === "calendar" && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                This Month
              </h3>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between px-2">
                  <span className="text-muted-foreground">Total</span>
                  <Badge variant="secondary" className="text-[10px]">{monthTasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-muted-foreground">Completed</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {completedThisMonth}
                  </Badge>
                </div>
                {overdueThisMonth > 0 && (
                  <div className="flex items-center justify-between px-2">
                    <span className="text-muted-foreground">Overdue</span>
                    <Badge variant="destructive" className="text-[10px]">{overdueThisMonth}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ── Main content area ───────────────────────────────────────────── */}
        {globalViewMode === "list" && (
          <ScrollArea className="flex-1">
            {/* Column headers */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="w-[18px]" />
              <div className="w-2" />
              <div className="flex-1">Task Name</div>
              <div className="hidden w-24 sm:block">Project</div>
              <div className="w-16 text-center">Priority</div>
              <div className="w-20 text-center">Due Date</div>
              <div className="w-6 text-center">👤</div>
              <div className="w-6" />
            </div>

            {visibleProjects.map((project) => {
              const projectTasks = filteredTasks.filter((t) => t.projectId === project.id)
              if (projectTasks.length === 0) return null
              return (
                <div key={project.id}>
                  {/* Project group header */}
                  <div
                    className="flex items-center gap-2 bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground border-b border-border"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                    <span className="text-muted-foreground font-normal">{projectTasks.length}</span>
                  </div>
                  {projectTasks.map((task) => (
                    <GlobalListRow key={task.id} task={task} project={projectMap[task.projectId]} />
                  ))}
                </div>
              )
            })}

            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                <p className="text-sm">No tasks match the current filters.</p>
              </div>
            )}
          </ScrollArea>
        )}

        {globalViewMode === "board" && (
          <div className="flex flex-1 gap-4 overflow-x-auto p-4">
            {visibleProjects.map((project) => {
              const projectTasks = filteredTasks.filter((t) => t.projectId === project.id)
              return (
                <div
                  key={project.id}
                  className="flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-xl bg-muted/50"
                >
                  {/* Column header */}
                  <div className="flex items-center gap-2 px-3 py-3">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="text-sm font-semibold text-foreground truncate flex-1">{project.name}</h3>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                      {projectTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <ScrollArea className="flex-1 px-2.5 pb-2.5">
                    <div className="flex flex-col gap-2">
                      {projectTasks.map((task) => (
                        <GlobalBoardCard key={task.id} task={task} project={project} />
                      ))}
                      {projectTasks.length === 0 && (
                        <p className="px-1 py-4 text-center text-xs text-muted-foreground">No tasks</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        )}

        {globalViewMode === "calendar" && (
          <div className="flex flex-1 flex-col overflow-hidden p-4">
            {/* Month nav */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="min-w-[220px] text-center text-sm font-semibold text-foreground">
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

            {/* Day-of-week column headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS_OF_WEEK.map((dayName) => (
                <div
                  key={dayName}
                  className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Monthly grid */}
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day, i) => {
                  const dateStr = getDateStr(day.date)
                  const dayTasks = tasksByDate[dateStr] || []
                  const isToday = dateStr === todayStr

                  return (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[100px] border-b border-r border-border p-1.5 overflow-hidden",
                        !day.isCurrentMonth && "bg-muted/30",
                        isToday && "bg-primary/[0.05]"
                      )}
                    >
                      <div className="mb-1 text-right">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                            isToday
                              ? "bg-primary text-primary-foreground font-bold"
                              : day.isCurrentMonth
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                          )}
                        >
                          {day.date.getDate()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {dayTasks.slice(0, 3).map((task) => (
                          <GlobalCalendarTask
                            key={task.id}
                            task={task}
                            project={projectMap[task.projectId]}
                            onShowPopup={handleShowPopup}
                          />
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
            </ScrollArea>
          </div>
        )}
      </div>

      {/* ── Task Popup Overlay ────────────────────────────────────────── */}
      {popupTask && popupPos && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 animate-in fade-in-0 duration-150"
            onClick={closePopup}
          />
          {/* Popup card */}
          <div
            className="fixed z-50 w-80 rounded-xl border border-border bg-card p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            {/* Close button */}
            <button
              onClick={closePopup}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {(() => {
              const task = popupTask
              const project = projectMap[task.projectId]
              const isOverdue = task.dueDate ? isDatePast(task.dueDate) && !isDateToday(task.dueDate) && !task.completed : false
              const isDueToday = task.dueDate ? isDateToday(task.dueDate) : false
              const formattedDate = task.dueDate ? (isDueToday ? "Today" : formatDateUTC(task.dueDate)) : ""
              return (
                <>
                  {/* Title + completion */}
                  <div className="flex items-start gap-2 pr-6">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id) }}
                      className="mt-0.5 shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors" />
                      )}
                    </button>
                    <span className={cn("flex-1 text-sm font-semibold leading-snug", task.completed && "line-through text-muted-foreground")}>
                      {task.title}
                    </span>
                  </div>

                  {/* Project */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: project?.color ?? "#888" }}
                    />
                    <span
                      className="truncate text-xs font-medium"
                      style={{ color: project?.color ?? "#888" }}
                    >
                      {project?.name ?? "Unknown"}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {visualPriorities.has(task.priority) && (
                      <span className={cn("flex items-center gap-1 text-xs", priorityConfig[task.priority].color)}>
                        <Flag className="h-3.5 w-3.5" />
                        {priorityConfig[task.priority].label}
                      </span>
                    )}
                    {task.dueDate && (
                      <span
                        suppressHydrationWarning
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          isOverdue ? "text-destructive" : isDueToday ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span suppressHydrationWarning>{formattedDate}</span>
                      </span>
                    )}
                    {task.assignee && (
                      <div className="ml-auto flex items-center gap-1.5">
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarFallback className="bg-muted text-[9px] font-semibold text-muted-foreground">
                            {getInitials(task.assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Open task action */}
                  <div className="mt-4 border-t border-border pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setActiveProject(task.projectId)
                        setActiveTask(task.id)
                        setActiveView("project")
                        closePopup()
                      }}
                    >
                      Open Task
                    </Button>
                  </div>
                </>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}
