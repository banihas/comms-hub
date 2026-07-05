"use client"

import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Mail,
  BarChart,
  Activity,
  Timer,
  ListFilter,
  X,
  ArrowLeft,
} from "lucide-react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import {
  useStore,
  setActiveTask,
  setReportingTab,
  type Task,
  type CommsChannel,
  COMMS_CHANNEL_OPTIONS,
  TEAM_MEMBERS,
} from "@/lib/store"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// ─── Helpers ─────────────────────────────────────────────────

function formatDateShort(d: string | null) {
  if (!d) return "—"
  const date = new Date(d + "T00:00:00")
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  none: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
}

// ─── Mock Channel Performance Data ──────────────────────────

interface ChannelMetric {
  channel: CommsChannel
  items: number
  impressions: number
  openRate: number
  clickRate: number
  engagementRate: number
}

const CHANNEL_METRICS: ChannelMetric[] = [
  { channel: "Email", items: 42, impressions: 28500, openRate: 62.3, clickRate: 18.7, engagementRate: 24.1 },
  { channel: "CIBC Today", items: 38, impressions: 45200, openRate: 78.5, clickRate: 32.4, engagementRate: 41.2 },
  { channel: "Viva Engage", items: 31, impressions: 18700, openRate: 54.1, clickRate: 22.8, engagementRate: 35.6 },
  { channel: "Social Media", items: 25, impressions: 67300, openRate: 0, clickRate: 4.2, engagementRate: 6.8 },
  { channel: "Events", items: 12, impressions: 3200, openRate: 0, clickRate: 0, engagementRate: 72.5 },
  { channel: "News Release", items: 8, impressions: 125000, openRate: 0, clickRate: 2.1, engagementRate: 1.4 },
  { channel: "Media Advisory", items: 6, impressions: 52800, openRate: 0, clickRate: 1.8, engagementRate: 0.9 },
  { channel: "Viva Card", items: 19, impressions: 22100, openRate: 0, clickRate: 15.6, engagementRate: 19.3 },
]

const MONTHLY_TREND = [
  { month: "Oct", emailOpen: 58.2, emailClick: 15.1, cibcTodayOpen: 72.3 },
  { month: "Nov", emailOpen: 59.8, emailClick: 16.4, cibcTodayOpen: 74.1 },
  { month: "Dec", emailOpen: 55.4, emailClick: 14.2, cibcTodayOpen: 71.8 },
  { month: "Jan", emailOpen: 60.1, emailClick: 17.3, cibcTodayOpen: 75.6 },
  { month: "Feb", emailOpen: 61.5, emailClick: 18.0, cibcTodayOpen: 77.2 },
  { month: "Mar", emailOpen: 62.3, emailClick: 18.7, cibcTodayOpen: 78.5 },
]

// ─── Chart Config ───────────────────────────────────────────

const channelBarConfig: ChartConfig = {
  openRate: { label: "Open Rate %", color: "hsl(221, 83%, 53%)" },
  clickRate: { label: "Click Rate %", color: "hsl(142, 71%, 45%)" },
  engagementRate: { label: "Engagement %", color: "hsl(262, 83%, 58%)" },
}

const trendConfig: ChartConfig = {
  emailOpen: { label: "Email Open Rate", color: "hsl(221, 83%, 53%)" },
  emailClick: { label: "Email Click Rate", color: "hsl(142, 71%, 45%)" },
  cibcTodayOpen: { label: "CIBC Today Open Rate", color: "hsl(32, 95%, 44%)" },
}

const statusConfig: ChartConfig = {
  todo: { label: "To Do", color: "hsl(215, 14%, 60%)" },
  "in-progress": { label: "In Progress", color: "hsl(217, 91%, 60%)" },
  done: { label: "Done", color: "hsl(142, 71%, 45%)" },
  blocked: { label: "Blocked", color: "hsl(0, 84%, 60%)" },
}

const priorityConfig: ChartConfig = {
  high: { label: "High", color: "hsl(0, 84%, 60%)" },
  medium: { label: "Medium", color: "hsl(38, 92%, 50%)" },
  low: { label: "Low", color: "hsl(142, 71%, 45%)" },
  none: { label: "None", color: "hsl(215, 14%, 60%)" },
}

