"use client"

import {
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  setActiveProject,
  setActiveView,
  CURRENT_USER,
  type Task,
  type ApprovalRequest,
} from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

function formatDateUTC(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function HomeView() {
  const store = useStore()
  const today = new Date()
  const todayStr = getDateStr(today)

  const tomorrowDate = new Date(today)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = getDateStr(tomorrowDate)

  const fourteenDaysOut = new Date(today)
  fourteenDaysOut.setDate(fourteenDaysOut.getDate() + 14)
  const fourteenDaysStr = getDateStr(fourteenDaysOut)

  const sixtyDaysAgo = new Date(today)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const sixtyDaysAgoStr = getDateStr(sixtyDaysAgo)

  // All comms tasks
  const commsTasks = store.tasks.filter((t) => t.contentLabel === "For Comms Calendar")

  // Upcoming comms (next 14 days by publish date)
  const upcomingComms = commsTasks
    .filter(
      (t) =>
        t.commsPublishDate &&
        t.commsPublishDate >= todayStr &&
        t.commsPublishDate <= fourteenDaysStr
    )
    .sort((a, b) => (a.commsPublishDate || "").localeCompare(b.commsPublishDate || ""))

  // All approval requests across all tasks
  const allApprovals: (ApprovalRequest & { task: Task })[] = store.tasks
    .flatMap((t) =>
      (t.approvalRequests || []).map((ar) => ({ ...ar, task: t }))
    )
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const pendingApprovals = allApprovals.filter((a) => a.status === "pending")

  // Published content (confirmed, publish date in last 60 days)
  const publishedContent = commsTasks.filter(
    (t) =>
      t.contentStatus === "Confirmed" &&
      t.commsPublishDate &&
      t.commsPublishDate >= sixtyDaysAgoStr &&
      t.commsPublishDate <= todayStr
  )

  // Confirmed rate
  const confirmedCount = commsTasks.filter((t) => t.contentStatus === "Confirmed").length
  const confirmedRate = commsTasks.length > 0 ? Math.round((confirmedCount / commsTasks.length) * 100) : 0

  // Channel distribution from published content
  const channelCounts: Record<string, number> = {}
  publishedContent.forEach((t) => {
    ;(t.commsChannels || []).forEach((ch) => {
      channelCounts[ch] = (channelCounts[ch] || 0) + 1
    })
  })
  const channelEntries = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])
  const maxChannelCount = channelEntries.length > 0 ? channelEntries[0][1] : 1

  // Audience distribution from published content
  const audienceCounts: Record<string, number> = {}
  publishedContent.forEach((t) => {
    if (t.commsAudience) {
      audienceCounts[t.commsAudience] = (audienceCounts[t.commsAudience] || 0) + 1
    }
  })
  const audienceEntries = Object.entries(audienceCounts).sort((a, b) => b[1] - a[1])

  // Category distribution from published content
  const categoryCounts: Record<string, number> = {}
  publishedContent.forEach((t) => {
    if (t.commsEnterpriseCategory) {
      categoryCounts[t.commsEnterpriseCategory] = (categoryCounts[t.commsEnterpriseCategory] || 0) + 1
    }
  })
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-border bg-card px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}, {CURRENT_USER.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across the comms calendar
        </p>
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl px-8 py-6">
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-4 gap-4" data-tour="home-stats">
            <StatCard
              icon={<Calendar className="h-5 w-5 text-primary" />}
              label="Upcoming Comms"
              value={upcomingComms.length}
              subtitle="next 14 days"
            />
            <StatCard
              icon={<Timer className="h-5 w-5 text-warning" />}
              label="Pending Approvals"
              value={pendingApprovals.length}
              subtitle="awaiting response"
            />
            <StatCard
              icon={<Megaphone className="h-5 w-5 text-success" />}
              label="Published"
              value={publishedContent.length}
              subtitle="last 60 days"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
              label="Confirmed Rate"
              value={`${confirmedRate}%`}
              subtitle={`${confirmedCount} of ${commsTasks.length} items`}
            />
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Upcoming Comms */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Upcoming Comms (Next 14 Days)
                </h2>
                <button
                  onClick={() => setActiveView("content-calendar")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  View calendar <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="rounded-lg border border-border bg-card">
                {upcomingComms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle2 className="mb-2 h-8 w-8" />
                    <p className="text-sm">No upcoming comms scheduled</p>
                  </div>
                ) : (
                  upcomingComms.map((task) => (
                    <CommsTaskRow
                      key={task.id}
                      task={task}
                      todayStr={todayStr}
                      tomorrowStr={tomorrowStr}
                      projects={store.projects}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Approvals */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Approvals
                </h2>
                <button
                  onClick={() => setActiveView("approvals")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="rounded-lg border border-border bg-card">
                {allApprovals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle2 className="mb-2 h-8 w-8" />
                    <p className="text-sm">No approvals</p>
                  </div>
                ) : (
                  allApprovals.slice(0, 8).map((ar) => (
                    <ApprovalRow key={ar.id} approval={ar} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Content Performance */}
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Content Performance (Last 60 Days)
            </h2>

            {publishedContent.length === 0 ? (
              <div className="rounded-lg border border-border bg-card flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Megaphone className="mb-2 h-8 w-8" />
                <p className="text-sm">No published content in this period</p>
              </div>
            ) : (
              <>
                {/* Breakdown Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* By Channel */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      By Channel
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {channelEntries.map(([channel, count]) => (
                        <div key={channel}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-foreground truncate pr-2">{channel}</span>
                            <span className="text-xs font-medium text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${(count / maxChannelCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Audience */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      By Audience
                    </h3>
                    <div className="flex flex-col gap-2">
                      {audienceEntries.map(([audience, count]) => (
                        <div key={audience} className="flex items-center justify-between">
                          <span className="text-xs text-foreground truncate pr-2">{audience}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Category */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      By Category
                    </h3>
                    <div className="flex flex-col gap-2">
                      {categoryEntries.map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-xs text-foreground truncate pr-2">{category}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Published Items */}
                <div className="rounded-lg border border-border bg-card">
                  {publishedContent
                    .sort((a, b) => (b.commsPublishDate || "").localeCompare(a.commsPublishDate || ""))
                    .map((task) => {
                      const project = store.projects.find((p) => p.id === task.projectId)
                      const channels = task.commsChannels || []
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setActiveTask(task.id)
                            setActiveProject(task.projectId)
                            setActiveView("project")
                          }}
                          className="flex items-center gap-3 border-b last:border-b-0 border-border px-4 py-3 hover:bg-accent/30 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px]">
                            {task.commsPublishDate ? formatDateUTC(task.commsPublishDate) : ""}
                          </span>
                          <span className="flex-1 truncate text-sm text-foreground">
                            {task.commsTitle || task.title}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {channels.slice(0, 2).map((ch) => (
                              <Badge key={ch} variant="outline" className="text-[10px] px-1.5 py-0">
                                {ch}
                              </Badge>
                            ))}
                            {channels.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{channels.length - 2}</span>
                            )}
                          </div>
                          {project && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                              style={{ backgroundColor: project.color + "15", color: project.color }}
                            >
                              {project.name}
                            </span>
                          )}
                        </div>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  subtitle: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function CommsTaskRow({
  task,
  todayStr,
  tomorrowStr,
  projects,
}: {
  task: Task
  todayStr: string
  tomorrowStr: string
  projects: { id: string; name: string; color: string }[]
}) {
  const project = projects.find((p) => p.id === task.projectId)
  const publishDate = task.commsPublishDate || ""
  const isToday = publishDate === todayStr
  const isTomorrow = publishDate === tomorrowStr

  return (
    <div
      onClick={() => {
        setActiveTask(task.id)
        setActiveProject(task.projectId)
        setActiveView("project")
      }}
      className="flex items-center gap-3 border-b last:border-b-0 border-border px-4 py-3 hover:bg-accent/30 transition-colors cursor-pointer"
    >
      <span
        className={cn(
          "flex items-center gap-1 text-xs whitespace-nowrap min-w-[70px]",
          isToday ? "text-primary font-medium" : isTomorrow ? "text-warning font-medium" : "text-muted-foreground"
        )}
      >
        <Calendar className="h-3 w-3" />
        {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDateUTC(publishDate)}
      </span>
      <span className="flex-1 truncate text-sm text-foreground">
        {task.commsTitle || task.title}
      </span>
      <Badge
        variant={task.contentStatus === "Confirmed" ? "default" : "secondary"}
        className={cn(
          "text-[10px] px-1.5 py-0",
          task.contentStatus === "Confirmed" && "bg-emerald-600 hover:bg-emerald-600"
        )}
      >
        {task.contentStatus || "Pending"}
      </Badge>
      {project && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
          style={{ backgroundColor: project.color + "15", color: project.color }}
        >
          {project.name}
        </span>
      )}
    </div>
  )
}

function ApprovalRow({ approval }: { approval: ApprovalRequest & { task: Task } }) {
  const statusIcon = approval.status === "pending"
    ? <Timer className="h-4 w-4 text-warning shrink-0" />
    : approval.status === "approved"
    ? <ThumbsUp className="h-4 w-4 text-success shrink-0" />
    : <ThumbsDown className="h-4 w-4 text-destructive shrink-0" />

  return (
    <div
      onClick={() => {
        setActiveTask(approval.task.id)
        setActiveProject(approval.task.projectId)
        setActiveView("project")
      }}
      className="flex items-start gap-3 border-b last:border-b-0 border-border px-4 py-3 hover:bg-accent/30 transition-colors cursor-pointer"
    >
      <div className="mt-0.5">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          {approval.task.commsTitle || approval.task.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {approval.requestedBy} → {approval.requestedFrom}
        </p>
      </div>
      <Badge
        variant={
          approval.status === "pending" ? "secondary" : approval.status === "approved" ? "default" : "destructive"
        }
        className={cn(
          "text-[10px] px-1.5 py-0 shrink-0 mt-0.5",
          approval.status === "approved" && "bg-emerald-600 hover:bg-emerald-600"
        )}
      >
        {approval.status}
      </Badge>
    </div>
  )
}
