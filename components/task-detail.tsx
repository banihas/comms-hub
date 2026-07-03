"use client"

import { useState, useEffect } from "react"
import {
  X,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  User,
  Tag,
  Trash2,
  ArrowRight,
  Send,
  Megaphone,
  FileCheck,
  Link2,
  LinkIcon,
  GitBranch,
  Plus,
  X as XIcon,
  ChevronDown,
  CalendarClock,
  BookOpen,
  Users,
  Building2,
  PenLine,
  ClipboardCheck,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  CalendarPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  toggleTaskComplete,
  updateTask,
  deleteTask,
  moveTask,
  addComment,
  linkTasks,
  unlinkTasks,
  addDependency,
  removeDependency,
  requestApproval,
  respondToApproval,
  isFullyApproved,
  getEventForTask,
  setActiveView,
  EVENT_FORMAT_META,
  TEAM_MEMBERS,
  CURRENT_USER,
  EDITORIAL_PUBLISHING_TEAM,
  AUDIENCE_OPTIONS,
  ENTERPRISE_CATEGORY_OPTIONS,
  type Priority,
  type ContentStatus,
  type Audience,
  type EnterpriseCategory,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CommsCalendarDialog } from "@/components/comms-calendar-dialog"

function getInitials(name: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function TaskDetail() {
  const store = useStore()
  const task = store.tasks.find((t) => t.id === store.activeTaskId)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [commentText, setCommentText] = useState("")
  const [linkSearch, setLinkSearch] = useState("")
  const [depSearch, setDepSearch] = useState("")
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [depPopoverOpen, setDepPopoverOpen] = useState(false)
  const [commsDialogOpen, setCommsDialogOpen] = useState(false)
  const [approvalPopoverOpen, setApprovalPopoverOpen] = useState(false)
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
    }
  }, [task])

  if (!task) return null

  const section = store.sections.find((s) => s.id === task.sectionId)
  const project = store.projects.find((p) => p.id === task.projectId)
  const linkedEvent = getEventForTask(task.id)
  const projectSections = store.sections
    .filter((s) => s.projectId === task.projectId)
    .sort((a, b) => a.order - b.order)

  const taskComments = store.comments
    .filter((c) => c.taskId === task.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  function handleTitleBlur() {
    if (title.trim() && title !== task!.title) {
      updateTask(task!.id, { title: title.trim() })
    }
  }

  function handleDescBlur() {
    if (description !== task!.description) {
      updateTask(task!.id, { description })
    }
  }

  function handleAddComment() {
    if (commentText.trim()) {
      addComment(task!.id, commentText.trim())
      setCommentText("")
    }
  }

  return (
    <div className="flex h-full w-[420px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => toggleTaskComplete(task.id)}>
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/50 hover:text-primary transition-colors" />
            )}
          </button>
          <span className="text-xs font-medium text-muted-foreground">
            {task.completed ? "Completed" : "Mark complete"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              deleteTask(task.id)
            }}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTask(null)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-5">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
            }}
            className="mb-4 w-full text-lg font-bold text-foreground bg-transparent focus:outline-none focus:ring-0"
          />

          {/* Linked event */}
          {linkedEvent && (
            <button
              onClick={() => {
                setActiveTask(null)
                setActiveView("events")
              }}
              className="mb-4 flex w-full items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-left transition-colors hover:border-primary/40"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `color-mix(in srgb, ${EVENT_FORMAT_META[linkedEvent.format].chart} 14%, transparent)`,
                  color: EVENT_FORMAT_META[linkedEvent.format].chart,
                }}
              >
                <CalendarPlus className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Linked event
                </span>
                <span className="block truncate text-sm font-medium">{linkedEvent.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )}

          {/* Metadata Grid */}
          <div className="mb-6 flex flex-col gap-3">
            {/* Assignee */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assignee</span>
              </div>
              <Select
                value={task.assignee || "unassigned"}
                onValueChange={(val) => updateTask(task.id, { assignee: val === "unassigned" ? "" : val })}
              >
                <SelectTrigger className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {TEAM_MEMBERS.map((name) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        {name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due Date</span>
              </div>
              <Input
                type="date"
                value={task.dueDate || ""}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })}
                className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent"
              />
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-4 w-4" />
                <span>Priority</span>
              </div>
              <Select
                value={task.priority}
                onValueChange={(val) => updateTask(task.id, { priority: val as Priority })}
              >
                <SelectTrigger className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="text-destructive">High</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="text-warning">Medium</span>
                  </SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <span>Section</span>
              </div>
              <Select
                value={task.sectionId}
                onValueChange={(val) => moveTask(task.id, val)}
              >
                <SelectTrigger className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Project</span>
              </div>
              <span className="text-sm text-foreground">{project?.name}</span>
            </div>

            {/* Content Label */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <Megaphone className="h-4 w-4" />
                <span>Label</span>
              </div>
              <Select
                value={task.contentLabel || "none"}
                onValueChange={(val) => {
                  const label = val === "none" ? undefined : val
                  updateTask(task.id, { contentLabel: label })
                  // Auto-trigger approval if setting "For Comms Calendar" on a task that already has "CIBC Today"
                  if (label === "For Comms Calendar" && task.commsChannels?.includes("CIBC Today")) {
                    requestApproval(task.id, EDITORIAL_PUBLISHING_TEAM)
                  }
                }}
              >
                <SelectTrigger className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="For Comms Calendar">
                    <span className="text-primary font-medium">For Comms Calendar</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source URL */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                <span>Source URL</span>
              </div>
              <Input
                type="url"
                value={task.commsUrl || ""}
                onChange={(e) => updateTask(task.id, { commsUrl: e.target.value })}
                placeholder="https://..."
                className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent"
              />
            </div>

            {/* Content Status */}
            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2 text-sm text-muted-foreground">
                <FileCheck className="h-4 w-4" />
                <span>Status</span>
              </div>
              <Select
                value={task.contentStatus || "none"}
                onValueChange={(val) => {
                  if (val === "Confirmed" && task.approvalRequired && !isFullyApproved(task)) {
                    return
                  }
                  updateTask(task.id, { contentStatus: val === "none" ? undefined : val as ContentStatus })
                }}
              >
                <SelectTrigger className="h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Pending">
                    <span className="text-amber-600 dark:text-amber-400">Pending</span>
                  </SelectItem>
                  <SelectItem value="Confirmed" disabled={task.approvalRequired && !isFullyApproved(task)}>
                    <span className="text-emerald-600 dark:text-emerald-400">Confirmed</span>
                    {task.approvalRequired && !isFullyApproved(task) && (
                      <span className="ml-1 text-[10px] text-muted-foreground">(approval required)</span>
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comms Calendar Details — summary + dialog trigger */}
          {task.contentLabel === "For Comms Calendar" && (
            <>
              <Separator className="mb-4" />
              <div className="mb-4" data-tour="comms-calendar-details">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Megaphone className="h-3.5 w-3.5" />
                    Comms Calendar Details
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCommsDialogOpen(true)}
                  >
                    Edit Details
                  </Button>
                </div>
                {/* Summary row */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {task.commsTitle && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground truncate max-w-[200px]">
                      {task.commsTitle}
                    </span>
                  )}
                  {(task.commsChannels || []).map((ch) => (
                    <span
                      key={ch}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {ch}
                    </span>
                  ))}
                  {!(task.commsTitle || (task.commsChannels && task.commsChannels.length > 0)) && (
                    <span className="text-xs text-muted-foreground/60">No details configured yet</span>
                  )}
                </div>
              </div>
              <CommsCalendarDialog
                task={task}
                open={commsDialogOpen}
                onOpenChange={setCommsDialogOpen}
              />
            </>
          )}

          {/* Approvals */}
          <Separator className="mb-4" />
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Approvals
              </p>
              <Popover open={approvalPopoverOpen} onOpenChange={(open) => {
                setApprovalPopoverOpen(open)
                if (!open) setSelectedApprovers([])
              }}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <p className="mb-2 text-xs font-medium text-foreground">Request approval from</p>
                  <div className="space-y-1.5 mb-3">
                    {TEAM_MEMBERS.filter((name) => name !== CURRENT_USER).map((name) => {
                      const alreadyPending = (task.approvalRequests || []).some(
                        (r) => r.requestedFrom === name && r.status === "pending"
                      )
                      const isSelected = selectedApprovers.includes(name)
                      return (
                        <button
                          key={name}
                          disabled={alreadyPending}
                          onClick={() => {
                            setSelectedApprovers((prev) =>
                              prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
                            )
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                            alreadyPending
                              ? "opacity-50 cursor-not-allowed"
                              : isSelected
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent"
                          )}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1">{name}</span>
                          {alreadyPending && (
                            <span className="text-[10px] text-amber-600">pending</span>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs"
                    disabled={selectedApprovers.length === 0}
                    onClick={() => {
                      requestApproval(task.id, selectedApprovers)
                      setSelectedApprovers([])
                      setApprovalPopoverOpen(false)
                    }}
                  >
                    Request Approval ({selectedApprovers.length})
                  </Button>
                </PopoverContent>
              </Popover>
            </div>

            {/* Approval status warning */}
            {task.approvalRequired && !isFullyApproved(task) && (
              <div className="mb-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Approval required before status can be set to &quot;Confirmed&quot;
                </p>
              </div>
            )}

            {/* Approver list */}
            {(task.approvalRequests || []).length > 0 ? (
              <div className="flex flex-col gap-1">
                {(task.approvalRequests || []).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                  >
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                        {getInitials(req.requestedFrom)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm text-foreground truncate">{req.requestedFrom}</span>
                    {req.status === "pending" && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-1.5 py-0 shrink-0">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        Pending
                      </Badge>
                    )}
                    {req.status === "approved" && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0 shrink-0">
                        <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                        Approved
                      </Badge>
                    )}
                    {req.status === "rejected" && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                        <ShieldX className="h-2.5 w-2.5 mr-0.5" />
                        Rejected
                      </Badge>
                    )}
                    {/* Approve/Reject for current user */}
                    {req.requestedFrom === CURRENT_USER && req.status === "pending" && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => respondToApproval(task.id, CURRENT_USER, "rejected")}
                          className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Reject"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => respondToApproval(task.id, CURRENT_USER, "approved")}
                          className="rounded p-1 text-muted-foreground hover:text-emerald-600 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-2 text-xs text-muted-foreground/60">No approvals requested</p>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Linked Tasks (Initiative) */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                Linked Tasks
              </p>
              <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Input
                    placeholder="Search tasks to link..."
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    className="mb-2 h-8 text-sm"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {store.tasks
                      .filter((t) =>
                        t.id !== task.id &&
                        !task.linkedTasks.some((l) => l.taskId === t.id) &&
                        (linkSearch === "" || t.title.toLowerCase().includes(linkSearch.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map((t) => {
                        const tp = store.projects.find((p) => p.id === t.projectId)
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              linkTasks(task.id, t.id)
                              setLinkSearch("")
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                          >
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: tp?.color || "#888" }}
                            />
                            <span className="truncate">{t.title}</span>
                          </button>
                        )
                      })}
                    {store.tasks.filter((t) =>
                      t.id !== task.id &&
                      !task.linkedTasks.some((l) => l.taskId === t.id) &&
                      (linkSearch === "" || t.title.toLowerCase().includes(linkSearch.toLowerCase()))
                    ).length === 0 && (
                      <p className="px-2 py-3 text-center text-xs text-muted-foreground">No tasks available to link</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {task.linkedTasks.length > 0 ? (
              <div className="flex flex-col gap-1">
                {task.linkedTasks.map((link) => {
                  const linked = store.tasks.find((t) => t.id === link.taskId)
                  if (!linked) return null
                  const lp = store.projects.find((p) => p.id === linked.projectId)
                  return (
                    <div
                      key={link.taskId}
                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: lp?.color || "#888" }}
                      />
                      <button
                        onClick={() => setActiveTask(linked.id)}
                        className="flex-1 truncate text-left text-sm text-foreground hover:underline"
                      >
                        {linked.title}
                      </button>
                      <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                        related
                      </Badge>
                      <button
                        onClick={() => unlinkTasks(task.id, linked.id)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="px-2 text-xs text-muted-foreground/60">No linked tasks</p>
            )}
          </div>

          {/* Dependencies */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5" />
                Dependencies
              </p>
              <Popover open={depPopoverOpen} onOpenChange={setDepPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <Input
                    placeholder="Search tasks to depend on..."
                    value={depSearch}
                    onChange={(e) => setDepSearch(e.target.value)}
                    className="mb-2 h-8 text-sm"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {store.tasks
                      .filter((t) =>
                        t.id !== task.id &&
                        !task.dependencies.some((d) => d.taskId === t.id) &&
                        (depSearch === "" || t.title.toLowerCase().includes(depSearch.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map((t) => {
                        const tp = store.projects.find((p) => p.id === t.projectId)
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              addDependency(task.id, t.id)
                              setDepSearch("")
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                          >
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: tp?.color || "#888" }}
                            />
                            <span className="truncate">{t.title}</span>
                          </button>
                        )
                      })}
                    {store.tasks.filter((t) =>
                      t.id !== task.id &&
                      !task.dependencies.some((d) => d.taskId === t.id) &&
                      (depSearch === "" || t.title.toLowerCase().includes(depSearch.toLowerCase()))
                    ).length === 0 && (
                      <p className="px-2 py-3 text-center text-xs text-muted-foreground">No tasks available</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {task.dependencies.length > 0 ? (
              <div className="flex flex-col gap-1">
                {task.dependencies.map((dep) => {
                  const depTask = store.tasks.find((t) => t.id === dep.taskId)
                  if (!depTask) return null
                  const dp = store.projects.find((p) => p.id === depTask.projectId)
                  return (
                    <div
                      key={dep.taskId}
                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: dp?.color || "#888" }}
                      />
                      <button
                        onClick={() => setActiveTask(depTask.id)}
                        className="flex-1 truncate text-left text-sm text-foreground hover:underline"
                      >
                        {depTask.title}
                      </button>
                      <Badge
                        variant={dep.type === "blocked-by" ? "destructive" : "default"}
                        className="shrink-0 text-[10px] px-1.5 py-0"
                      >
                        {dep.type === "blocked-by" ? "blocked by" : "blocking"}
                      </Badge>
                      <button
                        onClick={() => removeDependency(
                          dep.type === "blocked-by" ? task.id : dep.taskId,
                          dep.type === "blocked-by" ? dep.taskId : task.id
                        )}
                        className="shrink-0 rounded p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="px-2 text-xs text-muted-foreground/60">No dependencies</p>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Tags */}
          {task.tags.length > 0 && (
            <Collapsible defaultOpen className="mb-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between group">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </p>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Description */}
          <Collapsible defaultOpen className="mb-0">
            <CollapsibleTrigger className="flex w-full items-center justify-between group">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescBlur}
                placeholder="Add a description..."
                rows={4}
                className="mt-2 resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-4" />

          {/* Comments / Activity */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activity
            </p>

            {/* Comment input */}
            <div className="mb-4 flex items-start gap-3">
              <Avatar className="mt-0.5 h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                  {getInitials(CURRENT_USER)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="flex flex-col gap-3">
              {taskComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="mt-0.5 h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                      {getInitials(comment.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">{comment.author}</span>
                      <span className="text-[10px] text-muted-foreground/60" suppressHydrationWarning>
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/80 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}

              {/* Created date */}
              <div className="flex items-start gap-3 pt-1">
                <Avatar className="mt-0.5 h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    <span suppressHydrationWarning>
                      Task created on {new Date(task.createdAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