const STATUS_PIE_COLORS = ["hsl(215, 14%, 60%)", "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)"]

// ═════════════════════════════════════════════════════════════
// ReportingView
// ═════════════════════════════════════════════════════════════

export function ReportingView() {
  const store = useStore()
  return (
    <div className="flex h-full flex-col overflow-hidden pl-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Reporting</h1>
          <p className="text-sm text-muted-foreground">
            Insights across all projects, channels, and team performance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={store.reportingTab} onValueChange={setReportingTab} className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-6 pt-2">
          <TabsList>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="channel-performance">Channel Performance</TabsTrigger>
            <TabsTrigger value="kpis">KPIs Dashboard</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all-tasks" className="flex-1 overflow-hidden m-0">
          <AllTasksTab />
        </TabsContent>

        <TabsContent value="channel-performance" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <ChannelPerformanceTab />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="kpis" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <KPIsDashboardTab />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// Tab 1: All Tasks DataTable
// ═════════════════════════════════════════════════════════════

type SortableCol = {
  getIsSorted: () => false | "asc" | "desc"
  toggleSorting: (desc?: boolean) => void
}
type FilterableCol = SortableCol & {
  getFilterValue: () => unknown
  setFilterValue: (val: unknown) => void
}

function SortableHeader({ column, label }: { column: SortableCol; label: string }) {
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-3 w-3" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
      )}
    </button>
  )
}

