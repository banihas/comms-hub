"use client"

import { useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  type Task,
  type Section,
} from "@/lib/store"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ROW_HEIGHT = 40
const BAR_HEIGHT = 24
const BAR_Y_OFFSET = (ROW_HEIGHT - BAR_HEIGHT) / 2
const DAY_WIDTH = 48
const LABEL_WIDTH = 220
const HEADER_HEIGHT = 52
const SECTION_HEADER_HEIGHT = 32

type SectionGroup = {
  section: Section
  tasks: Task[]
}

/** Map of visual row items — either a section header or a task row */
type RowItem =
  | { type: "section-header"; section: Section; yOffset: number }
  | { type: "task"; task: Task; yOffset: number }

function getSectionStyle(sectionName: string) {
  const lower = sectionName.toLowerCase()
  if (lower === "done") {
    return { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", icon: "✓", border: "border-emerald-200 dark:border-emerald-800/50" }
  }
  if (lower === "in progress") {
    return { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", icon: "◐", border: "border-blue-200 dark:border-blue-800/50" }
  }
  // Backlog / default
  return { bg: "bg-muted/50", text: "text-muted-foreground", icon: "○", border: "border-border" }
}

function getDateRange(tasks: Task[]) {
  const dates = tasks
    .filter((t) => t.dueDate)
    .map((t) => new Date(t.dueDate + "T00:00:00"))

  if (dates.length === 0) {
    const today = new Date()
    return {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
    }
  }

  const min = new Date(Math.min(...dates.map((d) => d.getTime())))
  const max = new Date(Math.max(...dates.map((d) => d.getTime())))

  // Add padding: 7 days before and 7 days after
  min.setDate(min.getDate() - 7)
  max.setDate(max.getDate() + 7)

  return { start: min, end: max }
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return { fill: "hsl(var(--destructive))", text: "hsl(var(--destructive-foreground))" }
    case "medium":
      return { fill: "hsl(var(--warning, 38 92% 50%))", text: "hsl(var(--warning-foreground, 0 0% 100%))" }
    case "low":
      return { fill: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))" }
    default:
      return { fill: "hsl(var(--primary))", text: "hsl(var(--primary-foreground))" }
  }
}

/** Build a smooth curved SVG arrow path between two bar endpoints */
function buildArrowPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  const dx = toX - fromX
  const cpOffset = Math.max(Math.abs(dx) * 0.4, 30)
  return `M ${fromX} ${fromY} C ${fromX + cpOffset} ${fromY}, ${toX - cpOffset} ${toY}, ${toX} ${toY}`
}

/** Build a smooth curved SVG path for related links */
function buildRelatedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1
  const cpOffset = Math.max(Math.abs(dx) * 0.4, 30)
  return `M ${x1} ${y1} C ${x1 + cpOffset} ${y1}, ${x2 - cpOffset} ${y2}, ${x2} ${y2}`
}

function getStatusStyles(task: Task) {
  if (task.status === "done" || task.completed) {
    return { pattern: "done" as const, opacity: 0.55 }
  }
  if (task.status === "in-progress") {
    return { pattern: "in-progress" as const, opacity: 1 }
  }
  if (task.status === "blocked") {
    return { pattern: "blocked" as const, opacity: 0.75 }
  }
  return { pattern: "todo" as const, opacity: 1 }
}

