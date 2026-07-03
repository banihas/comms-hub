"use client"

import {
  Megaphone,
  PenLine,
  User,
  BookOpen,
  Users,
  CalendarClock,
  Building2,
  Radio,
  Mail,
  Calendar,
  Video,
  Clock,
} from "lucide-react"
import {
  updateTask,
  requestApproval,
  TEAM_MEMBERS,
  EDITORIAL_PUBLISHING_TEAM,
  CURRENT_USER,
  AUDIENCE_OPTIONS,
  ENTERPRISE_CATEGORY_OPTIONS,
  COMMS_CHANNEL_OPTIONS,
  CIBC_TODAY_BANNER_OPTIONS,
  EMAIL_TARGET_AUDIENCE_OPTIONS,
  EMAIL_MAILBOX_OPTIONS,
  EVENT_TYPE_OPTIONS,
  type Task,
  type Audience,
  type EnterpriseCategory,
  type CommsChannel,
  type CibcTodayBannerType,
  type EmailTargetAudience,
  type EmailMailbox,
  type EventType,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

function getInitials(name: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface CommsCalendarDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommsCalendarDialog({ task, open, onOpenChange }: CommsCalendarDialogProps) {
  const channels = task.commsChannels || []
  const hasCibcToday = channels.includes("CIBC Today")
  const hasVivaEngage = channels.includes("Viva Engage")
  const hasEmail = channels.includes("Email")
  const hasEvents = channels.includes("Events")
  const effectiveCommsTitle = task.commsTitle ?? task.title
  const effectiveCommsLead = task.commsLead ?? task.assignee ?? ""
  const effectiveCommsPublishDate = task.commsPublishDate ?? task.dueDate ?? ""

  function toggleChannel(channel: CommsChannel) {
    let next = [...channels]

    if (next.includes(channel)) {
      // Removing a channel
      next = next.filter((c) => c !== channel)
      const updates: Partial<Task> = { commsChannels: next }

      if (channel === "CIBC Today") {
        updates.commsCibcTodayBanner = undefined
      }
      if (channel === "Viva Engage") {
        updates.commsVivaEngageSelfPublish = undefined
        updates.commsVivaEngageAnnouncement = undefined
        updates.commsVivaEngageFeaturedConversation = undefined
        updates.commsVivaEngageVideo = undefined
      }
      if (channel === "Email") {
        updates.commsEmailTime = undefined
        updates.commsEmailTargetAudience = undefined
        updates.commsEmailMailbox = undefined
      }
      if (channel === "Events") {
        updates.commsEventType = undefined
      }
      // If removing CIBC Today, also remove auto-added Viva Engage only if it was auto-coupled
      // We leave Viva Engage in place so user can keep it independently.
      updateTask(task.id, updates)
    } else {
      // Adding a channel
      next.push(channel)
      // CIBC Today always includes Viva Engage
      if (channel === "CIBC Today" && !next.includes("Viva Engage")) {
        next.push("Viva Engage")
      }
      updateTask(task.id, { commsChannels: next })
      // Auto-request approval from Editorial & Publishing when CIBC Today is added
      if (channel === "CIBC Today" && task.contentLabel === "For Comms Calendar") {
        requestApproval(task.id, EDITORIAL_PUBLISHING_TEAM)
      }
    }
  }

  const fieldClass = "flex items-center gap-3"
  const labelClass = "flex w-32 shrink-0 items-center gap-2 text-sm text-muted-foreground"
  const inputClass = "h-8 flex-1 text-sm border-none bg-transparent shadow-none hover:bg-accent"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Comms Calendar Details
          </DialogTitle>
          <DialogDescription>
            Configure communication channels and publishing details for this item.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 pt-4 pb-6 space-y-6">

            {/* ── Core Fields ────────────────────────────── */}
            <div className="space-y-3">
              {/* Comms Title */}
              <div className={fieldClass}>
                <div className={labelClass}>
                  <PenLine className="h-4 w-4" />
                  <span>Title</span>
                </div>
                <Input
                  value={effectiveCommsTitle}
                  onChange={(e) => updateTask(task.id, { commsTitle: e.target.value || undefined })}
                  placeholder="Comms title..."
                  className={inputClass}
                />
              </div>

              {/* Comms Lead */}
              <div className={fieldClass}>
                <div className={labelClass}>
                  <User className="h-4 w-4" />
                  <span>Comms Lead</span>
                </div>
                <Select
                  value={effectiveCommsLead || "unassigned"}
                  onValueChange={(val) => updateTask(task.id, { commsLead: val === "unassigned" ? undefined : val })}
                >
                  <SelectTrigger className={inputClass}>
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

              {/* Author */}
              <div className={fieldClass}>
                <div className={labelClass}>
                  <BookOpen className="h-4 w-4" />
                  <span>Author</span>
                </div>
                <Select
                  value={task.commsAuthor || "unassigned"}
                  onValueChange={(val) => updateTask(task.id, { commsAuthor: val === "unassigned" ? undefined : val })}
                >
                  <SelectTrigger className={inputClass}>
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

              {/* Audience */}
              <div className={fieldClass}>
                <div className={labelClass}>
                  <Users className="h-4 w-4" />
                  <span>Audience</span>
                </div>
                <Select
                  value={task.commsAudience || "none"}
                  onValueChange={(val) => updateTask(task.id, { commsAudience: val === "none" ? undefined : val as Audience })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select audience</SelectItem>
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Publish Date */}
              <div className={fieldClass}>
                <div className={labelClass}>
                  <CalendarClock className="h-4 w-4" />
                  <span>Publish Date</span>
                </div>
                <Input
                  type="date"
                  value={effectiveCommsPublishDate}
                  onChange={(e) => updateTask(task.id, { commsPublishDate: e.target.value || null })}
                  className={inputClass}
                />
              </div>

              {/* Enterprise Category */}
              <div className={fieldClass}>
                <div className={labelClass}>
                  <Building2 className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <Select
                  value={task.commsEnterpriseCategory || "none"}
                  onValueChange={(val) => updateTask(task.id, { commsEnterpriseCategory: val === "none" ? undefined : val as EnterpriseCategory })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select category</SelectItem>
                    {ENTERPRISE_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* ── Channel Sources ────────────────────────── */}
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Radio className="h-3.5 w-3.5" />
                Channel Sources
              </p>

              {/* Auto-approval info banner */}
              {hasCibcToday && task.contentLabel === "For Comms Calendar" && (
                <div className="mb-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Publishing to CIBC Today requires approval from the Editorial &amp; Publishing team ({EDITORIAL_PUBLISHING_TEAM.join(", ")}) before the content status can be set to &quot;Confirmed&quot;.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {COMMS_CHANNEL_OPTIONS.map((channel) => {
                  const isChecked = channels.includes(channel)
                  const isVivaLockedByCibc = channel === "Viva Engage" && hasCibcToday

                  return (
                    <div key={channel} className="flex items-center gap-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={isChecked}
                        disabled={isVivaLockedByCibc}
                        onCheckedChange={() => toggleChannel(channel)}
                      />
                      <Label
                        htmlFor={`channel-${channel}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {channel}
                        {isVivaLockedByCibc && (
                          <span className="ml-1 text-xs text-muted-foreground">(included with CIBC Today)</span>
                        )}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── CIBC Today Options ────────────────────── */}
            {hasCibcToday && (
              <>
                <Separator />
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    CIBC Today Options
                  </p>
                  <div className={fieldClass}>
                    <div className={labelClass}>
                      <Megaphone className="h-4 w-4" />
                      <span>Banner Type</span>
                    </div>
                    <Select
                      value={task.commsCibcTodayBanner || "none"}
                      onValueChange={(val) => updateTask(task.id, { commsCibcTodayBanner: val === "none" ? undefined : val as CibcTodayBannerType })}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select banner type</SelectItem>
                        {CIBC_TODAY_BANNER_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* ── Viva Engage Options ───────────────────── */}
            {hasVivaEngage && (
              <>
                <Separator />
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    Viva Engage Options
                  </p>
                  <div className="space-y-2.5">
                    {/* Self-Publish — only if CIBC Today is NOT selected */}
                    {!hasCibcToday && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="viva-self-publish"
                          checked={task.commsVivaEngageSelfPublish || false}
                          onCheckedChange={(checked) => updateTask(task.id, { commsVivaEngageSelfPublish: !!checked })}
                        />
                        <Label htmlFor="viva-self-publish" className="text-sm font-normal cursor-pointer">
                          Self-publish
                        </Label>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="viva-announcement"
                        checked={task.commsVivaEngageAnnouncement || false}
                        onCheckedChange={(checked) => updateTask(task.id, { commsVivaEngageAnnouncement: !!checked })}
                      />
                      <Label htmlFor="viva-announcement" className="text-sm font-normal cursor-pointer">
                        Announcement
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="viva-featured"
                        checked={task.commsVivaEngageFeaturedConversation || false}
                        onCheckedChange={(checked) => updateTask(task.id, { commsVivaEngageFeaturedConversation: !!checked })}
                      />
                      <Label htmlFor="viva-featured" className="text-sm font-normal cursor-pointer">
                        Featured Conversation
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="viva-video"
                        checked={task.commsVivaEngageVideo || false}
                        onCheckedChange={(checked) => updateTask(task.id, { commsVivaEngageVideo: !!checked })}
                      />
                      <Label htmlFor="viva-video" className="text-sm font-normal cursor-pointer">
                        <span className="flex items-center gap-1.5">
                          <Video className="h-3.5 w-3.5" />
                          Video included
                        </span>
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Email Options ─────────────────────────── */}
            {hasEmail && (
              <>
                <Separator />
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    Email Options
                  </p>
                  <div className="space-y-3">
                    {/* Email Time */}
                    <div className={fieldClass}>
                      <div className={labelClass}>
                        <Clock className="h-4 w-4" />
                        <span>Send Time</span>
                      </div>
                      <Input
                        type="time"
                        value={task.commsEmailTime || ""}
                        onChange={(e) => updateTask(task.id, { commsEmailTime: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Target Audience (multi-select checkboxes) */}
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Target Audience</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {EMAIL_TARGET_AUDIENCE_OPTIONS.map((audience) => {
                          const selected = task.commsEmailTargetAudience || []
                          const isChecked = selected.includes(audience)
                          return (
                            <div key={audience} className="flex items-center gap-2">
                              <Checkbox
                                id={`email-audience-${audience}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...selected, audience]
                                    : selected.filter((a) => a !== audience)
                                  updateTask(task.id, { commsEmailTargetAudience: next.length > 0 ? next as EmailTargetAudience[] : undefined })
                                }}
                              />
                              <Label htmlFor={`email-audience-${audience}`} className="text-sm font-normal cursor-pointer">
                                {audience}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mailbox */}
                    <div className={fieldClass}>
                      <div className={labelClass}>
                        <Mail className="h-4 w-4" />
                        <span>Mailbox</span>
                      </div>
                      <Select
                        value={task.commsEmailMailbox || "none"}
                        onValueChange={(val) => updateTask(task.id, { commsEmailMailbox: val === "none" ? undefined : val as EmailMailbox })}
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select mailbox</SelectItem>
                          {EMAIL_MAILBOX_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Events Options ────────────────────────── */}
            {hasEvents && (
              <>
                <Separator />
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Event Options
                  </p>
                  <div className={fieldClass}>
                    <div className={labelClass}>
                      <Calendar className="h-4 w-4" />
                      <span>Event Type</span>
                    </div>
                    <Select
                      value={task.commsEventType || "none"}
                      onValueChange={(val) => updateTask(task.id, { commsEventType: val === "none" ? undefined : val as EventType })}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select event type</SelectItem>
                        {EVENT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Done button */}
            <div className="flex justify-end pt-2">
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