function TextFilterHeader({ column, label }: { column: FilterableCol; label: string }) {
  const [open, setOpen] = useState(false)
  const activeFilter = column.getFilterValue() as string | undefined
  return (
    <div className="flex items-center gap-0.5">
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
        )}
      </button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "ml-0.5 rounded p-0.5 hover:bg-accent transition-colors",
              activeFilter && "text-primary",
            )}
            title={`Filter by ${label}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Search className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-52 p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              placeholder={`Filter ${label}…`}
              value={activeFilter ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value || undefined)}
              className="h-7 text-xs"
            />
            {activeFilter && (
              <button
                onClick={() => { column.setFilterValue(undefined); setOpen(false) }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

type DueDateFilterValue =
  | string
  | { type: "custom"; from: string; to: string }

function DueDateFilterHeader({ column, label }: { column: FilterableCol; label: string }) {
  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")

  const activeFilter = column.getFilterValue() as DueDateFilterValue | undefined
  const isFiltered = !!activeFilter
  const isCustomActive = typeof activeFilter === "object"

  const presets = [
    { value: "overdue", label: "Overdue" },
    { value: "today", label: "Due today" },
    { value: "this-week", label: "This week" },
    { value: "next-week", label: "Next week" },
    { value: "no-date", label: "No date set" },
  ]

  function applyCustom() {
    if (customFrom || customTo) {
      column.setFilterValue({ type: "custom", from: customFrom, to: customTo })
    }
    setOpen(false)
    setShowCustom(false)
  }

  function itemClass(active: boolean) {
    return cn(
      "flex w-full items-center rounded px-2 py-1.5 text-sm hover:bg-accent cursor-pointer transition-colors",
      active && "font-semibold text-primary",
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
        )}
      </button>
      <Popover
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setShowCustom(false) }}
      >
        <PopoverTrigger asChild>
          <button
            className={cn(
              "ml-0.5 rounded p-0.5 hover:bg-accent transition-colors",
              isFiltered && "text-primary",
            )}
            title="Filter by Due Date"
            onClick={(e) => e.stopPropagation()}
          >
            <ListFilter className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-52 p-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!showCustom ? (
            <div className="flex flex-col">
              <button
                className={itemClass(!activeFilter)}
                onClick={() => { column.setFilterValue(undefined); setOpen(false) }}
              >
                All dates
              </button>
              <Separator className="my-1" />
              {presets.map((p) => (
                <button
                  key={p.value}
                  className={itemClass(activeFilter === p.value)}
                  onClick={() => { column.setFilterValue(p.value); setOpen(false) }}
                >
                  {p.label}
                </button>
              ))}
              <Separator className="my-1" />
              <button
                className={itemClass(isCustomActive)}
                onClick={() => {
                  if (isCustomActive) {
                    setCustomFrom((activeFilter as { from: string; to: string }).from)
                    setCustomTo((activeFilter as { from: string; to: string }).to)
                  }
                  setShowCustom(true)
                }}
              >
                Custom range…
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-3">
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowCustom(false)}
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <Button size="sm" className="w-full h-7 text-xs" onClick={applyCustom}>
                Apply
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FilterableHeader({
  column,
  label,
  options,
  allLabel = "All",
}: {
  column: FilterableCol
  label: string
  options: { value: string; label: string }[]
  allLabel?: string
}) {
  const activeFilter = column.getFilterValue() as string | undefined
  return (
    <div className="flex items-center gap-0.5">
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "ml-0.5 rounded p-0.5 hover:bg-accent transition-colors",
              activeFilter && "text-primary",
            )}
            title={`Filter by ${label}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ListFilter className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => column.setFilterValue(undefined)}
            className={cn(!activeFilter && "font-semibold")}
          >
            {allLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => column.setFilterValue(opt.value)}
              className={cn(activeFilter === opt.value && "font-semibold")}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function AllTasksTab() {
  const store = useStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of store.projects) map[p.id] = p.name
    return map
  }, [store.projects])

  const projectNames = useMemo(
    () => [...new Set(store.projects.map((p) => p.name))].sort(),
    [store.projects],
  )

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <TextFilterHeader column={column} label="Title" />,
        cell: ({ row }) => (
          <span className="font-medium max-w-[300px] truncate block">
            {row.original.title}
          </span>
        ),
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.title.toLowerCase().includes(filterValue.toLowerCase())
        },
        size: 300,
      },
      {
        id: "project",
        accessorFn: (row) => projectMap[row.projectId] ?? row.projectId,
        header: ({ column }) => (
          <FilterableHeader
            column={column}
            label="Project"
            allLabel="All projects"
            options={projectNames.map((n) => ({ value: n, label: n }))}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm max-w-[180px] truncate block">
            {getValue() as string}
          </span>
        ),
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return (projectMap[row.original.projectId] ?? row.original.projectId) === filterValue
        },
        size: 180,
      },
      {
        accessorKey: "assignee",
        header: ({ column }) => (
          <FilterableHeader
            column={column}
            label="Assignee"
            allLabel="All assignees"
            options={TEAM_MEMBERS.map((m) => ({ value: m, label: m }))}
          />
        ),
        cell: ({ row }) => <span className="text-sm">{row.original.assignee || "—"}</span>,
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.assignee === filterValue
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <FilterableHeader
            column={column}
            label="Status"
            allLabel="All statuses"
            options={[
              { value: "todo", label: "To Do" },
              { value: "in-progress", label: "In Progress" },
              { value: "done", label: "Done" },
              { value: "blocked", label: "Blocked" },
            ]}
          />
        ),
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={`text-xs capitalize ${STATUS_COLORS[row.original.status] ?? ""}`}
          >
            {row.original.status.replace("-", " ")}
          </Badge>
        ),
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.status === filterValue
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <FilterableHeader
            column={column}
            label="Priority"
            allLabel="All priorities"
            options={[
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
              { value: "none", label: "None" },
            ]}
          />
        ),
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={`text-xs capitalize ${PRIORITY_COLORS[row.original.priority] ?? ""}`}
          >
            {row.original.priority}
          </Badge>
        ),
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.priority === filterValue
        },
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => <DueDateFilterHeader column={column} label="Due Date" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateShort(row.original.dueDate)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.dueDate ?? ""
          const b = rowB.original.dueDate ?? ""
          return a.localeCompare(b)
        },
        filterFn: (row, _colId, filterValue: DueDateFilterValue) => {
          if (!filterValue) return true
          const dueDate = row.original.dueDate
          if (typeof filterValue === "object") {
            if (!dueDate) return false
            const { from, to } = filterValue
            if (from && dueDate < from) return false
            if (to && dueDate > to) return false
            return true
          }
          if (filterValue === "no-date") return !dueDate
          if (!dueDate) return false
          const today = new Date()
          const pad = (n: number) => String(n).padStart(2, "0")
          const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
          const weekBound = (offsetWeeks: number, boundary: "start" | "end") => {
            const d = new Date(today)
            const day = today.getDay()
            const offset =
              boundary === "start"
                ? (day === 0 ? -6 : 1 - day) + offsetWeeks * 7
                : (day === 0 ? 0 : 7 - day) + offsetWeeks * 7
            d.setDate(today.getDate() + offset)
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
          }
          if (filterValue === "overdue") return dueDate < todayStr
          if (filterValue === "today") return dueDate === todayStr
          if (filterValue === "this-week")
            return dueDate >= weekBound(0, "start") && dueDate <= weekBound(0, "end")
          if (filterValue === "next-week")
            return dueDate >= weekBound(1, "start") && dueDate <= weekBound(1, "end")
          return true
        },
      },
      {
        accessorKey: "contentLabel",
        header: ({ column }) => <TextFilterHeader column={column} label="Content Label" />,
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return (row.original.contentLabel ?? "").toLowerCase().includes(filterValue.toLowerCase())
        },
        cell: ({ row }) =>
          row.original.contentLabel ? (
            <Badge variant="outline" className="text-xs">
              {row.original.contentLabel}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        id: "channels",
        accessorFn: (row) => row.commsChannels?.join(", ") ?? "",
        header: ({ column }) => (
          <FilterableHeader
            column={column}
            label="Channels"
            allLabel="All channels"
            options={COMMS_CHANNEL_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
        ),
        cell: ({ row }) => {
          const ch = row.original.commsChannels
          if (!ch?.length) return <span className="text-muted-foreground text-xs">—</span>
          return (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {ch.map((c) => (
                <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">
                  {c}
                </Badge>
              ))}
            </div>
          )
        },
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.commsChannels?.includes(filterValue as CommsChannel) ?? false
        },
      },
      {
        accessorKey: "completed",
        header: ({ column }) => (
          <FilterableHeader
            column={column}
            label="Completed"
            allLabel="All"
            options={[
              { value: "yes", label: "Completed" },
              { value: "no", label: "Incomplete" },
            ]}
          />
        ),
        cell: ({ row }) =>
          row.original.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
        filterFn: (row, _colId, filterValue: string) => {
          if (!filterValue) return true
          if (filterValue === "yes") return row.original.completed
          if (filterValue === "no") return !row.original.completed
          return true
        },
      },
    ],
    [projectMap, projectNames],
  )

  const table = useReactTable({
    data: store.tasks,
    columns,
    state: { sorting, globalFilter, columnVisibility, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const activeFilterCount = columnFilters.length

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all tasks…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setColumnFilters([])}
          >
            Clear filters ({activeFilterCount})
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-sm text-muted-foreground ml-auto">
          {table.getFilteredRowModel().rows.length} task
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="select-none">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setActiveTask(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-6 py-3">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// Tab 2: Channel Performance
// ═════════════════════════════════════════════════════════════

function ChannelPerformanceTab() {
  const store = useStore()

  const commsTaskCount = useMemo(
    () => store.tasks.filter((t) => t.contentLabel === "For Comms Calendar").length,
    [store.tasks],
  )

  const avgOpenRate = useMemo(() => {
    const withOpen = CHANNEL_METRICS.filter((c) => c.openRate > 0)
    if (!withOpen.length) return 0
    return withOpen.reduce((s, c) => s + c.openRate, 0) / withOpen.length
  }, [])

  const avgClickRate = useMemo(() => {
    const withClick = CHANNEL_METRICS.filter((c) => c.clickRate > 0)
    if (!withClick.length) return 0
    return withClick.reduce((s, c) => s + c.clickRate, 0) / withClick.length
  }, [])

  const topChannel = useMemo(
    () =>
      CHANNEL_METRICS.reduce((best, c) =>
        c.engagementRate > best.engagementRate ? c : best,
      ),
    [],
  )

  const barData = useMemo(
    () =>
      CHANNEL_METRICS.map((c) => ({
        channel: c.channel,
        openRate: c.openRate,
        clickRate: c.clickRate,
        engagementRate: c.engagementRate,
      })),
    [],
  )

  return (
    <div className="space-y-6 p-6" data-tour="reporting-channel-performance">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Mail className="h-4 w-4" />} label="Comms Items" value={commsTaskCount} subtitle="Labelled 'For Comms Calendar'" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg Open Rate" value={`${avgOpenRate.toFixed(1)}%`} subtitle="Across email & intranet channels" />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Avg Click Rate" value={`${avgClickRate.toFixed(1)}%`} subtitle="Across all channels with clicks" />
        <StatCard icon={<BarChart className="h-4 w-4" />} label="Top Channel" value={topChannel.channel} subtitle={`${topChannel.engagementRate}% engagement`} />
      </div>

      {/* Bar Chart: Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Channel</CardTitle>
          <CardDescription>Open rate, click rate, and engagement across all communication channels</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={channelBarConfig} className="h-[350px] w-full">
            <RechartsBarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="openRate" name="Open Rate %" fill="var(--color-openRate)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clickRate" name="Click Rate %" fill="var(--color-clickRate)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="engagementRate" name="Engagement %" fill="var(--color-engagementRate)" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Line Chart: Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Six-month trend for email and CIBC Today open &amp; click rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendConfig} className="h-[300px] w-full">
            <LineChart data={MONTHLY_TREND} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="emailOpen" name="Email Open %" stroke="var(--color-emailOpen)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="emailClick" name="Email Click %" stroke="var(--color-emailClick)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cibcTodayOpen" name="CIBC Today Open %" stroke="var(--color-cibcTodayOpen)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Breakdown</CardTitle>
          <CardDescription>Detailed metrics per communication channel</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Open Rate</TableHead>
                <TableHead className="text-right">Click Rate</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CHANNEL_METRICS.map((c) => (
                <TableRow key={c.channel}>
                  <TableCell className="font-medium">{c.channel}</TableCell>
                  <TableCell className="text-right">{c.items}</TableCell>
                  <TableCell className="text-right">{c.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{c.openRate > 0 ? `${c.openRate}%` : "N/A"}</TableCell>
                  <TableCell className="text-right">{c.clickRate > 0 ? `${c.clickRate}%` : "N/A"}</TableCell>
                  <TableCell className="text-right">{c.engagementRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// Tab 3: KPIs Dashboard
// ═════════════════════════════════════════════════════════════

function KPIsDashboardTab() {
  const store = useStore()

  // ── Completion Rate ──
  const completionStats = useMemo(() => {
    const total = store.tasks.length
    const completed = store.tasks.filter((t) => t.completed).length
    return { total, completed, rate: total > 0 ? (completed / total) * 100 : 0 }
  }, [store.tasks])

  // ── Status Breakdown ──
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, "in-progress": 0, done: 0, blocked: 0 }
    for (const t of store.tasks) counts[t.status] = (counts[t.status] ?? 0) + 1
    return [
      { name: "To Do", value: counts.todo, fill: STATUS_PIE_COLORS[0] },
      { name: "In Progress", value: counts["in-progress"], fill: STATUS_PIE_COLORS[1] },
      { name: "Done", value: counts.done, fill: STATUS_PIE_COLORS[2] },
      { name: "Blocked", value: counts.blocked, fill: STATUS_PIE_COLORS[3] },
    ]
  }, [store.tasks])

  // ── Priority Breakdown ──
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0, none: 0 }
    for (const t of store.tasks) counts[t.priority] = (counts[t.priority] ?? 0) + 1
    return [
      { priority: "High", count: counts.high },
      { priority: "Medium", count: counts.medium },
      { priority: "Low", count: counts.low },
      { priority: "None", count: counts.none },
    ]
  }, [store.tasks])

  const priorityBarColors = ["hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(215, 14%, 60%)"]

  // ── Overdue Tasks ──
  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return store.tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < today,
    )
  }, [store.tasks])

  // ── Workload by Assignee ──
  const workloadData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of store.tasks) {
      if (t.assignee) counts[t.assignee] = (counts[t.assignee] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [store.tasks])

  // ── Approval Turnaround ──
  const approvalTurnaround = useMemo(() => {
    const responded: number[] = []
    for (const t of store.tasks) {
      if (t.approvalRequests) {
        for (const ar of t.approvalRequests) {
          if (ar.respondedAt) {
            const diff = new Date(ar.respondedAt).getTime() - new Date(ar.requestedAt).getTime()
            responded.push(diff)
          }
        }
      }
    }
    if (!responded.length) return null
    const avgMs = responded.reduce((s, d) => s + d, 0) / responded.length
    const avgHrs = avgMs / (1000 * 60 * 60)
    return { avgHrs: Math.round(avgHrs * 10) / 10, count: responded.length }
  }, [store.tasks])

  // ── Velocity (tasks completed per week) ──
  const velocityData = useMemo(() => {
    // Group completed tasks by the week of their due date (proxy for completion)
    const completedTasks = store.tasks.filter((t) => t.completed && t.dueDate)
    if (!completedTasks.length) return []

    const sorted = [...completedTasks].sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))

    // Build weekly buckets for the last 8 weeks
    const now = new Date()
    const weeks: { label: string; start: Date; count: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`

      const count = sorted.filter((t) => {
        const d = t.dueDate!
        const startStr = weekStart.toISOString().split("T")[0]
        const endStr = weekEnd.toISOString().split("T")[0]
        return d >= startStr && d <= endStr
      }).length

      weeks.push({ label, start: weekStart, count })
    }

    return weeks
  }, [store.tasks])

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of store.projects) map[p.id] = p.name
    return map
  }, [store.projects])

  return (
    <div className="space-y-6 p-6">
      {/* Row 1: Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completion Rate"
          value={`${completionStats.rate.toFixed(1)}%`}
          subtitle={`${completionStats.completed} of ${completionStats.total} tasks`}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Overdue Tasks"
          value={overdueTasks.length}
          subtitle={overdueTasks.length === 0 ? "All on track" : "Require attention"}
        />
        <StatCard
          icon={<Timer className="h-4 w-4" />}
          label="Approval Turnaround"
          value={approvalTurnaround ? `${approvalTurnaround.avgHrs}h` : "—"}
          subtitle={approvalTurnaround ? `Based on ${approvalTurnaround.count} response(s)` : "No completed approvals yet"}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Team Members"
          value={workloadData.length}
          subtitle="Active assignees"
        />
      </div>

      {/* Row 2: Status Pie + Priority Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Distribution of task statuses across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="mx-auto h-[280px] w-full">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Breakdown by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priorityConfig} className="h-[280px] w-full">
              <RechartsBarChart data={priorityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={entry.priority} fill={priorityBarColors[i]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Workload + Velocity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workload by Assignee */}
        <Card>
          <CardHeader>
            <CardTitle>Workload by Assignee</CardTitle>
            <CardDescription>Number of tasks assigned to each team member</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Tasks", color: "hsl(217, 91%, 60%)" } }} className="h-[280px] w-full">
              <RechartsBarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Tasks" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Velocity */}
        <Card>
          <CardHeader>
            <CardTitle>Velocity / Throughput</CardTitle>
            <CardDescription>Tasks completed per week</CardDescription>
          </CardHeader>
          <CardContent>
            {velocityData.length > 0 ? (
              <ChartContainer config={{ count: { label: "Completed", color: "hsl(142, 71%, 45%)" } }} className="h-[280px] w-full">
                <LineChart data={velocityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" name="Completed" stroke="var(--color-count)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                No completed tasks to show velocity data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Overdue Tasks List */}
      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue Tasks
            </CardTitle>
            <CardDescription>{overdueTasks.length} task{overdueTasks.length !== 1 ? "s" : ""} past due date</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueTasks.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => setActiveTask(t.id)}
                  >
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {projectMap[t.projectId] ?? t.projectId}
                    </TableCell>
                    <TableCell>{t.assignee}</TableCell>
                    <TableCell className="text-destructive font-medium">
                      {formatDateShort(t.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs capitalize ${PRIORITY_COLORS[t.priority] ?? ""}`}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs capitalize ${STATUS_COLORS[t.status] ?? ""}`}>
                        {t.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// Shared Components
// ═════════════════════════════════════════════════════════════

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  subtitle: string
}) {
  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex items-start gap-3 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}
