"use client"

import {
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AtSign,
  MailOpen,
  Inbox,
  ClipboardCheck,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  markNotificationRead,
  markAllNotificationsRead,
  setActiveTask,
  setActiveProject,
  setActiveView,
} from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const notificationIcons = {
  assignment: UserPlus,
  comment: MessageSquare,
  "due-soon": Clock,
  completed: CheckCircle2,
  mention: AtSign,
  "approval-requested": ClipboardCheck,
  "approval-approved": ShieldCheck,
  "approval-rejected": ShieldX,
}

const notificationColors = {
  assignment: "text-primary",
  comment: "text-blue-500",
  "due-soon": "text-warning",
  completed: "text-success",
  mention: "text-purple-500",
  "approval-requested": "text-amber-500",
  "approval-approved": "text-emerald-500",
  "approval-rejected": "text-destructive",
}

export function InboxView() {
  const store = useStore()
  const notifications = store.notifications
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const unreadCount = notifications.filter((n) => !n.read).length

  function handleClickNotification(notification: (typeof notifications)[0]) {
    markNotificationRead(notification.id)
    if (notification.taskId) {
      setActiveTask(notification.taskId)
      if (notification.projectId) {
        setActiveProject(notification.projectId)
      }
      setActiveView("project")
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 pt-8 pb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllNotificationsRead()}
            className="gap-1.5 text-xs"
          >
            <MailOpen className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </header>

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Inbox className="mb-3 h-10 w-10" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type]
              const iconColor = notificationColors[notification.type]

              return (
                <div
                  key={notification.id}
                  onClick={() => handleClickNotification(notification)}
                  className={cn(
                    "flex items-start gap-4 border-b border-border px-8 py-4 cursor-pointer transition-colors",
                    notification.read
                      ? "bg-card hover:bg-accent/30"
                      : "bg-primary/[0.03] hover:bg-primary/[0.06]"
                  )}
                >
                  {/* Unread dot */}
                  <div className="mt-2 w-2 shrink-0">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
                      iconColor
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notification.read && "font-medium")}>
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.description}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/60" suppressHydrationWarning>
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
