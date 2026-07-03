"use client"

import { useState } from "react"
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Hash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  setActiveTask,
  setActiveProject,
  setActiveView,
  respondToApproval,
  CURRENT_USER,
  type Task,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

function getInitials(name: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function NeedsMyApprovalSection({ tasks }: { tasks: Task[] }) {
  const store = useStore()

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">You&apos;re all caught up</p>
        <p className="text-xs text-muted-foreground/60 mt-1">No approvals waiting for you</p>
      </div>
    )
  }

  return (
    <div>
      {tasks.map((task) => {
        const project = store.projects.find((p) => p.id === task.projectId)
        const myRequest = (task.approvalRequests || []).find(
          (r) => r.requestedFrom === CURRENT_USER && r.status === "pending"
        )
        if (!myRequest) return null

        return (
          <div
            key={task.id}
            className="group border-b border-border px-6 py-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  setActiveTask(task.id)
                  setActiveProject(task.projectId)
                  setActiveView("approvals")
                }}
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {project && (
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" style={{ color: project.color }} />
                      {project.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {myRequest.requestedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(myRequest.requestedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => respondToApproval(task.id, CURRENT_USER, "rejected")}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => respondToApproval(task.id, CURRENT_USER, "approved")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MyRequestsSection({ tasks }: { tasks: Task[] }) {
  const store = useStore()

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No approval requests</p>
        <p className="text-xs text-muted-foreground/60 mt-1">When you request approvals on tasks, they&apos;ll appear here</p>
      </div>
    )
  }

  return (
    <div>
      {tasks.map((task) => {
        const project = store.projects.find((p) => p.id === task.projectId)
        const requests = (task.approvalRequests || []).filter(
          (r) => r.requestedBy === CURRENT_USER
        )
        const allApproved = requests.length > 0 && requests.every((r) => r.status === "approved")
        const hasRejection = requests.some((r) => r.status === "rejected")
        const pendingCount = requests.filter((r) => r.status === "pending").length

        return (
          <div
            key={task.id}
            className="border-b border-border px-6 py-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => {
              setActiveTask(task.id)
              setActiveProject(task.projectId)
              setActiveView("approvals")
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </p>
                  {allApproved && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                      Fully Approved
                    </Badge>
                  )}
                  {hasRejection && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Rejected
                    </Badge>
                  )}
                  {!allApproved && !hasRejection && pendingCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-1.5 py-0">
                      {pendingCount} Pending
                    </Badge>
                  )}
                </div>
                {project && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" style={{ color: project.color }} />
                    {project.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {requests.map((r) => (
                  <div key={r.id} className="relative" title={`${r.requestedFrom}: ${r.status}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback
                        className={cn(
                          "text-[9px] font-semibold",
                          r.status === "approved" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                          r.status === "rejected" && "bg-destructive/10 text-destructive",
                          r.status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}
                      >
                        {getInitials(r.requestedFrom)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ApprovalsView() {
  const store = useStore()
  const [activeTab, setActiveTab] = useState<"needs-my-approval" | "my-requests">("needs-my-approval")

  const needsMyApproval = store.tasks.filter((t) =>
    (t.approvalRequests || []).some(
      (r) => r.requestedFrom === CURRENT_USER && r.status === "pending"
    )
  )

  const myRequests = store.tasks.filter((t) =>
    (t.approvalRequests || []).some((r) => r.requestedBy === CURRENT_USER)
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4" data-tour="approvals-area">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Approvals</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage approval requests across your tasks
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6">
        <button
          onClick={() => setActiveTab("needs-my-approval")}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "needs-my-approval"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Needs My Approval
          {needsMyApproval.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {needsMyApproval.length}
            </span>
          )}
          {activeTab === "needs-my-approval" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("my-requests")}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "my-requests"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Requests
          {myRequests.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {myRequests.length}
            </span>
          )}
          {activeTab === "my-requests" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeTab === "needs-my-approval" ? (
          <NeedsMyApprovalSection tasks={needsMyApproval} />
        ) : (
          <MyRequestsSection tasks={myRequests} />
        )}
      </ScrollArea>
    </div>
  )
}