export function GanttView() {
  const store = useStore()
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)

  // Group tasks by section
  const sectionGroups = useMemo((): SectionGroup[] => {
    const projectSections = store.sections
      .filter((s) => s.projectId === store.activeProjectId)
      .sort((a, b) => a.order - b.order)

    const tasksBySection = new Map<string, Task[]>()
    for (const task of store.tasks) {
      if (task.projectId !== store.activeProjectId) continue
      const list = tasksBySection.get(task.sectionId) || []
      list.push(task)
      tasksBySection.set(task.sectionId, list)
    }

    return projectSections
      .map((section) => ({
        section,
        tasks: (tasksBySection.get(section.id) || []).sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt)
        ),
      }))
      .filter((g) => g.tasks.length > 0)
  }, [store.tasks, store.sections, store.activeProjectId])

  // Flatten into a list of all tasks (for date range, arrows etc.)
  const projectTasks = useMemo(
    () => sectionGroups.flatMap((g) => g.tasks),
    [sectionGroups]
  )

  // Build row items with y-offsets (section headers + task rows)
  const { rowItems, totalHeight, taskYOffsets } = useMemo(() => {
    const items: RowItem[] = []
    const yMap = new Map<string, number>()
    let y = 0

    for (const group of sectionGroups) {
      items.push({ type: "section-header", section: group.section, yOffset: y })
      y += SECTION_HEADER_HEIGHT

      for (const task of group.tasks) {
        items.push({ type: "task", task, yOffset: y })
        yMap.set(task.id, y)
        y += ROW_HEIGHT
      }
    }

    return { rowItems: items, totalHeight: y, taskYOffsets: yMap }
  }, [sectionGroups])

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getDateRange(projectTasks),
    [projectTasks]
  )

  const totalDays = daysBetween(rangeStart, rangeEnd)
  const chartWidth = totalDays * DAY_WIDTH
  const chartHeight = totalHeight

  // Build a lookup: taskId -> row index (using y-offsets)
  const taskRowIndex = useMemo(() => {
    return taskYOffsets
  }, [taskYOffsets])

  // Today marker
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOffset = daysBetween(rangeStart, today)

  // Generate column dates for the header
  const headerDates = useMemo(() => {
    const dates: Date[] = []
    const d = new Date(rangeStart)
    for (let i = 0; i <= totalDays; i++) {
      dates.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return dates
  }, [rangeStart, totalDays])

  // Dependency arrows and related links
  const { depArrows, relatedLines } = useMemo(() => {
    const depArrows: {
      id: string
      path: string
      fromX: number
      fromY: number
      toX: number
      toY: number
      fromTask: string
      toTask: string
    }[] = []
    const relatedLines: {
      id: string
      path: string
      fromX: number
      fromY: number
      toX: number
      toY: number
      fromTask: string
      toTask: string
    }[] = []

    for (const task of projectTasks) {
      const taskY = taskRowIndex.get(task.id)
      if (taskY === undefined || !task.dueDate) continue

      const taskDayOffset = daysBetween(rangeStart, new Date(task.dueDate + "T00:00:00"))
      // Bar spans 3 days before the due date through the due date
      const barStartX = (taskDayOffset - 3) * DAY_WIDTH
      const barEndX = (taskDayOffset + 1) * DAY_WIDTH
      const barCenterY = taskY + ROW_HEIGHT / 2

      // Dependencies
      for (const dep of task.dependencies) {
        // Show arrows where this task has a "blocked-by" dependency
        if (dep.type !== "blocked-by") continue
        const depY = taskRowIndex.get(dep.taskId)
        const depTask = projectTasks.find((t) => t.id === dep.taskId)
        if (depY === undefined || !depTask?.dueDate) continue

        const depDayOffset = daysBetween(rangeStart, new Date(depTask.dueDate + "T00:00:00"))
        const depBarEndX = (depDayOffset + 1) * DAY_WIDTH
        const depBarCenterY = depY + ROW_HEIGHT / 2

        depArrows.push({
          id: `dep-${depTask.id}-${task.id}`,
          path: buildArrowPath(depBarEndX, depBarCenterY, barStartX, barCenterY),
          fromX: depBarEndX,
          fromY: depBarCenterY,
          toX: barStartX,
          toY: barCenterY,
          fromTask: depTask.id,
          toTask: task.id,
        })
      }

      // Related / linked tasks
      for (const link of task.linkedTasks) {
        if (link.type !== "related") continue
        const linkY = taskRowIndex.get(link.taskId)
        const linkTask = projectTasks.find((t) => t.id === link.taskId)
        if (linkY === undefined || !linkTask?.dueDate) continue
        // Only draw once (lower id first)
        if (task.id > link.taskId) continue

        const linkDayOffset = daysBetween(rangeStart, new Date(linkTask.dueDate + "T00:00:00"))
        const linkBarStartX = (linkDayOffset - 3) * DAY_WIDTH
        const linkBarEndX = (linkDayOffset + 1) * DAY_WIDTH
        const linkBarCenterY = linkY + ROW_HEIGHT / 2

        // Connect from rightmost bar's right edge to leftmost bar's left edge
        let fromX: number, fromY: number, toX: number, toY: number
        if (barEndX <= linkBarStartX) {
          fromX = barEndX; fromY = barCenterY; toX = linkBarStartX; toY = linkBarCenterY
        } else if (linkBarEndX <= barStartX) {
          fromX = linkBarEndX; fromY = linkBarCenterY; toX = barStartX; toY = barCenterY
        } else {
          // Overlapping bars: connect right edges
          fromX = barEndX; fromY = barCenterY; toX = linkBarEndX; toY = linkBarCenterY
        }

        relatedLines.push({
          id: `rel-${task.id}-${link.taskId}`,
          path: buildRelatedPath(fromX, fromY, toX, toY),
          fromX,
          fromY,
          toX,
          toY,
          fromTask: task.id,
          toTask: link.taskId,
        })
      }
    }

    return { depArrows, relatedLines }
  }, [projectTasks, taskRowIndex, rangeStart])

  if (projectTasks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        No tasks in this project
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Task labels */}
        <div className="shrink-0 border-r border-border bg-card" style={{ width: LABEL_WIDTH }}>
          {/* Header spacer */}
          <div
            className="flex items-end border-b border-border px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ height: HEADER_HEIGHT }}
          >
            Task
          </div>
          <div className="overflow-hidden">
            <div style={{ height: chartHeight }}>
              {rowItems.map((item, i) => {
                if (item.type === "section-header") {
                  const style = getSectionStyle(item.section.name)
                  return (
                    <div
                      key={`sh-${item.section.id}`}
                      className={cn(
                        "flex items-center gap-2 px-3 border-b font-semibold text-xs uppercase tracking-wider",
                        style.bg,
                        style.text,
                        style.border
                      )}
                      style={{ height: SECTION_HEADER_HEIGHT }}
                    >
                      <span>{style.icon}</span>
                      <span>{item.section.name}</span>
                      <span className="text-[10px] font-normal opacity-60">
                        ({sectionGroups.find(g => g.section.id === item.section.id)?.tasks.length})
                      </span>
                    </div>
                  )
                }
                const task = item.task
                const isHovered = hoveredTaskId === task.id
                const statusStyles = getStatusStyles(task)
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 border-b border-border/50 px-3 cursor-pointer transition-colors",
                      isHovered && "bg-accent",
                    )}
                    style={{ height: ROW_HEIGHT, opacity: statusStyles.opacity }}
                    onClick={() => setActiveTask(task.id)}
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          store.projects.find((p) => p.id === task.projectId)?.color || "#888",
                      }}
                    />
                    <span className={cn(
                      "truncate text-sm text-foreground",
                      statusStyles.pattern === "done" && "line-through opacity-70"
                    )}>{task.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Gantt chart area */}
        <ScrollArea className="flex-1 min-w-0">
          <div>
            {/* Date header */}
            <div
              className="sticky top-0 z-10 flex border-b border-border bg-card"
              style={{ height: HEADER_HEIGHT, width: chartWidth }}
            >
              {headerDates.map((date, i) => {
                const isToday = date.toDateString() === today.toDateString()
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                const isMonth1 = date.getDate() === 1
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-end pb-1 border-r border-border/30 shrink-0",
                      isToday && "bg-primary/5",
                      isWeekend && "bg-muted/30"
                    )}
                    style={{ width: DAY_WIDTH }}
                  >
                    {(isMonth1 || i === 0) && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        isToday
                          ? "font-bold text-primary"
                          : isWeekend
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground"
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Chart body */}
            <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
              {/* Row backgrounds (section headers + task rows) */}
              {rowItems.map((item) => {
                if (item.type === "section-header") {
                  const style = getSectionStyle(item.section.name)
                  return (
                    <div
                      key={`bg-sh-${item.section.id}`}
                      className={cn("absolute left-0 right-0 border-b", style.bg, style.border)}
                      style={{ top: item.yOffset, height: SECTION_HEADER_HEIGHT }}
                    />
                  )
                }
                return (
                  <div
                    key={`bg-${item.task.id}`}
                    className={cn(
                      "absolute left-0 right-0 border-b border-border/30 transition-colors",
                      hoveredTaskId === item.task.id && "bg-accent/50"
                    )}
                    style={{ top: item.yOffset, height: ROW_HEIGHT }}
                    onMouseEnter={() => setHoveredTaskId(item.task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                  />
                )
              })}

              {/* Weekend columns */}
              {headerDates.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                if (!isWeekend) return null
                return (
                  <div
                    key={`weekend-${i}`}
                    className="absolute top-0 bottom-0 bg-muted/20"
                    style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                  />
                )
              })}

              {/* Today marker */}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <div
                  className="absolute top-0 bottom-0 z-[5] w-[2px] bg-primary/60"
                  style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
                />
              )}

              {/* SVG overlay for arrows and lines */}
              <svg
                className="absolute inset-0 z-[3] pointer-events-none"
                width={chartWidth}
                height={chartHeight}
              >


                {/* Related task links (dashed, curved with matching dots) */}
                {relatedLines.map((line) => {
                  const isHighlighted =
                    hoveredTaskId === line.fromTask || hoveredTaskId === line.toTask
                  return (
                    <g key={line.id}>
                      <path
                        d={line.path}
                        className={cn(
                          "transition-opacity",
                          isHighlighted
                            ? "stroke-blue-500 dark:stroke-blue-400"
                            : "stroke-blue-400/40 dark:stroke-blue-500/30"
                        )}
                        strokeWidth={isHighlighted ? 2 : 1.5}
                        strokeDasharray="6 4"
                        fill="none"
                      />
                      <circle
                        cx={line.fromX}
                        cy={line.fromY}
                        r={isHighlighted ? 3 : 2.5}
                        className={cn(
                          isHighlighted
                            ? "fill-blue-500 dark:fill-blue-400"
                            : "fill-blue-400/40 dark:fill-blue-500/30"
                        )}
                      />
                      <circle
                        cx={line.toX}
                        cy={line.toY}
                        r={isHighlighted ? 3 : 2.5}
                        className={cn(
                          isHighlighted
                            ? "fill-blue-500 dark:fill-blue-400"
                            : "fill-blue-400/40 dark:fill-blue-500/30"
                        )}
                      />
                    </g>
                  )
                })}

                {/* Dependency arrows (solid line with directional dots) */}
                {depArrows.map((arrow) => {
                  const isHighlighted =
                    hoveredTaskId === arrow.fromTask || hoveredTaskId === arrow.toTask
                  return (
                    <g key={arrow.id}>
                      <path
                        d={arrow.path}
                        className={cn(
                          "transition-opacity",
                          isHighlighted
                            ? "stroke-orange-600 dark:stroke-orange-300"
                            : "stroke-orange-500/40 dark:stroke-orange-400/30"
                        )}
                        strokeWidth={isHighlighted ? 2 : 1.5}
                        fill="none"
                      />
                      {/* Source dot (small) */}
                      <circle
                        cx={arrow.fromX}
                        cy={arrow.fromY}
                        r={isHighlighted ? 3 : 2.5}
                        className={cn(
                          isHighlighted
                            ? "fill-orange-600 dark:fill-orange-300"
                            : "fill-orange-500/40 dark:fill-orange-400/30"
                        )}
                      />
                      {/* Target dot (larger, indicates direction) */}
                      <circle
                        cx={arrow.toX}
                        cy={arrow.toY}
                        r={isHighlighted ? 5 : 4}
                        className={cn(
                          isHighlighted
                            ? "fill-orange-600 dark:fill-orange-300"
                            : "fill-orange-500/40 dark:fill-orange-400/30"
                        )}
                      />
                    </g>
                  )
                })}
              </svg>

              {/* Task bars */}
              {projectTasks.map((task) => {
                if (!task.dueDate) return null
                const taskY = taskYOffsets.get(task.id)
                if (taskY === undefined) return null
                const dayOffset = daysBetween(rangeStart, new Date(task.dueDate + "T00:00:00"))
                // Bar spans 3 days before due date to due date (4 day width)
                const barLeft = (dayOffset - 3) * DAY_WIDTH
                const barWidth = 4 * DAY_WIDTH
                const barTop = taskY + BAR_Y_OFFSET
                const colors = getPriorityColor(task.priority)
                const isHovered = hoveredTaskId === task.id
                const statusStyles = getStatusStyles(task)
                const isDone = statusStyles.pattern === "done"
                const isInProgress = statusStyles.pattern === "in-progress"
                const isBlocked = statusStyles.pattern === "blocked"

                return (
                  <Tooltip key={task.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "absolute z-[4] flex items-center rounded-md cursor-pointer border transition-all overflow-hidden",
                          isHovered ? "ring-2 ring-primary/40 shadow-md scale-[1.02]" : "shadow-sm"
                        )}
                        style={{
                          left: barLeft,
                          top: barTop,
                          width: barWidth,
                          height: BAR_HEIGHT,
                          backgroundColor: colors.fill,
                          borderColor: isDone ? "hsl(var(--success))" : isBlocked ? "hsl(var(--destructive))" : "transparent",
                          opacity: statusStyles.opacity,
                        }}
                        onClick={() => setActiveTask(task.id)}
                        onMouseEnter={() => setHoveredTaskId(task.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                      >
                        {/* Progress fill for in-progress tasks */}
                        {isInProgress && (
                          <div
                            className="absolute inset-y-0 left-0 bg-background/20 border-r-2 border-white/30"
                            style={{ width: "50%" }}
                          />
                        )}
                        {/* Status icon */}
                        {isDone && (
                          <span className="shrink-0 ml-1.5 text-[10px]">✓</span>
                        )}
                        {isInProgress && (
                          <span className="shrink-0 ml-1.5 text-[10px] z-[1]">◐</span>
                        )}
                        {isBlocked && (
                          <span className="shrink-0 ml-1.5 text-[10px]">⊘</span>
                        )}
                        <span
                          className={cn(
                            "truncate px-2 text-xs font-medium z-[1]",
                            isDone && "line-through"
                          )}
                          style={{ color: colors.text }}
                        >
                          {task.title}
                        </span>
                        {/* Done overlay with strikethrough effect */}
                        {isDone && (
                          <div className="absolute inset-0 bg-background/25 pointer-events-none" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(new Date(task.dueDate + "T00:00:00"))}
                        </p>
                        {task.assignee && (
                          <p className="text-xs text-muted-foreground">
                            Assignee: {task.assignee}
                          </p>
                        )}
                        <p className="text-xs capitalize">
                          Status: <span className={cn(
                            task.status === "done" && "text-emerald-600 dark:text-emerald-400",
                            task.status === "in-progress" && "text-blue-600 dark:text-blue-400",
                            task.status === "blocked" && "text-red-600 dark:text-red-400",
                            task.status === "todo" && "text-muted-foreground"
                          )}>{task.status}</span>
                        </p>
                        {task.dependencies.length > 0 && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {task.dependencies.filter((d) => d.type === "blocked-by").length} blocking dependency
                          </p>
                        )}
                        {task.linkedTasks.length > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {task.linkedTasks.length} related task{task.linkedTasks.length > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 border-t border-border bg-card px-4 py-2">
        <div className="flex items-center gap-1.5">
          <svg width="30" height="12" className="shrink-0">
            <circle cx="3" cy="6" r="2.5" className="fill-orange-500 dark:fill-orange-400" />
            <line x1="5.5" y1="6" x2="21" y2="6" strokeWidth="1.5" className="stroke-orange-500 dark:stroke-orange-400" />
            <circle cx="25" cy="6" r="4" className="fill-orange-500 dark:fill-orange-400" />
          </svg>
          <span className="text-[11px] text-muted-foreground">Dependency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-[2px] w-5 border-t-2 border-dashed border-blue-500 dark:border-blue-400" />
          <span className="text-[11px] text-muted-foreground">Related</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-[2px] bg-primary/60" />
          <span className="text-[11px] text-muted-foreground">Today</span>
        </div>
        <div className="ml-2 h-3 border-l border-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">✓</span>
          <span className="text-[11px] text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">◐</span>
          <span className="text-[11px] text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">⊘</span>
          <span className="text-[11px] text-muted-foreground">Blocked</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
