"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CalendarPlus,
  Plus,
  Search,
  Video,
  MapPin,
  Globe,
  Clock,
  Mic2,
  ChevronRight,
  X,
  Users,
  Mail,
  FileText,
  ClipboardList,
  Check,
  BarChart3,
  TrendingUp,
  Tag,
  Calendar,
  Send,
  ArrowUpRight,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useStore,
  addEvent,
  setActiveTask,
  EVENT_AUDIENCES,
  EVENT_TOPIC_BANK,
  EVENT_FORMAT_META,
  getSpeakerDirectory,
  getTopicCounts,
  getEventAnalytics,
  type EventItem,
  type EventFormat,
  type EventSpeaker,
} from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// ─── Helpers ──────────────────────────────────────────────────────────────

const FORMAT_ICON: Record<EventFormat, typeof Video> = {
  virtual: Video,
  "in-person": MapPin,
  hybrid: Globe,
}

function fmtDate(d: string) {
  return new Date(d + "T00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getInitials(name: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function tint(color: string, pct = 14) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

// ─── Main view ──────────────────────────────────────────────────────────────

export function EventsView() {
  const store = useStore()
  const [tab, setTab] = useState("events")
  const [query, setQuery] = useState("")
  const [composerOpen, setComposerOpen] = useState(false)
  const [detail, setDetail] = useState<EventItem | null>(null)

  const filtered = useMemo(
    () => store.events.filter((e) => e.title.toLowerCase().includes(query.trim().toLowerCase())),
    [store.events, query]
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Events
            </h1>
            <p className="text-xs text-muted-foreground">
              Create, target, and track events. Every event is linked to a task and synced to the comms calendar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events"
                className="h-9 w-48 pl-8 text-sm"
              />
            </div>
            <Button size="sm" className="h-9" onClick={() => setComposerOpen(true)}>
              <Plus className="h-4 w-4" />
              New event
            </Button>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col overflow-hidden gap-0">
        <div className="border-b border-border bg-card px-6">
          <TabsList className="my-2">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="forms">Forms &amp; Surveys</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="events" className="mt-0">
              {filtered.length === 0 ? (
                <EmptyState onCreate={() => setComposerOpen(true)} hasEvents={store.events.length > 0} />
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                  {filtered.map((e) => (
                    <EventCard key={e.id} event={e} onOpen={() => setDetail(e)} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <AnalyticsTab />
            </TabsContent>

            <TabsContent value="speakers" className="mt-0">
              <SpeakersTab />
            </TabsContent>

            <TabsContent value="topics" className="mt-0">
              <TopicsTab />
            </TabsContent>

            <TabsContent value="forms" className="mt-0">
              <FormsTab />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <Composer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        projects={store.projects}
      />
      <DetailDialog event={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  )
}

// ─── Registration meter (signature element) ──────────────────────────────────

function RegistrationMeter({ event }: { event: EventItem }) {
  const accent = EVENT_FORMAT_META[event.format].chart
  const regPct = event.invited ? Math.min(100, (event.registered / event.invited) * 100) : 0
  const attPct = event.invited ? Math.min(100, (event.attended / event.invited) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Registered</span>
        <span className="font-mono tabular-nums">
          {event.registered}/{event.invited}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${regPct}%`, backgroundColor: accent }}
        />
        {event.attended > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-foreground/70"
            style={{ width: `${attPct}%` }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Event card ──────────────────────────────────────────────────────────────

function EventCard({ event, onOpen }: { event: EventItem; onOpen: () => void }) {
  const meta = EVENT_FORMAT_META[event.format]
  const Icon = FORMAT_ICON[event.format]
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: tint(meta.chart), color: meta.chart }}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] capitalize",
            event.status === "completed" && "bg-success/15 text-success"
          )}
        >
          {event.status}
        </Badge>
      </div>

      <h3 className="text-base font-semibold leading-snug tracking-tight">{event.title}</h3>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono tabular-nums">
            {fmtDate(event.date)} · {event.time}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{event.location}</span>
        </span>
      </div>

      {event.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.topics.map((t) => (
            <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}

      <RegistrationMeter event={event} />

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Mic2 className="h-3.5 w-3.5" />
          {event.speakers.length} {event.speakers.length === 1 ? "speaker" : "speakers"}
        </span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </div>
    </button>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onCreate, hasEvents }: { onCreate: () => void; hasEvents: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <CalendarPlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{hasEvents ? "No events match your search" : "No events yet"}</p>
        <p className="text-xs text-muted-foreground">
          {hasEvents
            ? "Try a different title."
            : "Create one to start inviting people and tracking attendance."}
        </p>
      </div>
      {!hasEvents && (
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New event
        </Button>
      )}
    </div>
  )
}

// ─── Composer ────────────────────────────────────────────────────────────────

type SpeakerDraft = EventSpeaker

interface ComposerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: { id: string; name: string }[]
}

const EMPTY_SPEAKER: SpeakerDraft = { name: "", org: "", role: "", type: "internal" }

function Composer({ open, onOpenChange, projects }: ComposerProps) {
  const [title, setTitle] = useState("")
  const [format, setFormat] = useState<EventFormat>("hybrid")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("10:00")
  const [duration, setDuration] = useState(60)
  const [location, setLocation] = useState("")
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [audiences, setAudiences] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [speakers, setSpeakers] = useState<SpeakerDraft[]>([])
  const [speakerDraft, setSpeakerDraft] = useState<SpeakerDraft>(EMPTY_SPEAKER)
  const [hasForm, setHasForm] = useState(false)
  const [hasSurvey, setHasSurvey] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle("")
      setFormat("hybrid")
      setDate("")
      setTime("10:00")
      setDuration(60)
      setLocation("")
      setProjectId(projects[0]?.id ?? "")
      setAudiences([])
      setTopics([])
      setSpeakers([])
      setSpeakerDraft(EMPTY_SPEAKER)
      setHasForm(false)
      setHasSurvey(false)
    }
  }, [open, projects])

  const invited = audiences.reduce(
    (n, id) => n + (EVENT_AUDIENCES.find((a) => a.id === id)?.count ?? 0),
    0
  )

  const valid = title.trim() && date && projectId && audiences.length > 0

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  function addSpeaker() {
    if (!speakerDraft.name.trim()) return
    setSpeakers((p) => [...p, speakerDraft])
    setSpeakerDraft(EMPTY_SPEAKER)
  }

  function submit() {
    if (!valid) return
    addEvent({
      title: title.trim(),
      format,
      date,
      time,
      duration,
      location: location.trim(),
      teamsLink: format !== "in-person",
      projectId,
      audiences,
      topics,
      speakers,
      invited,
      registered: 0,
      attended: 0,
      status: "scheduled",
      hasForm,
      hasSurvey,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            Targeted invites and a linked comms-calendar task are created on save.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Title</Label>
              <Input
                id="ev-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Engineering Town Hall"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(EVENT_FORMAT_META) as EventFormat[]).map((k) => {
                const meta = EVENT_FORMAT_META[k]
                const Icon = FORMAT_ICON[k]
                const active = format === k
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFormat(k)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border bg-card py-3 text-xs font-semibold transition-colors",
                      active ? "border-transparent" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                    style={
                      active
                        ? { borderColor: meta.chart, color: meta.chart, backgroundColor: tint(meta.chart, 10) }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {meta.label}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ev-date">Date</Label>
                <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-time">Time</Label>
                <Input id="ev-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-duration">Minutes</Label>
                <Input
                  id="ev-duration"
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ev-location">{format === "virtual" ? "Teams meeting" : "Location"}</Label>
              <Input
                id="ev-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={format === "virtual" ? "Auto-created in Teams" : "Room / address"}
              />
              {format !== "in-person" && (
                <p className="flex items-center gap-1.5 text-xs text-primary">
                  <Video className="h-3.5 w-3.5" />A Teams link is generated automatically.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The linked task lives in this project and appears on its calendars.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Audience</Label>
              <div className="flex flex-wrap gap-2">
                {EVENT_AUDIENCES.map((a) => {
                  const active = audiences.includes(a.id)
                  const AIcon = a.type === "external" ? Globe : Users
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(audiences, setAudiences, a.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <AIcon className="h-3 w-3" />
                      {a.name}
                      <span className="font-mono text-[10px] opacity-70">{a.count}</span>
                    </button>
                  )
                })}
              </div>
              {invited > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-primary">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="font-mono tabular-nums">{invited.toLocaleString()}</span> invites will be sent.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Topics</Label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TOPIC_BANK.map((t) => {
                  const active = topics.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggle(topics, setTopics, t)}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Speakers</Label>
              {speakers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {speakers.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] uppercase",
                          s.type === "external" ? "bg-warning/15 text-warning" : "bg-chart-2/15 text-chart-2"
                        )}
                      >
                        {s.type}
                      </Badge>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {[s.role, s.org].filter(Boolean).join(" · ")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSpeakers((p) => p.filter((_, idx) => idx !== i))}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${s.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-[1.3fr_1fr_1fr_auto_auto] gap-2">
                <Input
                  placeholder="Name"
                  value={speakerDraft.name}
                  onChange={(e) => setSpeakerDraft({ ...speakerDraft, name: e.target.value })}
                />
                <Input
                  placeholder="Org"
                  value={speakerDraft.org}
                  onChange={(e) => setSpeakerDraft({ ...speakerDraft, org: e.target.value })}
                />
                <Input
                  placeholder="Role"
                  value={speakerDraft.role}
                  onChange={(e) => setSpeakerDraft({ ...speakerDraft, role: e.target.value })}
                />
                <Select
                  value={speakerDraft.type}
                  onValueChange={(v) => setSpeakerDraft({ ...speakerDraft, type: v as EventSpeaker["type"] })}
                >
                  <SelectTrigger className="w-[112px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={addSpeaker} aria-label="Add speaker">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 text-sm">
                <Switch checked={hasForm} onCheckedChange={setHasForm} />
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Registration form
                </span>
              </label>
              <label className="flex items-center gap-2.5 text-sm">
                <Switch checked={hasSurvey} onCheckedChange={setHasSurvey} />
                <span className="flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4" />
                  Post-event survey
                </span>
              </label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={submit}>
            <Send className="h-4 w-4" />
            Create event &amp; sync to calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail dialog ───────────────────────────────────────────────────────────

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="font-mono text-2xl font-bold tabular-nums tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function DetailDialog({
  event,
  onOpenChange,
}: {
  event: EventItem | null
  onOpenChange: (open: boolean) => void
}) {
  if (!event) return null
  const meta = EVENT_FORMAT_META[event.format]
  const Icon = FORMAT_ICON[event.format]
  const regRate = event.invited ? Math.round((event.registered / event.invited) * 100) : 0
  const audienceNames = event.audiences
    .map((id) => EVENT_AUDIENCES.find((a) => a.id === id)?.name)
    .filter(Boolean)

  function openTask() {
    if (event!.linkedTaskId) setActiveTask(event!.linkedTaskId)
    onOpenChange(false)
  }

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: tint(meta.chart), color: meta.chart }}
            >
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono tabular-nums">
                {fmtDate(event.date)} · {event.time} ({event.duration}m)
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 px-6 py-5">
            <div className="grid grid-cols-4 gap-2">
              <Stat value={event.invited.toLocaleString()} label="Invited" />
              <Stat value={event.registered.toLocaleString()} label="Registered" />
              <Stat value={event.attended ? event.attended.toLocaleString() : "—"} label="Attended" />
              <Stat value={event.invited ? `${regRate}%` : "—"} label="Reg. rate" />
            </div>

            <RegistrationMeter event={event} />

            {audienceNames.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Audience</h4>
                <div className="flex flex-wrap gap-1.5">
                  {audienceNames.map((n) => (
                    <span key={n} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.speakers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Speakers</h4>
                <div className="flex flex-col gap-2">
                  {event.speakers.map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                          {getInitials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {[s.role, s.org].filter(Boolean).join(" · ")}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-auto text-[10px] uppercase",
                          s.type === "external" ? "bg-warning/15 text-warning" : "bg-chart-2/15 text-chart-2"
                        )}
                      >
                        {s.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.topics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Topics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.topics.map((t) => (
                    <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Attachments</h4>
              <div className="flex flex-wrap gap-1.5">
                {event.hasForm && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    <FileText className="h-3 w-3" /> Registration form
                  </span>
                )}
                {event.hasSurvey && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    <ClipboardList className="h-3 w-3" /> Survey
                  </span>
                )}
                {!event.hasForm && !event.hasSurvey && (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={openTask} disabled={!event.linkedTaskId}>
            <ArrowUpRight className="h-4 w-4" />
            Open linked task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Analytics tab ───────────────────────────────────────────────────────────

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function AnalyticsTab() {
  const a = getEventAnalytics()
  const maxFormat = Math.max(1, ...a.byFormat.map((b) => b.count))
  const funnel = [
    { label: "Invited", value: a.totalInvited, color: "var(--chart-2)" },
    { label: "Registered", value: a.totalRegistered, color: "var(--primary)" },
    { label: "Attended", value: a.totalAttended, color: "var(--chart-3)" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={a.totalEvents} label="Total events" />
        <Stat value={a.totalInvited.toLocaleString()} label="People invited" />
        <Stat value={a.totalRegistered.toLocaleString()} label="Registrations" />
        <Stat value={`${a.showRate}%`} label="Avg show rate" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              Events by format
            </h4>
            {a.byFormat.map((b) => (
              <HBar key={b.format} label={b.label} value={b.count} max={maxFormat} color={b.chart} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Funnel
            </h4>
            {funnel.map((f) => (
              <HBar key={f.label} label={f.label} value={f.value} max={a.totalInvited} color={f.color} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Speakers tab ────────────────────────────────────────────────────────────

function SpeakersTab() {
  const speakers = getSpeakerDirectory()
  if (speakers.length === 0) {
    return <p className="text-sm text-muted-foreground">No speakers yet.</p>
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {speakers.map((s) => (
        <Card key={s.name}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-xs font-semibold text-primary">
                  {getInitials(s.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {[s.role, s.org].filter(Boolean).join(" · ")}
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] uppercase",
                  s.type === "external" ? "bg-warning/15 text-warning" : "bg-chart-2/15 text-chart-2"
                )}
              >
                {s.type}
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{s.events}</span>{" "}
                {s.events === 1 ? "event" : "events"}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{s.topics.length}</span> topics
              </span>
            </div>
            {s.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {s.topics.map((t) => (
                  <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Topics tab ──────────────────────────────────────────────────────────────

function TopicsTab() {
  const topics = getTopicCounts()
  if (topics.length === 0) {
    return <p className="text-sm text-muted-foreground">No topics yet.</p>
  }
  const max = Math.max(1, ...topics.map((t) => t.count))
  return (
    <Card className="max-w-2xl">
      <CardContent className="space-y-3 p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4 text-primary" />
          What the company is talking about
        </h4>
        {topics.map((t) => (
          <HBar key={t.topic} label={t.topic} value={t.count} max={max} color="var(--primary)" />
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Forms & Surveys tab ─────────────────────────────────────────────────────

function FormsTab() {
  const store = useStore()
  const withForm = store.events.filter((e) => e.hasForm)
  const withSurvey = store.events.filter((e) => e.hasSurvey)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 p-5">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Registration forms
          </h4>
          {withForm.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No forms yet. Turn one on when creating an event.
            </p>
          ) : (
            withForm.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums">{e.registered}</span> responses
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {e.invited ? Math.round((e.registered / e.invited) * 100) : 0}% of invites
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <ClipboardList className="h-4 w-4 text-primary" />
            Surveys
          </h4>
          {withSurvey.length === 0 ? (
            <p className="text-sm text-muted-foreground">No surveys yet.</p>
          ) : (
            withSurvey.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.status === "completed"
                      ? `Sent · ${e.attended} recipients`
                      : "Scheduled after event"}
                  </div>
                </div>
                {e.status === "completed" ? (
                  <Badge variant="secondary" className="bg-success/15 text-[10px] text-success">
                    <Check className="h-3 w-3" /> sent
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    <Clock className="h-3 w-3" /> pending
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
