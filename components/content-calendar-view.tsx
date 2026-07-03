"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Calendar,
  ImageIcon,
  Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  type Task,
  type Project,
  type BannerAssignment,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getInitials(name: string) {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** Get Mon–Fri dates for the week containing `baseDate`. */
function getWeekdayDates(baseDate: Date): Date[] {
  const day = baseDate.getDay()
  // Monday = 1, so offset to Monday
  const monday = new Date(baseDate)
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(baseDate.getDate() + diff)

  const dates: Date[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

function getWeekRangeLabel(days: Date[]): string {
  const start = days[0]
  const end = days[4]
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`
  }
  return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.toLocaleDateString("en-US", { month: "short" })} ${end.getDate()}, ${start.getFullYear()}`
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  Confirmed: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
}

// ─── Content Card ───────────────────────────────────────────────────────────

function ContentCard({
  task,
  project,
}: {
  task: Task
  project: Project | undefined
}) {
  const cs = task.contentStatus ? statusColors[task.contentStatus] : null

  function handleClick() {
    setActiveTask(task.id)
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          onClick={handleClick}
          className="w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
        >
          <div className="max-h-[100px] overflow-hidden p-3">
            <div className="flex items-start gap-2">
              <span
                className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: project?.color ?? "#888" }}
              />
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug truncate">
                {task.title}
              </span>
            </div>

            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
              {cs && (
                <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 shrink-0", cs.bg, cs.text)}>
                  {task.contentStatus}
                </Badge>
              )}
              <span
                className="min-w-0 max-w-full truncate text-[10px] font-medium rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: (project?.color ?? "#888") + "22",
                  color: project?.color ?? "#888",
                }}
              >
                {project?.name ?? "Unknown"}
              </span>
            </div>

            <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              {task.assignee && (
                <div className="flex min-w-0 items-center gap-1">
                  <Avatar className="h-4 w-4 shrink-0">
                    <AvatarFallback className="bg-muted text-[8px] font-semibold text-muted-foreground">
                      {getInitials(task.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 truncate text-[11px]">{task.assignee.split(" ")[0]}</span>
                </div>
              )}
              {task.dueDate && (
                <span className="ml-auto shrink-0 flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" />
                  {formatDateShort(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-[340px] p-4 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: project?.color ?? "#888" }}
          />
          <span className="flex-1 text-sm font-medium leading-snug">
            {task.title}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {cs && (
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", cs.bg, cs.text)}>
              {task.contentStatus}
            </Badge>
          )}
          <span
            className="truncate text-[10px] font-medium rounded-full px-2 py-0.5"
            style={{
              backgroundColor: (project?.color ?? "#888") + "22",
              color: project?.color ?? "#888",
            }}
          >
            {project?.name ?? "Unknown"}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4 shrink-0">
                <AvatarFallback className="bg-muted text-[8px] font-semibold text-muted-foreground">
                  {getInitials(task.assignee)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px]">{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5 ml-auto">
              <Calendar className="h-3 w-3" />
              {formatDateShort(task.dueDate)}
            </span>
          )}
        </div>

        {task.description && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

// ─── Banner Card (compact) ──────────────────────────────────────────────────

function BannerCard({
  task,
  project,
  size,
}: {
  task: Task
  project: Project | undefined
  size: "large" | "small"
}) {
  function handleClick() {
    setActiveTask(task.id)
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          onClick={handleClick}
          className={cn(
            "flex w-full min-w-0 items-center gap-2 cursor-pointer rounded-md border px-3 py-2 transition-all overflow-hidden max-h-[40px]",
            size === "large"
              ? "border-blue-200 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/30"
              : "border-violet-200 bg-violet-50/60 dark:border-violet-800 dark:bg-violet-950/30"
          )}
        >
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-sm"
            style={{ backgroundColor: project?.color ?? "#888" }}
          />
          <span className="min-w-0 flex-1 truncate text-xs font-medium">{task.title}</span>
          {task.contentStatus && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] px-1 py-0 shrink-0",
                statusColors[task.contentStatus]?.bg,
                statusColors[task.contentStatus]?.text
              )}
            >
              {task.contentStatus}
            </Badge>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className={cn(
          "w-[320px] p-3 cursor-pointer",
          size === "large"
            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
            : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950"
        )}
        onClick={handleClick}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-sm"
            style={{ backgroundColor: project?.color ?? "#888" }}
          />
          <span className="flex-1 text-xs font-medium leading-snug">{task.title}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {task.contentStatus && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] px-1 py-0 shrink-0",
                statusColors[task.contentStatus]?.bg,
                statusColors[task.contentStatus]?.text
              )}
            >
              {task.contentStatus}
            </Badge>
          )}
          <span
            className="truncate text-[10px] font-medium rounded-full px-2 py-0.5"
            style={{
              backgroundColor: (project?.color ?? "#888") + "22",
              color: project?.color ?? "#888",
            }}
          >
            {project?.name ?? "Unknown"}
          </span>
          {task.assignee && (
            <span className="ml-auto text-[10px] text-muted-foreground">{task.assignee}</span>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

// ─── Main View ──────────────────────────────────────────────────────────────

export function ContentCalendarView() {
  const store = useStore()
  const [weekBase, setWeekBase] = useState(new Date())

  const weekDays = useMemo(() => getWeekdayDates(weekBase), [weekBase])
  const weekLabel = useMemo(() => getWeekRangeLabel(weekDays), [weekDays])

  const todayStr = getDateStr(new Date())

  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {}
    for (const p of store.projects) map[p.id] = p
    return map
  }, [store.projects])

  // Content tasks: tagged "For Comms Calendar" + status Pending or Confirmed
  const contentTasks = useMemo(
    () =>
      store.tasks.filter(
        (t) =>
          t.contentLabel === "For Comms Calendar" &&
          (t.contentStatus === "Pending" || t.contentStatus === "Confirmed")
      ),
    [store.tasks]
  )

  // Tasks by due date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const task of contentTasks) {
      if (task.dueDate) {
        if (!map[task.dueDate]) map[task.dueDate] = []
        map[task.dueDate].push(task)
      }
    }
    return map
  }, [contentTasks])

  // Task lookup for banners
  const taskMap = useMemo(() => {
    const map: Record<string, Task> = {}
    for (const t of store.tasks) map[t.id] = t
    return map
  }, [store.tasks])

  // Banners by date and size
  const bannersByDateAndSize = useMemo(() => {
    const map: Record<string, { large: BannerAssignment[]; small: BannerAssignment[] }> = {}
    for (const ba of store.bannerAssignments) {
      if (!map[ba.date]) map[ba.date] = { large: [], small: [] }
      map[ba.date][ba.bannerSize].push(ba)
    }
    return map
  }, [store.bannerAssignments])

  // Week stats
  const weekDateStrs = weekDays.map(getDateStr)
  const weekContentCount = weekDateStrs.reduce(
    (sum, ds) => sum + (tasksByDate[ds]?.length ?? 0),
    0
  )
  const confirmedCount = contentTasks.filter(
    (t) =>
      t.contentStatus === "Confirmed" &&
      t.dueDate &&
      weekDateStrs.includes(t.dueDate)
  ).length
  const pendingCount = contentTasks.filter(
    (t) =>
      t.contentStatus === "Pending" &&
      t.dueDate &&
      weekDateStrs.includes(t.dueDate)
  ).length

  function prevWeek() {
    setWeekBase((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }
  function nextWeek() {
    setWeekBase((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }
  function goToday() {
    setWeekBase(new Date())
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col border-b border-border bg-card" data-tour="content-calendar-area">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Content Calendar
            </h1>
            <p className="text-xs text-muted-foreground">
              Weekly publishing schedule — content marked <span className="font-semibold">&quot;For Comms Calendar&quot;</span> with Pending or Confirmed status.
            </p>
          </div>

          {/* Week stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="text-[10px]">{weekContentCount} items</Badge>
              {confirmedCount > 0 && (
                <Badge variant="secondary" className={cn("text-[10px]", statusColors.Confirmed.bg, statusColors.Confirmed.text)}>
                  {confirmedCount} confirmed
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge variant="secondary" className={cn("text-[10px]", statusColors.Pending.bg, statusColors.Pending.text)}>
                  {pendingCount} pending
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {/* Week navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[260px] text-center text-sm font-semibold text-foreground">
              {weekLabel}
            </h2>
            <Button variant="outline" size="sm" onClick={nextWeek} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToday} className="h-8 text-xs">
            This Week
          </Button>
        </div>

        {/* Day column headers */}
        <div className="grid grid-cols-5 border-b border-border">
          {weekDays.map((day, i) => {
            const dateStr = getDateStr(day)
            const isToday = dateStr === todayStr
            const dayTaskCount = tasksByDate[dateStr]?.length ?? 0
            return (
              <div
                key={i}
                className={cn(
                  "min-w-0 px-2 py-2 text-center text-xs font-medium uppercase tracking-wider",
                  isToday ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {DAY_LABELS[i]}
                <span
                  className={cn(
                    "ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
                {dayTaskCount > 0 && (
                  <span className="ml-1 text-[10px] text-muted-foreground">({dayTaskCount})</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Day columns */}
        <div className="grid flex-1 min-w-0 grid-cols-5 overflow-hidden">
          {weekDays.map((day, i) => {
            const dateStr = getDateStr(day)
            const dayTasks = tasksByDate[dateStr] || []
            const isToday = dateStr === todayStr
            const banners = bannersByDateAndSize[dateStr] || { large: [], small: [] }

            return (
              <div
                key={i}
                className={cn(
                  "flex min-w-0 flex-col border-r border-border overflow-hidden",
                  isToday && "bg-primary/[0.03]"
                )}
              >
                <ScrollArea className="min-w-0 flex-1 p-2">
                  <div className="flex min-w-0 flex-col gap-3">
                    {/* Large Banners section */}
                    {banners.large.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <ImageIcon className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Large Banner
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {banners.large.map((ba) => {
                            const task = taskMap[ba.taskId]
                            if (!task) return null
                            return (
                              <BannerCard
                                key={ba.id}
                                task={task}
                                project={projectMap[task.projectId]}
                                size="large"
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Small Banners section */}
                    {banners.small.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <ImageIcon className="h-3 w-3 text-violet-500" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                            Small Banner
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {banners.small.map((ba) => {
                            const task = taskMap[ba.taskId]
                            if (!task) return null
                            return (
                              <BannerCard
                                key={ba.id}
                                task={task}
                                project={projectMap[task.projectId]}
                                size="small"
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Divider if banners exist and there are content items */}
                    {(banners.large.length > 0 || banners.small.length > 0) && dayTasks.length > 0 && (
                      <div className="border-t border-dashed border-border" />
                    )}

                    {/* Content items */}
                    {dayTasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <Flag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Content
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {dayTasks.map((task) => (
                            <ContentCard
                              key={task.id}
                              task={task}
                              project={projectMap[task.projectId]}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {dayTasks.length === 0 && banners.large.length === 0 && banners.small.length === 0 && (
                      <p className="py-8 text-center text-[11px] text-muted-foreground/50">
                        No content
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

