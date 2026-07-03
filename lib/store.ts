import { useSyncExternalStore } from "react"

export type Priority = "high" | "medium" | "low" | "none"
export type TaskStatus = "todo" | "in-progress" | "done" | "blocked"
export type ActiveView = "home" | "my-tasks" | "inbox" | "approvals" | "calendar" | "content-calendar" | "events" | "project" | "goals" | "reporting" | "search-results"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type ContentStatus = "Pending" | "Confirmed"
export type BannerSize = "large" | "small"

export const AUDIENCE_OPTIONS = [
  "Enterprise",
  "SBU/FG",
] as const
export type Audience = (typeof AUDIENCE_OPTIONS)[number]

export const ENTERPRISE_CATEGORY_OPTIONS = [
  "Corporate Communications",
  "Marketing",
  "Investor Relations",
  "Internal Communications",
  "Public Relations",
  "Regulatory Affairs",
] as const
export type EnterpriseCategory = (typeof ENTERPRISE_CATEGORY_OPTIONS)[number]
export const COMMS_CHANNEL_OPTIONS = [
  "CIBC Today",
  "Viva Engage",
  "Email",
  "Media Advisory",
  "News Release",
  "Social Media",
  "Viva Card",
  "Events",
] as const
export type CommsChannel = (typeof COMMS_CHANNEL_OPTIONS)[number]

export const CIBC_TODAY_BANNER_OPTIONS = [
  "Large Banner",
  "Small Banner",
  "SBU Banner",
  "Headline Only",
] as const
export type CibcTodayBannerType = (typeof CIBC_TODAY_BANNER_OPTIONS)[number]

export const EMAIL_TARGET_AUDIENCE_OPTIONS = [
  "GLT",
  "GTA",
  "HRBP",
  "All Managers",
] as const
export type EmailTargetAudience = (typeof EMAIL_TARGET_AUDIENCE_OPTIONS)[number]

export const EMAIL_MAILBOX_OPTIONS = [
  "Communications",
  "CIBC President and CEO",
  "Events",
  "HR Updates",
  "PCT Updates",
] as const
export type EmailMailbox = (typeof EMAIL_MAILBOX_OPTIONS)[number]

export const EVENT_TYPE_OPTIONS = [
  "Internal - Onsite",
  "Internal - Virtual",
  "Internal - Hybrid",
  "External - Onsite",
  "External - Virtual",
] as const
export type EventType = (typeof EVENT_TYPE_OPTIONS)[number]

// ── EventHub ──────────────────────────────────────────────────────────────────
export type EventFormat = "virtual" | "in-person" | "hybrid"
export type EventStatus = "scheduled" | "completed"
export type EventSpeakerType = "internal" | "external"

export interface EventSpeaker {
  name: string
  org: string
  role: string
  type: EventSpeakerType
}

export interface EventAudience {
  id: string
  name: string
  count: number
  type: "group" | "external"
}

export const EVENT_AUDIENCES: EventAudience[] = [
  { id: "all", name: "All staff", count: 1240, type: "group" },
  { id: "eng", name: "Engineering", count: 310, type: "group" },
  { id: "sales", name: "Sales & Marketing", count: 180, type: "group" },
  { id: "leaders", name: "People Leaders", count: 95, type: "group" },
  { id: "csuite", name: "Executive Team", count: 12, type: "group" },
  { id: "ext-partners", name: "External Partners", count: 64, type: "external" },
]

export const EVENT_TOPIC_BANK = [
  "AI & Automation",
  "Product Strategy",
  "Leadership",
  "Engineering Culture",
  "Security & Compliance",
  "Customer Success",
  "DEI",
  "Wellbeing",
  "Go-to-Market",
  "Data & Analytics",
] as const

export const EVENT_FORMAT_META: Record<
  EventFormat,
  { label: string; eventType: EventType; chart: string }
> = {
  virtual: { label: "Virtual", eventType: "Internal - Virtual", chart: "var(--chart-2)" },
  "in-person": { label: "In-person", eventType: "Internal - Onsite", chart: "var(--chart-3)" },
  hybrid: { label: "Hybrid", eventType: "Internal - Hybrid", chart: "var(--primary)" },
}

export type SortField = "title" | "dueDate" | "priority" | "assignee" | "createdAt"
export type SortDirection = "asc" | "desc"

export const CURRENT_USER = "Sarah Chen"

export const TEAM_MEMBERS = [
  "Sarah Chen",
  "Alex Morgan",
  "Jordan Lee",
  "Taylor Kim",
  "Riley Patel",
]

export const EDITORIAL_PUBLISHING_TEAM = ["Sarah Chen", "Taylor Kim"]

export const PROJECT_SEARCH_ACRONYMS: Record<string, string> = {
  "US Region": "US",
  "People, Culture and Talent": "PC&T",
  "Capital Markets": "CM",
  "Personal and Business Banking": "PBB",
  "Commercial Banking and Wealth Management": "CBWM",
  "Risk Management": "RM",
  "Global Data, Technology and AI": "GDTAI",
  "Chief Administrative Office": "CAO",
}

export interface Comment {
  id: string
  taskId: string
  author: string
  text: string
  createdAt: string
}

export interface ApprovalRequest {
  id: string
  taskId: string
  requestedBy: string
  requestedFrom: string
  status: ApprovalStatus
  requestedAt: string
  respondedAt?: string
  comment?: string
}

export interface Notification {
  id: string
  type: "assignment" | "comment" | "due-soon" | "completed" | "mention" | "approval-requested" | "approval-approved" | "approval-rejected"
  title: string
  description: string
  taskId?: string
  projectId?: string
  read: boolean
  createdAt: string
}

export interface FilterState {
  priority: Priority | "all"
  assignee: string
  completed: "all" | "completed" | "incomplete"
  dueDateRange: "all" | "overdue" | "today" | "this-week" | "next-week"
}

export type DependencyType = "blocked-by" | "blocking"
export type LinkType = "related"

export interface TaskLink {
  taskId: string
  type: LinkType
}

export interface TaskDependency {
  taskId: string
  type: DependencyType
}

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  dueDate: string | null
  priority: Priority
  status: TaskStatus
  sectionId: string
  projectId: string
  tags: string[]
  completed: boolean
  createdAt: string
  contentLabel?: string
  contentStatus?: ContentStatus
  commsTitle?: string
  commsLead?: string
  commsAuthor?: string
  commsAudience?: Audience
  commsPublishDate?: string | null
  commsEnterpriseCategory?: EnterpriseCategory
  commsUrl?: string
  commsChannels?: CommsChannel[]
  commsCibcTodayBanner?: CibcTodayBannerType
  commsVivaEngageSelfPublish?: boolean
  commsVivaEngageAnnouncement?: boolean
  commsVivaEngageFeaturedConversation?: boolean
  commsVivaEngageVideo?: boolean
  commsEmailTime?: string
  commsEmailTargetAudience?: EmailTargetAudience[]
  commsEmailMailbox?: EmailMailbox
  commsEventType?: EventType
  linkedTasks: TaskLink[]
  dependencies: TaskDependency[]
  approvalRequired?: boolean
  approvalRequests?: ApprovalRequest[]
}

export interface BannerAssignment {
  id: string
  taskId: string
  date: string
  bannerSize: BannerSize
}

export interface EventItem {
  id: string
  title: string
  format: EventFormat
  date: string
  time: string
  duration: number
  location: string
  teamsLink: boolean
  projectId: string
  audiences: string[]
  topics: string[]
  speakers: EventSpeaker[]
  invited: number
  registered: number
  attended: number
  status: EventStatus
  hasForm: boolean
  hasSurvey: boolean
  linkedTaskId: string | null
}

export interface Section {
  id: string
  name: string
  projectId: string
  order: number
}

export interface Project {
  id: string
  name: string
  color: string
  icon: string
}

export interface AppState {
  projects: Project[]
  sections: Section[]
  tasks: Task[]
  comments: Comment[]
  notifications: Notification[]
  bannerAssignments: BannerAssignment[]
  events: EventItem[]
  activeProjectId: string
  activeTaskId: string | null
  activeView: ActiveView
  viewMode: "list" | "board" | "calendar" | "gantt"
  searchQuery: string
  filterState: FilterState
  sortField: SortField
  sortDirection: SortDirection
}

const defaultProjects: Project[] = [
  { id: "p1", name: "US Region", color: "#B33B2E", icon: "globe" },
  { id: "p2", name: "People, Culture and Talent", color: "#0F8B8D", icon: "users" },
  { id: "p3", name: "Capital Markets", color: "#2F5597", icon: "line-chart" },
  { id: "p4", name: "Personal and Business Banking", color: "#7A4EAB", icon: "building" },
  { id: "p5", name: "Commercial Banking and Wealth Management", color: "#D97706", icon: "briefcase" },
  { id: "p6", name: "Finance", color: "#2B6CB0", icon: "calculator" },
  { id: "p7", name: "Legal", color: "#6B7280", icon: "scale" },
  { id: "p8", name: "Risk Management", color: "#B45309", icon: "shield-alert" },
  { id: "p9", name: "Global Data, Technology and AI", color: "#0E7490", icon: "cpu" },
  { id: "p10", name: "Chief Administrative Office", color: "#9A3412", icon: "landmark" },
]

const defaultSections: Section[] = [
  { id: "s1", name: "Backlog", projectId: "p1", order: 0 },
  { id: "s2", name: "In Progress", projectId: "p1", order: 1 },
  { id: "s3", name: "Done", projectId: "p1", order: 2 },
  { id: "s4", name: "Backlog", projectId: "p2", order: 0 },
  { id: "s5", name: "In Progress", projectId: "p2", order: 1 },
  { id: "s6", name: "Done", projectId: "p2", order: 2 },
  { id: "s7", name: "Backlog", projectId: "p3", order: 0 },
  { id: "s8", name: "In Progress", projectId: "p3", order: 1 },
  { id: "s9", name: "Done", projectId: "p3", order: 2 },
  { id: "s10", name: "Backlog", projectId: "p4", order: 0 },
  { id: "s11", name: "In Progress", projectId: "p4", order: 1 },
  { id: "s12", name: "Done", projectId: "p4", order: 2 },
  { id: "s13", name: "Backlog", projectId: "p5", order: 0 },
  { id: "s14", name: "In Progress", projectId: "p5", order: 1 },
  { id: "s15", name: "Done", projectId: "p5", order: 2 },
  { id: "s16", name: "Backlog", projectId: "p6", order: 0 },
  { id: "s17", name: "In Progress", projectId: "p6", order: 1 },
  { id: "s18", name: "Done", projectId: "p6", order: 2 },
  { id: "s19", name: "Backlog", projectId: "p7", order: 0 },
  { id: "s20", name: "In Progress", projectId: "p7", order: 1 },
  { id: "s21", name: "Done", projectId: "p7", order: 2 },
  { id: "s22", name: "Backlog", projectId: "p8", order: 0 },
  { id: "s23", name: "In Progress", projectId: "p8", order: 1 },
  { id: "s24", name: "Done", projectId: "p8", order: 2 },
  { id: "s25", name: "Backlog", projectId: "p9", order: 0 },
  { id: "s26", name: "In Progress", projectId: "p9", order: 1 },
  { id: "s27", name: "Done", projectId: "p9", order: 2 },
  { id: "s28", name: "Backlog", projectId: "p10", order: 0 },
  { id: "s29", name: "In Progress", projectId: "p10", order: 1 },
  { id: "s30", name: "Done", projectId: "p10", order: 2 },
]

const defaultTasks: Task[] = [
  {
    id: "t1", title: "US Region market update memo", description: "Draft weekly market narrative for US Region leadership distribution",
    assignee: "Sarah Chen", dueDate: "2026-03-11", priority: "high", status: "in-progress", sectionId: "s2", projectId: "p1", tags: ["us-region", "leadership"], completed: false, createdAt: "2026-03-01",
    contentLabel: "For Comms Calendar", contentStatus: "Confirmed",
    commsTitle: "US Region Weekly Market Update", commsLead: "Sarah Chen", commsAuthor: "Alex Morgan", commsAudience: "Enterprise", commsPublishDate: "2026-03-11", commsEnterpriseCategory: "Corporate Communications",
    commsChannels: ["CIBC Today", "Email"], commsCibcTodayBanner: "Large Banner",
    linkedTasks: [{ taskId: "t2", type: "related" }, { taskId: "t5", type: "related" }, { taskId: "t11", type: "related" }], dependencies: [{ taskId: "t2", type: "blocking" }, { taskId: "t6", type: "blocking" }],
  },
  {
    id: "t2", title: "US Region spokesperson Q&A pack", description: "Prepare approved responses for common media questions in the US market",
    assignee: "Alex Morgan", dueDate: "2026-03-14", priority: "medium", status: "todo", sectionId: "s1", projectId: "p1", tags: ["media", "q-and-a"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t1", type: "related" }], dependencies: [{ taskId: "t1", type: "blocked-by" }],
  },
  {
    id: "t3", title: "People strategy town hall script", description: "Build internal script and key messages for People, Culture and Talent town hall",
    assignee: "Jordan Lee", dueDate: "2026-03-15", priority: "medium", status: "in-progress", sectionId: "s5", projectId: "p2", tags: ["internal", "culture"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t4", type: "related" }], dependencies: [{ taskId: "t4", type: "blocking" }],
  },
  {
    id: "t4", title: "Talent campaign onboarding copy", description: "Finalize onboarding campaign copy for enterprise-wide rollout",
    assignee: "Riley Patel", dueDate: "2026-03-18", priority: "medium", status: "todo", sectionId: "s4", projectId: "p2", tags: ["talent", "campaign"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [{ taskId: "t3", type: "related" }], dependencies: [{ taskId: "t3", type: "blocked-by" }],
  },
  {
    id: "t5", title: "Capital Markets analyst day brief", description: "Prepare speaking points and supporting narrative for analyst day",
    assignee: "Taylor Kim", dueDate: "2026-03-13", priority: "high", status: "in-progress", sectionId: "s8", projectId: "p3", tags: ["analyst-day", "capital-markets"], completed: false, createdAt: "2026-03-01",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "Capital Markets Analyst Day Brief", commsLead: "Taylor Kim", commsAuthor: "Taylor Kim", commsAudience: "SBU/FG", commsPublishDate: "2026-03-13", commsEnterpriseCategory: "Investor Relations",
    linkedTasks: [{ taskId: "t6", type: "related" }, { taskId: "t1", type: "related" }], dependencies: [{ taskId: "t6", type: "blocking" }],
  },
  {
    id: "t6", title: "Capital Markets newsroom statement", description: "Draft same-day statement template for significant market activity",
    assignee: "Alex Morgan", dueDate: "2026-03-19", priority: "high", status: "todo", sectionId: "s7", projectId: "p3", tags: ["newsroom", "statement"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t5", type: "related" }], dependencies: [{ taskId: "t5", type: "blocked-by" }, { taskId: "t1", type: "blocked-by" }],
  },
  {
    id: "t7", title: "PBB mortgage campaign plan", description: "Create multi-channel campaign plan for Personal and Business Banking mortgage push",
    assignee: "Jordan Lee", dueDate: "2026-03-16", priority: "high", status: "in-progress", sectionId: "s11", projectId: "p4", tags: ["pbb", "mortgage"], completed: false, createdAt: "2026-03-02",
    contentLabel: "For Comms Calendar", contentStatus: "Confirmed",
    commsTitle: "PBB Mortgage Campaign Launch", commsLead: "Jordan Lee", commsAuthor: "Riley Patel", commsAudience: "SBU/FG", commsPublishDate: "2026-03-16", commsEnterpriseCategory: "Marketing",
    commsChannels: ["CIBC Today", "Social Media", "Email"], commsCibcTodayBanner: "Large Banner",
    linkedTasks: [], dependencies: [{ taskId: "t8", type: "blocking" }],
  },
  {
    id: "t8", title: "PBB branch signage refresh", description: "Update branch signage and in-app messaging for current retail offers",
    assignee: "Riley Patel", dueDate: "2026-03-21", priority: "medium", status: "todo", sectionId: "s10", projectId: "p4", tags: ["branch", "retail"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [], dependencies: [{ taskId: "t7", type: "blocked-by" }],
  },
  {
    id: "t9", title: "CBWM client event recap", description: "Draft recap story and social snippets from Commercial Banking and Wealth event",
    assignee: "Alex Morgan", dueDate: "2026-03-12", priority: "medium", status: "in-progress", sectionId: "s14", projectId: "p5", tags: ["cbwm", "events"], completed: false, createdAt: "2026-03-01",
    contentLabel: "For Comms Calendar", contentStatus: "Confirmed",
    commsTitle: "CBWM Client Event Recap", commsLead: "Alex Morgan", commsAuthor: "Alex Morgan", commsAudience: "SBU/FG", commsPublishDate: "2026-03-12", commsEnterpriseCategory: "Corporate Communications",
    commsChannels: ["CIBC Today", "Viva Engage"], commsCibcTodayBanner: "Large Banner",
    linkedTasks: [{ taskId: "t10", type: "related" }], dependencies: [{ taskId: "t10", type: "blocking" }],
  },
  {
    id: "t10", title: "Wealth advisor toolkit launch", description: "Publish communications toolkit for wealth advisors across channels",
    assignee: "Sarah Chen", dueDate: "2026-04-01", priority: "high", status: "todo", sectionId: "s13", projectId: "p5", tags: ["wealth", "toolkit"], completed: false, createdAt: "2026-03-04",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "Wealth Advisor Toolkit Launch", commsLead: "Sarah Chen", commsAuthor: "Sarah Chen", commsAudience: "SBU/FG", commsPublishDate: "2026-04-01", commsEnterpriseCategory: "Marketing",
    linkedTasks: [{ taskId: "t9", type: "related" }], dependencies: [{ taskId: "t9", type: "blocked-by" }],
  },
  {
    id: "t11", title: "Finance quarterly narrative", description: "Compile Finance narrative for quarterly performance communications",
    assignee: "Sarah Chen", dueDate: "2026-03-17", priority: "high", status: "in-progress", sectionId: "s17", projectId: "p6", tags: ["finance", "quarterly"], completed: false, createdAt: "2026-03-05",
    contentLabel: "For Comms Calendar", contentStatus: "Confirmed",
    commsTitle: "Q1 Finance Performance Summary", commsLead: "Sarah Chen", commsAuthor: "Jordan Lee", commsAudience: "SBU/FG", commsPublishDate: "2026-03-17", commsEnterpriseCategory: "Investor Relations",
    commsChannels: ["CIBC Today", "Email"], commsCibcTodayBanner: "Large Banner",
    linkedTasks: [{ taskId: "t12", type: "related" }, { taskId: "t1", type: "related" }], dependencies: [{ taskId: "t12", type: "blocking" }],
  },
  {
    id: "t12", title: "Finance investor FAQ refresh", description: "Update investor FAQ language for consistency with latest disclosures",
    assignee: "Jordan Lee", dueDate: "2026-03-22", priority: "medium", status: "todo", sectionId: "s16", projectId: "p6", tags: ["investor", "faq"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t11", type: "related" }], dependencies: [{ taskId: "t11", type: "blocked-by" }],
  },
  {
    id: "t13", title: "Legal approval matrix update", description: "Refresh communications approval matrix for legal and regulatory sign-off",
    assignee: "Taylor Kim", dueDate: "2026-03-15", priority: "high", status: "in-progress", sectionId: "s20", projectId: "p7", tags: ["legal", "governance"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t14", type: "related" }], dependencies: [{ taskId: "t14", type: "blocking" }],
  },
  {
    id: "t14", title: "Regulatory filing language check", description: "Review external language tied to upcoming filings",
    assignee: "Jordan Lee", dueDate: "2026-03-18", priority: "medium", status: "todo", sectionId: "s19", projectId: "p7", tags: ["regulatory", "filings"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [{ taskId: "t13", type: "related" }], dependencies: [{ taskId: "t13", type: "blocked-by" }],
  },
  {
    id: "t15", title: "Risk incident response templates", description: "Build templated responses for top operational and credit risk scenarios",
    assignee: "Taylor Kim", dueDate: "2026-03-13", priority: "high", status: "in-progress", sectionId: "s23", projectId: "p8", tags: ["risk", "incident"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t16", type: "related" }], dependencies: [{ taskId: "t16", type: "blocking" }],
  },
  {
    id: "t16", title: "Risk committee brief", description: "Draft communications summary for monthly risk committee meeting",
    assignee: "Riley Patel", dueDate: "2026-03-24", priority: "medium", status: "todo", sectionId: "s22", projectId: "p8", tags: ["committee", "brief"], completed: false, createdAt: "2026-03-05",
    linkedTasks: [{ taskId: "t15", type: "related" }], dependencies: [{ taskId: "t15", type: "blocked-by" }],
  },
  {
    id: "t17", title: "AI release announcement", description: "Prepare launch communications for new AI-enabled client service capability",
    assignee: "Sarah Chen", dueDate: "2026-03-19", priority: "high", status: "in-progress", sectionId: "s26", projectId: "p9", tags: ["ai", "technology"], completed: false, createdAt: "2026-03-04",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "AI Client Service Capability Launch", commsLead: "Sarah Chen", commsAuthor: "Alex Morgan", commsAudience: "Enterprise", commsPublishDate: "2026-03-19", commsEnterpriseCategory: "Internal Communications",
    linkedTasks: [{ taskId: "t18", type: "related" }], dependencies: [],
  },
  {
    id: "t18", title: "Data governance explainer", description: "Create internal explainer for data governance updates and responsibilities",
    assignee: "Alex Morgan", dueDate: "2026-03-25", priority: "medium", status: "todo", sectionId: "s25", projectId: "p9", tags: ["data", "governance"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t17", type: "related" }], dependencies: [],
  },
  {
    id: "t19", title: "CAO transformation update", description: "Draft monthly update note for Chief Administrative Office transformation stream",
    assignee: "Jordan Lee", dueDate: "2026-03-21", priority: "medium", status: "in-progress", sectionId: "s29", projectId: "p10", tags: ["cao", "transformation"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [{ taskId: "t20", type: "related" }], dependencies: [{ taskId: "t20", type: "blocking" }],
  },
  {
    id: "t20", title: "Enterprise policy bulletin", description: "Publish policy bulletin with highlights for all employee channels",
    assignee: "Taylor Kim", dueDate: "2026-03-26", priority: "low", status: "todo", sectionId: "s28", projectId: "p10", tags: ["policy", "enterprise"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t19", type: "related" }], dependencies: [{ taskId: "t19", type: "blocked-by" }],
  },

  // ── US Region (p1) additional tasks ──
  {
    id: "t21", title: "US Region social media rollout", description: "Coordinate social media posts across LinkedIn, X, and internal channels for US Region updates",
    assignee: "Riley Patel", dueDate: "2026-03-17", priority: "medium", status: "in-progress", sectionId: "s2", projectId: "p1", tags: ["social", "us-region"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [{ taskId: "t1", type: "related" }, { taskId: "t22", type: "related" }], dependencies: [{ taskId: "t1", type: "blocked-by" }],
  },
  {
    id: "t22", title: "US Region leadership video script", description: "Script a 2-minute video message from the US Region head summarizing key wins",
    assignee: "Taylor Kim", dueDate: "2026-03-20", priority: "high", status: "todo", sectionId: "s1", projectId: "p1", tags: ["video", "leadership"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t21", type: "related" }, { taskId: "t23", type: "related" }], dependencies: [{ taskId: "t21", type: "blocked-by" }],
  },
  {
    id: "t23", title: "US Region intranet feature article", description: "Publish a feature article on the intranet highlighting cross-functional US Region achievements",
    assignee: "Sarah Chen", dueDate: "2026-04-03", priority: "low", status: "todo", sectionId: "s1", projectId: "p1", tags: ["intranet", "feature"], completed: false, createdAt: "2026-03-05",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "US Region Achievements Feature", commsLead: "Sarah Chen", commsAuthor: "Sarah Chen", commsAudience: "Enterprise", commsPublishDate: "2026-04-03", commsEnterpriseCategory: "Internal Communications",
    linkedTasks: [{ taskId: "t22", type: "related" }], dependencies: [{ taskId: "t22", type: "blocked-by" }, { taskId: "t2", type: "blocked-by" }],
  },
  {
    id: "t24", title: "US Region press release draft", description: "Prepare external press release for upcoming US Region regulatory milestone",
    assignee: "Alex Morgan", dueDate: "2026-03-27", priority: "high", status: "todo", sectionId: "s1", projectId: "p1", tags: ["press", "external"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t2", type: "related" }], dependencies: [{ taskId: "t23", type: "blocked-by" }],
  },

  // ── People, Culture and Talent (p2) additional tasks ──
  {
    id: "t25", title: "Employee engagement survey comms", description: "Draft communications around the annual employee engagement survey launch",
    assignee: "Sarah Chen", dueDate: "2026-03-12", priority: "high", status: "in-progress", sectionId: "s5", projectId: "p2", tags: ["engagement", "survey"], completed: false, createdAt: "2026-03-01",
    linkedTasks: [{ taskId: "t3", type: "related" }, { taskId: "t26", type: "related" }], dependencies: [],
  },
  {
    id: "t26", title: "Diversity & inclusion newsletter", description: "Compile monthly D&I newsletter featuring ERG highlights and upcoming events",
    assignee: "Riley Patel", dueDate: "2026-03-19", priority: "medium", status: "todo", sectionId: "s4", projectId: "p2", tags: ["diversity", "newsletter"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t25", type: "related" }], dependencies: [{ taskId: "t25", type: "blocked-by" }],
  },
  {
    id: "t27", title: "New hire welcome video coordination", description: "Coordinate filming schedule and talking points for quarterly new hire welcome video",
    assignee: "Jordan Lee", dueDate: "2026-03-22", priority: "low", status: "todo", sectionId: "s4", projectId: "p2", tags: ["onboarding", "video"], completed: false, createdAt: "2026-03-05",
    linkedTasks: [{ taskId: "t4", type: "related" }], dependencies: [{ taskId: "t26", type: "blocked-by" }, { taskId: "t4", type: "blocked-by" }],
  },

  // ── Capital Markets (p3) additional tasks ──
  {
    id: "t28", title: "Fixed income market commentary", description: "Weekly fixed income market commentary for institutional client distribution",
    assignee: "Sarah Chen", dueDate: "2026-03-11", priority: "high", status: "done", sectionId: "s9", projectId: "p3", tags: ["fixed-income", "commentary"], completed: true, createdAt: "2026-03-01",
    linkedTasks: [{ taskId: "t5", type: "related" }], dependencies: [],
  },
  {
    id: "t29", title: "Equity research visibility campaign", description: "Promote top equity research picks through client-facing channels",
    assignee: "Taylor Kim", dueDate: "2026-03-16", priority: "medium", status: "in-progress", sectionId: "s8", projectId: "p3", tags: ["equity", "campaign"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [{ taskId: "t28", type: "related" }, { taskId: "t30", type: "related" }], dependencies: [{ taskId: "t28", type: "blocked-by" }],
  },
  {
    id: "t30", title: "Capital Markets Q1 results teaser", description: "Create pre-earnings social and email teaser content for Q1 results",
    assignee: "Alex Morgan", dueDate: "2026-04-07", priority: "high", status: "todo", sectionId: "s7", projectId: "p3", tags: ["earnings", "teaser"], completed: false, createdAt: "2026-03-05",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "Capital Markets Q1 Earnings Teaser", commsLead: "Alex Morgan", commsAuthor: "Taylor Kim", commsAudience: "SBU/FG", commsPublishDate: "2026-04-07", commsEnterpriseCategory: "Investor Relations",
    linkedTasks: [{ taskId: "t29", type: "related" }, { taskId: "t6", type: "related" }], dependencies: [{ taskId: "t29", type: "blocked-by" }, { taskId: "t6", type: "blocked-by" }],
  },

  // ── Personal and Business Banking (p4) additional tasks ──
  {
    id: "t31", title: "PBB digital banking launch email", description: "Design and write launch email for new digital banking features",
    assignee: "Sarah Chen", dueDate: "2026-03-13", priority: "high", status: "in-progress", sectionId: "s11", projectId: "p4", tags: ["digital", "email"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t7", type: "related" }, { taskId: "t32", type: "related" }], dependencies: [],
  },
  {
    id: "t32", title: "PBB customer FAQ update", description: "Refresh customer-facing FAQ for new product features and pricing changes",
    assignee: "Alex Morgan", dueDate: "2026-03-18", priority: "medium", status: "todo", sectionId: "s10", projectId: "p4", tags: ["faq", "customer"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t31", type: "related" }], dependencies: [{ taskId: "t31", type: "blocked-by" }, { taskId: "t7", type: "blocked-by" }],
  },
  {
    id: "t33", title: "PBB credit card promo video", description: "Produce short promotional video for new credit card rewards program",
    assignee: "Jordan Lee", dueDate: "2026-03-25", priority: "medium", status: "todo", sectionId: "s10", projectId: "p4", tags: ["credit-card", "video"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t8", type: "related" }], dependencies: [{ taskId: "t32", type: "blocked-by" }, { taskId: "t8", type: "blocked-by" }],
  },

  // ── CBWM (p5) additional tasks ──
  {
    id: "t34", title: "CBWM quarterly client letter", description: "Draft the Q1 client letter summarizing wealth management performance",
    assignee: "Taylor Kim", dueDate: "2026-03-15", priority: "high", status: "in-progress", sectionId: "s14", projectId: "p5", tags: ["quarterly", "client-letter"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t9", type: "related" }, { taskId: "t35", type: "related" }], dependencies: [{ taskId: "t9", type: "blocked-by" }],
  },
  {
    id: "t35", title: "CBWM market outlook infographic", description: "Design infographic summarizing H1 market outlook for wealth clients",
    assignee: "Riley Patel", dueDate: "2026-03-22", priority: "medium", status: "todo", sectionId: "s13", projectId: "p5", tags: ["infographic", "outlook"], completed: false, createdAt: "2026-03-05",
    linkedTasks: [{ taskId: "t34", type: "related" }, { taskId: "t10", type: "related" }], dependencies: [{ taskId: "t34", type: "blocked-by" }],
  },
  {
    id: "t36", title: "CBWM advisor webinar promotion", description: "Create email and social campaign to promote upcoming advisor webinar",
    assignee: "Sarah Chen", dueDate: "2026-03-27", priority: "low", status: "todo", sectionId: "s13", projectId: "p5", tags: ["webinar", "promotion"], completed: false, createdAt: "2026-03-07",
    linkedTasks: [{ taskId: "t35", type: "related" }], dependencies: [{ taskId: "t35", type: "blocked-by" }, { taskId: "t10", type: "blocked-by" }],
  },

  // ── Finance (p6) additional tasks ──
  {
    id: "t37", title: "Finance cost reduction comms plan", description: "Develop comms plan for enterprise cost reduction initiative from Finance",
    assignee: "Taylor Kim", dueDate: "2026-03-14", priority: "high", status: "in-progress", sectionId: "s17", projectId: "p6", tags: ["cost-reduction", "planning"], completed: false, createdAt: "2026-03-03",
    linkedTasks: [{ taskId: "t11", type: "related" }, { taskId: "t38", type: "related" }], dependencies: [],
  },
  {
    id: "t38", title: "Finance townhall deck and script", description: "Prepare presentation deck and speaking notes for Finance all-hands",
    assignee: "Jordan Lee", dueDate: "2026-03-20", priority: "medium", status: "todo", sectionId: "s16", projectId: "p6", tags: ["townhall", "presentation"], completed: false, createdAt: "2026-03-05",
    linkedTasks: [{ taskId: "t37", type: "related" }, { taskId: "t12", type: "related" }], dependencies: [{ taskId: "t37", type: "blocked-by" }, { taskId: "t11", type: "blocked-by" }],
  },
  {
    id: "t39", title: "Finance year-end report design", description: "Coordinate design and layout for the Finance year-end highlights report",
    assignee: "Riley Patel", dueDate: "2026-03-26", priority: "low", status: "todo", sectionId: "s16", projectId: "p6", tags: ["year-end", "design"], completed: false, createdAt: "2026-03-07",
    linkedTasks: [], dependencies: [{ taskId: "t38", type: "blocked-by" }, { taskId: "t12", type: "blocked-by" }],
  },

  // ── Legal (p7) additional tasks ──
  {
    id: "t40", title: "Legal compliance training comms", description: "Send firm-wide communications about upcoming mandatory compliance training",
    assignee: "Alex Morgan", dueDate: "2026-03-12", priority: "high", status: "done", sectionId: "s21", projectId: "p7", tags: ["compliance", "training"], completed: true, createdAt: "2026-03-01",
    linkedTasks: [{ taskId: "t13", type: "related" }], dependencies: [],
  },
  {
    id: "t41", title: "Legal privacy policy update notice", description: "Draft internal and external notices for updated privacy policy effective April",
    assignee: "Riley Patel", dueDate: "2026-03-21", priority: "high", status: "todo", sectionId: "s19", projectId: "p7", tags: ["privacy", "policy"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t14", type: "related" }, { taskId: "t13", type: "related" }], dependencies: [{ taskId: "t14", type: "blocked-by" }, { taskId: "t13", type: "blocked-by" }],
  },
  {
    id: "t42", title: "Legal quarterly board summary", description: "Compile legal and compliance highlights for the quarterly board report",
    assignee: "Taylor Kim", dueDate: "2026-03-25", priority: "medium", status: "todo", sectionId: "s19", projectId: "p7", tags: ["board", "summary"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t41", type: "related" }], dependencies: [{ taskId: "t41", type: "blocked-by" }],
  },

  // ── Risk Management (p8) additional tasks ──
  {
    id: "t43", title: "Risk dashboard launch comms", description: "Announce the new enterprise risk dashboard to all business line stakeholders",
    assignee: "Sarah Chen", dueDate: "2026-03-17", priority: "high", status: "in-progress", sectionId: "s23", projectId: "p8", tags: ["dashboard", "launch"], completed: false, createdAt: "2026-03-03",
    contentLabel: "For Comms Calendar", contentStatus: "Confirmed",
    commsTitle: "Enterprise Risk Dashboard Launch", commsLead: "Sarah Chen", commsAuthor: "Taylor Kim", commsAudience: "Enterprise", commsPublishDate: "2026-03-17", commsEnterpriseCategory: "Internal Communications",
    commsChannels: ["CIBC Today", "Viva Engage", "Email"], commsCibcTodayBanner: "Small Banner",
    linkedTasks: [{ taskId: "t15", type: "related" }, { taskId: "t44", type: "related" }], dependencies: [{ taskId: "t15", type: "blocked-by" }],
  },
  {
    id: "t44", title: "Risk awareness week campaign", description: "Plan and execute risk awareness week across internal channels",
    assignee: "Alex Morgan", dueDate: "2026-03-21", priority: "medium", status: "todo", sectionId: "s22", projectId: "p8", tags: ["awareness", "campaign"], completed: false, createdAt: "2026-03-05",
    linkedTasks: [{ taskId: "t43", type: "related" }, { taskId: "t16", type: "related" }], dependencies: [{ taskId: "t43", type: "blocked-by" }],
  },
  {
    id: "t45", title: "Risk scenario drill recap report", description: "Write post-drill recap for March operational risk scenario exercise",
    assignee: "Riley Patel", dueDate: "2026-03-28", priority: "low", status: "todo", sectionId: "s22", projectId: "p8", tags: ["drill", "recap"], completed: false, createdAt: "2026-03-07",
    linkedTasks: [], dependencies: [{ taskId: "t44", type: "blocked-by" }, { taskId: "t16", type: "blocked-by" }],
  },

  // ── Global Data, Technology and AI (p9) additional tasks ──
  {
    id: "t46", title: "Cloud migration stakeholder update", description: "Prepare update for stakeholders on the ongoing cloud migration programme",
    assignee: "Jordan Lee", dueDate: "2026-03-14", priority: "high", status: "in-progress", sectionId: "s26", projectId: "p9", tags: ["cloud", "migration"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t17", type: "related" }, { taskId: "t47", type: "related" }], dependencies: [],
  },
  {
    id: "t47", title: "Cybersecurity awareness bulletin", description: "Monthly cybersecurity awareness bulletin with latest threats and best practices",
    assignee: "Taylor Kim", dueDate: "2026-03-18", priority: "medium", status: "todo", sectionId: "s25", projectId: "p9", tags: ["cyber", "awareness"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t46", type: "related" }], dependencies: [{ taskId: "t46", type: "blocked-by" }],
  },
  {
    id: "t48", title: "Tech innovation showcase comms", description: "Coordinate communications for the quarterly tech innovation showcase event",
    assignee: "Sarah Chen", dueDate: "2026-03-22", priority: "medium", status: "todo", sectionId: "s25", projectId: "p9", tags: ["innovation", "showcase"], completed: false, createdAt: "2026-03-06",
    linkedTasks: [{ taskId: "t18", type: "related" }, { taskId: "t47", type: "related" }], dependencies: [{ taskId: "t47", type: "blocked-by" }, { taskId: "t18", type: "blocked-by" }],
  },
  {
    id: "t49", title: "AI ethics policy announcement", description: "Publish announcement of new enterprise AI ethics guidelines and governance framework",
    assignee: "Alex Morgan", dueDate: "2026-04-05", priority: "high", status: "todo", sectionId: "s25", projectId: "p9", tags: ["ai-ethics", "policy"], completed: false, createdAt: "2026-03-08",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "Enterprise AI Ethics Guidelines Launch", commsLead: "Alex Morgan", commsAuthor: "Jordan Lee", commsAudience: "Enterprise", commsPublishDate: "2026-04-05", commsEnterpriseCategory: "Corporate Communications",
    linkedTasks: [{ taskId: "t17", type: "related" }, { taskId: "t48", type: "related" }], dependencies: [{ taskId: "t48", type: "blocked-by" }, { taskId: "t17", type: "blocked-by" }],
  },

  // ── Chief Administrative Office (p10) additional tasks ──
  {
    id: "t50", title: "CAO office relocation guide", description: "Produce employee guide covering logistics for office relocation programme",
    assignee: "Riley Patel", dueDate: "2026-03-14", priority: "medium", status: "in-progress", sectionId: "s29", projectId: "p10", tags: ["relocation", "guide"], completed: false, createdAt: "2026-03-02",
    linkedTasks: [{ taskId: "t19", type: "related" }, { taskId: "t51", type: "related" }], dependencies: [],
  },
  {
    id: "t51", title: "CAO vendor management update", description: "Communicate updated vendor management procedures to procurement teams",
    assignee: "Jordan Lee", dueDate: "2026-03-18", priority: "low", status: "todo", sectionId: "s28", projectId: "p10", tags: ["vendor", "procurement"], completed: false, createdAt: "2026-03-04",
    linkedTasks: [{ taskId: "t50", type: "related" }], dependencies: [{ taskId: "t50", type: "blocked-by" }],
  },
  {
    id: "t52", title: "CAO sustainability report comms", description: "Draft internal and external communications for the annual sustainability report",
    assignee: "Sarah Chen", dueDate: "2026-03-24", priority: "high", status: "todo", sectionId: "s28", projectId: "p10", tags: ["sustainability", "report"], completed: false, createdAt: "2026-03-06",
    contentLabel: "For Comms Calendar", contentStatus: "Confirmed",
    commsTitle: "Annual Sustainability Report", commsLead: "Sarah Chen", commsAuthor: "Riley Patel", commsAudience: "Enterprise", commsPublishDate: "2026-03-24", commsEnterpriseCategory: "Corporate Communications",
    commsChannels: ["CIBC Today", "Viva Engage", "Email", "Social Media"], commsCibcTodayBanner: "Small Banner",
    linkedTasks: [{ taskId: "t19", type: "related" }, { taskId: "t20", type: "related" }], dependencies: [{ taskId: "t51", type: "blocked-by" }, { taskId: "t19", type: "blocked-by" }],
  },
  {
    id: "t53", title: "CAO enterprise townhall recap", description: "Write and distribute recap of the enterprise-wide CAO townhall session",
    assignee: "Taylor Kim", dueDate: "2026-03-28", priority: "medium", status: "todo", sectionId: "s28", projectId: "p10", tags: ["townhall", "recap"], completed: false, createdAt: "2026-03-08",
    linkedTasks: [{ taskId: "t52", type: "related" }, { taskId: "t20", type: "related" }], dependencies: [{ taskId: "t52", type: "blocked-by" }, { taskId: "t20", type: "blocked-by" }],
  },
  {
    id: "t54", title: "PBB spring campaign launch checklist", description: "Finalize launch checklist and channel sequencing for PBB spring campaign",
    assignee: "Sarah Chen", dueDate: "2026-04-02", priority: "high", status: "in-progress", sectionId: "s11", projectId: "p4", tags: ["pbb", "campaign", "launch"], completed: false, createdAt: "2026-03-09",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "PBB Spring Campaign Launch", commsLead: "Sarah Chen", commsAuthor: "Sarah Chen", commsAudience: "SBU/FG", commsPublishDate: "2026-04-02", commsEnterpriseCategory: "Marketing",
    linkedTasks: [{ taskId: "t31", type: "related" }, { taskId: "t7", type: "related" }], dependencies: [{ taskId: "t31", type: "blocked-by" }],
    approvalRequired: true,
    approvalRequests: [
      { id: "ar-t54-1", taskId: "t54", requestedBy: "Sarah Chen", requestedFrom: "Taylor Kim", status: "pending", requestedAt: "2026-03-09T09:10:00Z" },
      { id: "ar-t54-2", taskId: "t54", requestedBy: "Sarah Chen", requestedFrom: "Alex Morgan", status: "pending", requestedAt: "2026-03-09T09:10:00Z" },
    ],
  },
  {
    id: "t55", title: "Enterprise policy bulletin legal sign-off", description: "Collect final legal approval before publishing enterprise policy bulletin",
    assignee: "Alex Morgan", dueDate: "2026-03-30", priority: "medium", status: "todo", sectionId: "s28", projectId: "p10", tags: ["policy", "legal", "approval"], completed: false, createdAt: "2026-03-09",
    linkedTasks: [{ taskId: "t20", type: "related" }, { taskId: "t53", type: "related" }], dependencies: [{ taskId: "t20", type: "blocked-by" }],
    approvalRequired: true,
    approvalRequests: [
      { id: "ar-t55-1", taskId: "t55", requestedBy: "Alex Morgan", requestedFrom: "Sarah Chen", status: "pending", requestedAt: "2026-03-09T11:25:00Z" },
    ],
  },
  {
    id: "t56", title: "Q2 investor webcast invitation copy", description: "Draft and approve invitation messaging for the Q2 investor webcast",
    assignee: "Taylor Kim", dueDate: "2026-03-31", priority: "high", status: "todo", sectionId: "s16", projectId: "p6", tags: ["investor", "webcast", "copy"], completed: false, createdAt: "2026-03-09",
    contentLabel: "For Comms Calendar", contentStatus: "Pending",
    commsTitle: "Q2 Investor Webcast Invitation", commsLead: "Sarah Chen", commsAuthor: "Taylor Kim", commsAudience: "SBU/FG", commsPublishDate: "2026-03-31", commsEnterpriseCategory: "Investor Relations",
    linkedTasks: [{ taskId: "t11", type: "related" }, { taskId: "t12", type: "related" }], dependencies: [{ taskId: "t12", type: "blocked-by" }],
    approvalRequired: true,
    approvalRequests: [
      { id: "ar-t56-1", taskId: "t56", requestedBy: "Sarah Chen", requestedFrom: "Taylor Kim", status: "approved", requestedAt: "2026-03-09T14:00:00Z", respondedAt: "2026-03-09T15:20:00Z" },
      { id: "ar-t56-2", taskId: "t56", requestedBy: "Sarah Chen", requestedFrom: "Riley Patel", status: "pending", requestedAt: "2026-03-09T14:00:00Z" },
    ],
  },
  {
    id: "t57", title: "Risk dashboard FAQ publication approval", description: "Review and approve final FAQ pack for risk dashboard publication",
    assignee: "Jordan Lee", dueDate: "2026-03-30", priority: "medium", status: "in-progress", sectionId: "s23", projectId: "p8", tags: ["risk", "faq", "approval"], completed: false, createdAt: "2026-03-09",
    linkedTasks: [{ taskId: "t43", type: "related" }, { taskId: "t44", type: "related" }], dependencies: [{ taskId: "t43", type: "blocked-by" }],
    approvalRequired: true,
    approvalRequests: [
      { id: "ar-t57-1", taskId: "t57", requestedBy: "Jordan Lee", requestedFrom: "Sarah Chen", status: "pending", requestedAt: "2026-03-09T16:40:00Z" },
    ],
  },
]

const defaultBannerAssignments: BannerAssignment[] = [
  { id: "b1", taskId: "t1", date: "2026-03-11", bannerSize: "large" },
  { id: "b2", taskId: "t9", date: "2026-03-12", bannerSize: "large" },
  { id: "b3", taskId: "t9", date: "2026-03-12", bannerSize: "small" },
  { id: "b4", taskId: "t5", date: "2026-03-13", bannerSize: "small" },
  { id: "b5", taskId: "t7", date: "2026-03-16", bannerSize: "large" },
  { id: "b6", taskId: "t11", date: "2026-03-17", bannerSize: "large" },
  { id: "b7", taskId: "t11", date: "2026-03-17", bannerSize: "small" },
  { id: "b8", taskId: "t17", date: "2026-03-19", bannerSize: "large" },
  { id: "b9", taskId: "t10", date: "2026-03-20", bannerSize: "small" },
]

const defaultComments: Comment[] = [
  { id: "c1", taskId: "t1", author: "Sarah Chen", text: "US Region draft is ready for leadership edits.", createdAt: "2026-03-02T10:30:00" },
  { id: "c2", taskId: "t3", author: "Jordan Lee", text: "Added employee sentiment highlights from last pulse survey.", createdAt: "2026-03-02T11:15:00" },
  { id: "c3", taskId: "t5", author: "Taylor Kim", text: "Need one additional proof point for analyst Q&A.", createdAt: "2026-03-02T14:00:00" },
  { id: "c4", taskId: "t7", author: "Jordan Lee", text: "Campaign plan now reflects updated branch priorities.", createdAt: "2026-03-03T09:45:00" },
  { id: "c5", taskId: "t11", author: "Taylor Kim", text: "Finance confirmed narrative aligns with quarterly deck.", createdAt: "2026-03-02T16:45:00" },
  { id: "c6", taskId: "t13", author: "Jordan Lee", text: "Legal asks to add a final compliance checkpoint.", createdAt: "2026-03-03T08:30:00" },
  { id: "c7", taskId: "t15", author: "Riley Patel", text: "Risk templates cover operational and credit scenarios.", createdAt: "2026-03-03T13:00:00" },
  { id: "c8", taskId: "t17", author: "Sarah Chen", text: "AI announcement waiting for final product screenshots.", createdAt: "2026-03-04T10:10:00" },
  { id: "c9", taskId: "t19", author: "Alex Morgan", text: "CAO update approved by PMO communications lead.", createdAt: "2026-03-04T15:20:00" },
  { id: "c10", taskId: "t21", author: "Riley Patel", text: "Social rollout scheduled for LinkedIn at 9am ET.", createdAt: "2026-03-04T09:00:00" },
  { id: "c11", taskId: "t25", author: "Sarah Chen", text: "Survey comms approved by HR leadership.", createdAt: "2026-03-02T13:30:00" },
  { id: "c12", taskId: "t29", author: "Taylor Kim", text: "Equity picks confirmed with research team.", createdAt: "2026-03-04T11:00:00" },
  { id: "c13", taskId: "t31", author: "Sarah Chen", text: "Launch email draft shared with product team for review.", createdAt: "2026-03-03T14:20:00" },
  { id: "c14", taskId: "t37", author: "Taylor Kim", text: "Cost reduction plan aligned with CFO messaging.", createdAt: "2026-03-04T16:00:00" },
  { id: "c15", taskId: "t43", author: "Sarah Chen", text: "Dashboard screenshots ready for the announcement.", createdAt: "2026-03-05T10:30:00" },
  { id: "c16", taskId: "t46", author: "Jordan Lee", text: "Migration milestones updated with latest sprint data.", createdAt: "2026-03-03T15:45:00" },
  { id: "c17", taskId: "t50", author: "Riley Patel", text: "Office relocation guide circulated to floor wardens.", createdAt: "2026-03-04T08:15:00" },
  { id: "c18", taskId: "t34", author: "Taylor Kim", text: "Client letter draft sent to CBWM leadership for sign-off.", createdAt: "2026-03-04T12:00:00" },
]

const defaultNotifications: Notification[] = [
  { id: "n1", type: "assignment", title: "You were assigned a task", description: "Sarah Chen assigned you to 'People strategy town hall script'", taskId: "t3", projectId: "p2", read: false, createdAt: "2026-03-03T14:30:00" },
  { id: "n2", type: "due-soon", title: "Task due soon", description: "'Risk incident response templates' is due tomorrow", taskId: "t15", projectId: "p8", read: false, createdAt: "2026-03-03T09:00:00" },
  { id: "n3", type: "comment", title: "New comment", description: "Taylor Kim commented on 'Legal approval matrix update'", taskId: "t13", projectId: "p7", read: false, createdAt: "2026-03-02T16:45:00" },
  { id: "n4", type: "completed", title: "Task completed", description: "Riley Patel marked 'Talent campaign onboarding copy' as complete", taskId: "t4", projectId: "p2", read: true, createdAt: "2026-03-02T11:20:00" },
  { id: "n5", type: "mention", title: "You were mentioned", description: "Alex Morgan mentioned you on 'AI release announcement'", taskId: "t17", projectId: "p9", read: true, createdAt: "2026-03-01T15:10:00" },
]

const defaultEvents: EventItem[] = [
  {
    id: "ev1", title: "Q3 Enterprise All-Hands", format: "hybrid",
    date: "2026-07-08", time: "10:00", duration: 60,
    location: "HQ Auditorium + Teams", teamsLink: true, projectId: "p1",
    audiences: ["all"], topics: ["Product Strategy", "Leadership"],
    speakers: [
      { name: "Sarah Chen", org: "Internal", role: "CEO", type: "internal" },
      { name: "Marcus Reed", org: "Gartner", role: "Analyst", type: "external" },
    ],
    invited: 1240, registered: 870, attended: 0, status: "scheduled",
    hasForm: true, hasSurvey: false, linkedTaskId: "tev1",
  },
  {
    id: "ev2", title: "Secure Coding Workshop", format: "virtual",
    date: "2026-06-30", time: "13:00", duration: 90,
    location: "Microsoft Teams", teamsLink: true, projectId: "p9",
    audiences: ["eng"], topics: ["Security & Compliance", "Engineering Culture"],
    speakers: [{ name: "Priya Nair", org: "Internal", role: "Principal Eng", type: "internal" }],
    invited: 310, registered: 142, attended: 0, status: "scheduled",
    hasForm: true, hasSurvey: true, linkedTaskId: "tev2",
  },
  {
    id: "ev3", title: "Partner Innovation Day", format: "in-person",
    date: "2026-05-20", time: "09:00", duration: 240,
    location: "Toronto Office, Floor 12", teamsLink: false, projectId: "p3",
    audiences: ["ext-partners", "leaders"], topics: ["Go-to-Market", "AI & Automation"],
    speakers: [
      { name: "Lena Ortiz", org: "Northwind Co.", role: "VP Product", type: "external" },
      { name: "Sam Cho", org: "Internal", role: "Director", type: "internal" },
    ],
    invited: 159, registered: 159, attended: 138, status: "completed",
    hasForm: true, hasSurvey: true, linkedTaskId: "tev3",
  },
]

function buildLinkedTaskForEvent(event: EventItem, taskId: string, sections: Section[]): Task {
  const meta = EVENT_FORMAT_META[event.format]
  const firstSection = sections.find((s) => s.projectId === event.projectId)
  const isDone = event.status === "completed"
  return {
    id: taskId,
    title: event.title,
    description: `Event \u2022 ${meta.label} \u2022 ${event.location}`,
    assignee: event.speakers.find((s) => s.type === "internal")?.name ?? CURRENT_USER,
    dueDate: event.date,
    priority: "medium",
    status: isDone ? "done" : "todo",
    sectionId: firstSection?.id ?? "",
    projectId: event.projectId,
    tags: ["event"],
    completed: isDone,
    createdAt: getDateStr(new Date()),
    contentLabel: "For Comms Calendar",
    contentStatus: isDone ? "Confirmed" : "Pending",
    commsTitle: event.title,
    commsLead: CURRENT_USER,
    commsAuthor: CURRENT_USER,
    commsPublishDate: event.date,
    commsChannels: ["Events"],
    commsEventType: meta.eventType,
    linkedTasks: [],
    dependencies: [],
  }
}

const defaultEventTasks: Task[] = defaultEvents.map((e) =>
  buildLinkedTaskForEvent(e, e.linkedTaskId as string, defaultSections)
)

let state: AppState = {
  projects: defaultProjects,
  sections: defaultSections,
  tasks: [...defaultTasks, ...defaultEventTasks],
  comments: defaultComments,
  notifications: defaultNotifications,
  bannerAssignments: defaultBannerAssignments,
  events: defaultEvents,
  activeProjectId: "p1",
  activeTaskId: null,
  activeView: "home",
  viewMode: "list",
  searchQuery: "",
  filterState: { priority: "all", assignee: "all", completed: "all", dueDateRange: "all" },
  sortField: "createdAt",
  sortDirection: "asc",
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function setActiveProject(projectId: string) {
  state = { ...state, activeProjectId: projectId, activeTaskId: null }
  emitChange()
}

export function setActiveTask(taskId: string | null) {
  state = { ...state, activeTaskId: taskId }
  emitChange()
}

export function setViewMode(mode: "list" | "board" | "calendar" | "gantt") {
  state = { ...state, viewMode: mode }
  emitChange()
}

export function setSearchQuery(query: string) {
  state = { ...state, searchQuery: query }
  emitChange()
}

export function toggleTaskComplete(taskId: string) {
  state = {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ),
  }
  emitChange()
}

export function updateTask(taskId: string, updates: Partial<Task>) {
  // Enforce: tasks requiring approval cannot be set to "Confirmed" unless fully approved
  if (updates.contentStatus === "Confirmed") {
    const task = state.tasks.find((t) => t.id === taskId)
    if (task) {
      const merged = { ...task, ...updates }
      if (merged.approvalRequired && !isFullyApproved(merged)) {
        const { contentStatus: _, ...safeUpdates } = updates
        if (Object.keys(safeUpdates).length === 0) return
        updates = safeUpdates
      }
    }
  }

  // Enforce: comms audience can only be one of the supported values
  if (updates.commsAudience && !AUDIENCE_OPTIONS.includes(updates.commsAudience as Audience)) {
    const { commsAudience: _, ...safeUpdates } = updates
    updates = safeUpdates
  }

  state = {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    ),
  }
  emitChange()
}

export function addTask(sectionId: string, projectId: string, title: string) {
  const newTask: Task = {
    id: `t${Date.now()}`,
    title,
    description: "",
    assignee: "",
    dueDate: null,
    priority: "none",
    status: "todo",
    sectionId,
    projectId,
    tags: [],
    completed: false,
    createdAt: new Date().toISOString().split("T")[0],
    linkedTasks: [],
    dependencies: [],
  }
  state = { ...state, tasks: [...state.tasks, newTask] }
  emitChange()
  return newTask
}

export function deleteTask(taskId: string) {
  state = {
    ...state,
    tasks: state.tasks.map((t) => ({
      ...t,
      linkedTasks: t.linkedTasks.filter((l) => l.taskId !== taskId),
      dependencies: t.dependencies.filter((d) => d.taskId !== taskId),
    })).filter((t) => t.id !== taskId),
    activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
  }
  emitChange()
}

export function addSection(projectId: string, name: string) {
  const projectSections = state.sections.filter((s) => s.projectId === projectId)
  const newSection: Section = {
    id: `s${Date.now()}`,
    name,
    projectId,
    order: projectSections.length,
  }
  state = { ...state, sections: [...state.sections, newSection] }
  emitChange()
}

export function moveTask(taskId: string, newSectionId: string) {
  const targetSection = state.sections.find((s) => s.id === newSectionId)
  const sectionName = targetSection?.name.toLowerCase() ?? ""

  let nextStatus: TaskStatus | null = null
  let nextCompleted: boolean | null = null

  if (sectionName.includes("done")) {
    nextStatus = "done"
    nextCompleted = true
  } else if (sectionName.includes("in progress") || sectionName.includes("in-progress")) {
    nextStatus = "in-progress"
    nextCompleted = false
  } else if (sectionName.includes("backlog") || sectionName.includes("to do") || sectionName.includes("todo")) {
    nextStatus = "todo"
    nextCompleted = false
  }

  state = {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            sectionId: newSectionId,
            ...(nextStatus ? { status: nextStatus } : {}),
            ...(nextCompleted !== null ? { completed: nextCompleted } : {}),
          }
        : t
    ),
  }
  emitChange()
}

export function linkTasks(taskId1: string, taskId2: string) {
  state = {
    ...state,
    tasks: state.tasks.map((t) => {
      if (t.id === taskId1) {
        if (t.linkedTasks.some((l) => l.taskId === taskId2)) return t
        return { ...t, linkedTasks: [...t.linkedTasks, { taskId: taskId2, type: "related" as const }] }
      }
      if (t.id === taskId2) {
        if (t.linkedTasks.some((l) => l.taskId === taskId1)) return t
        return { ...t, linkedTasks: [...t.linkedTasks, { taskId: taskId1, type: "related" as const }] }
      }
      return t
    }),
  }
  emitChange()
}

export function unlinkTasks(taskId1: string, taskId2: string) {
  state = {
    ...state,
    tasks: state.tasks.map((t) => {
      if (t.id === taskId1) {
        return { ...t, linkedTasks: t.linkedTasks.filter((l) => l.taskId !== taskId2) }
      }
      if (t.id === taskId2) {
        return { ...t, linkedTasks: t.linkedTasks.filter((l) => l.taskId !== taskId1) }
      }
      return t
    }),
  }
  emitChange()
}

export function addDependency(taskId: string, dependsOnTaskId: string) {
  state = {
    ...state,
    tasks: state.tasks.map((t) => {
      if (t.id === taskId) {
        if (t.dependencies.some((d) => d.taskId === dependsOnTaskId)) return t
        return { ...t, dependencies: [...t.dependencies, { taskId: dependsOnTaskId, type: "blocked-by" as const }] }
      }
      if (t.id === dependsOnTaskId) {
        if (t.dependencies.some((d) => d.taskId === taskId)) return t
        return { ...t, dependencies: [...t.dependencies, { taskId, type: "blocking" as const }] }
      }
      return t
    }),
  }
  emitChange()
}

export function removeDependency(taskId: string, dependsOnTaskId: string) {
  state = {
    ...state,
    tasks: state.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, dependencies: t.dependencies.filter((d) => d.taskId !== dependsOnTaskId) }
      }
      if (t.id === dependsOnTaskId) {
        return { ...t, dependencies: t.dependencies.filter((d) => d.taskId !== taskId) }
      }
      return t
    }),
  }
  emitChange()
}

export function addProject(name: string, color: string) {
  const newProject: Project = {
    id: `p${Date.now()}`,
    name,
    color,
    icon: "folder",
  }
  const defaultSectionsForProject: Section[] = [
    { id: `s${Date.now()}-1`, name: "To Do", projectId: newProject.id, order: 0 },
    { id: `s${Date.now()}-2`, name: "In Progress", projectId: newProject.id, order: 1 },
    { id: `s${Date.now()}-3`, name: "Done", projectId: newProject.id, order: 2 },
  ]
  state = {
    ...state,
    projects: [...state.projects, newProject],
    sections: [...state.sections, ...defaultSectionsForProject],
    activeProjectId: newProject.id,
    activeView: "project",
  }
  emitChange()
}

export function addBannerAssignment(taskId: string, date: string, bannerSize: BannerSize) {
  const newAssignment: BannerAssignment = {
    id: `b${Date.now()}`,
    taskId,
    date,
    bannerSize,
  }
  state = { ...state, bannerAssignments: [...state.bannerAssignments, newAssignment] }
  emitChange()
}

export function removeBannerAssignment(assignmentId: string) {
  state = {
    ...state,
    bannerAssignments: state.bannerAssignments.filter((a) => a.id !== assignmentId),
  }
  emitChange()
}

export function setActiveView(view: ActiveView) {
  state = { ...state, activeView: view, activeTaskId: null }
  emitChange()
}

export function addComment(taskId: string, text: string) {
  const newComment: Comment = {
    id: `c${Date.now()}`,
    taskId,
    author: CURRENT_USER,
    text,
    createdAt: new Date().toISOString(),
  }
  state = { ...state, comments: [...state.comments, newComment] }
  emitChange()
}

export function markNotificationRead(notificationId: string) {
  state = {
    ...state,
    notifications: state.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    ),
  }
  emitChange()
}

export function markAllNotificationsRead() {
  state = {
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  }
  emitChange()
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "read">) {
  const newNotification: Notification = {
    ...notification,
    id: `n${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    createdAt: new Date().toISOString(),
  }
  state = { ...state, notifications: [newNotification, ...state.notifications] }
  emitChange()
}

export function requestApproval(taskId: string, requestedFrom: string[]) {
  const task = state.tasks.find((t) => t.id === taskId)
  if (!task) return
  const existing = task.approvalRequests || []
  const newRequests: ApprovalRequest[] = requestedFrom
    .filter((name) => !existing.some((r) => r.requestedFrom === name && r.status === "pending"))
    .map((name) => ({
      id: `ar${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      taskId,
      requestedBy: CURRENT_USER,
      requestedFrom: name,
      status: "pending" as const,
      requestedAt: new Date().toISOString(),
    }))
  if (newRequests.length === 0) return
  // If task is already "Confirmed", revert to "Pending" since new approvals are now required
  const shouldRevertStatus = task.contentStatus === "Confirmed"
  state = {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            approvalRequired: true,
            approvalRequests: [...existing, ...newRequests],
            ...(shouldRevertStatus ? { contentStatus: "Pending" as const } : {}),
          }
        : t
    ),
  }
  emitChange()
  newRequests.forEach((req) => {
    addNotification({
      type: "approval-requested",
      title: "Approval requested",
      description: `${req.requestedBy} requested your approval on "${task.title}"`,
      taskId,
      projectId: task.projectId,
    })
  })
}

export function respondToApproval(taskId: string, approverName: string, decision: "approved" | "rejected", comment?: string) {
  const task = state.tasks.find((t) => t.id === taskId)
  if (!task) return
  const requests = task.approvalRequests || []
  const updated = requests.map((r) =>
    r.requestedFrom === approverName && r.status === "pending"
      ? { ...r, status: decision, respondedAt: new Date().toISOString(), comment: comment || r.comment }
      : r
  )
  state = {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, approvalRequests: updated } : t
    ),
  }
  emitChange()
  addNotification({
    type: decision === "approved" ? "approval-approved" : "approval-rejected",
    title: decision === "approved" ? "Approval granted" : "Approval rejected",
    description: `${approverName} ${decision} "${task.title}"`,
    taskId,
    projectId: task.projectId,
  })
}

export function isFullyApproved(task: Task): boolean {
  const requests = task.approvalRequests || []
  if (requests.length === 0) return false
  return requests.every((r) => r.status === "approved")
}

export function getPendingApprovalsForUser(userName: string): Task[] {
  return state.tasks.filter((t) =>
    (t.approvalRequests || []).some((r) => r.requestedFrom === userName && r.status === "pending")
  )
}

export function getRequestedApprovalsByUser(userName: string): Task[] {
  return state.tasks.filter((t) =>
    (t.approvalRequests || []).some((r) => r.requestedBy === userName)
  )
}

export function setFilter(filter: Partial<FilterState>) {
  state = { ...state, filterState: { ...state.filterState, ...filter } }
  emitChange()
}

export function setSort(field: SortField, direction: SortDirection) {
  state = { ...state, sortField: field, sortDirection: direction }
  emitChange()
}

export function clearFilters() {
  state = {
    ...state,
    filterState: { priority: "all", assignee: "all", completed: "all", dueDateRange: "all" },
    sortField: "createdAt",
    sortDirection: "asc",
  }
  emitChange()
}

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function getFilteredTasks(tasks: Task[]): Task[] {
  const { filterState, searchQuery, sortField, sortDirection } = state
  let filtered = tasks

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
    )
  }

  if (filterState.priority !== "all") {
    filtered = filtered.filter((t) => t.priority === filterState.priority)
  }

  if (filterState.assignee !== "all") {
    filtered = filtered.filter((t) => t.assignee === filterState.assignee)
  }

  if (filterState.completed === "completed") {
    filtered = filtered.filter((t) => t.completed)
  } else if (filterState.completed === "incomplete") {
    filtered = filtered.filter((t) => !t.completed)
  }

  if (filterState.dueDateRange !== "all") {
    const today = new Date()
    const todayStr = getDateStr(today)
    if (filterState.dueDateRange === "overdue") {
      filtered = filtered.filter((t) => t.dueDate && t.dueDate < todayStr && !t.completed)
    } else if (filterState.dueDateRange === "today") {
      filtered = filtered.filter((t) => t.dueDate === todayStr)
    } else if (filterState.dueDateRange === "this-week") {
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const weekEndStr = getDateStr(weekEnd)
      filtered = filtered.filter((t) => t.dueDate && t.dueDate >= todayStr && t.dueDate <= weekEndStr)
    } else if (filterState.dueDateRange === "next-week") {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() + 7)
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 14)
      filtered = filtered.filter(
        (t) => t.dueDate && t.dueDate >= getDateStr(weekStart) && t.dueDate <= getDateStr(weekEnd)
      )
    }
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
  filtered.sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case "title":
        cmp = a.title.localeCompare(b.title)
        break
      case "dueDate":
        cmp = (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31")
        break
      case "priority":
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
      case "assignee":
        cmp = a.assignee.localeCompare(b.assignee)
        break
      case "createdAt":
        cmp = a.createdAt.localeCompare(b.createdAt)
        break
    }
    return sortDirection === "desc" ? -cmp : cmp
  })

  return filtered
}

type RankedTask = {
  task: Task
  score: number
}

function scoreField(fieldValue: string, query: string, startsWithScore: number, containsScore: number): number {
  if (!fieldValue) return 0
  const value = fieldValue.toLowerCase()
  if (value.startsWith(query)) return startsWithScore
  if (value.includes(` ${query}`)) return containsScore + 10
  if (value.includes(query)) return containsScore
  return 0
}

function getTaskSearchScore(task: Task, query: string, projectName: string, projectAcronym: string): number {
  let best = 0

  best = Math.max(best, scoreField(task.title, query, 240, 170))
  best = Math.max(best, scoreField(task.assignee, query, 150, 110))
  best = Math.max(best, scoreField(task.description, query, 105, 80))
  best = Math.max(best, scoreField(projectName, query, 95, 70))
  best = Math.max(best, scoreField(projectAcronym, query, 210, 150))
  best = Math.max(best, scoreField(task.commsTitle ?? "", query, 140, 100))
  best = Math.max(best, scoreField(task.commsLead ?? "", query, 120, 90))
  best = Math.max(best, scoreField(task.commsAuthor ?? "", query, 120, 90))
  best = Math.max(best, scoreField(task.commsAudience ?? "", query, 90, 65))
  best = Math.max(best, scoreField(task.commsEnterpriseCategory ?? "", query, 90, 65))

  if (task.tags.length > 0) {
    best = Math.max(best, scoreField(task.tags.join(" "), query, 110, 85))
  }

  if (task.commsChannels && task.commsChannels.length > 0) {
    best = Math.max(best, scoreField(task.commsChannels.join(" "), query, 105, 80))
  }

  return best
}

function rankGlobalSearchResults(query: string): RankedTask[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const projectNameById = new Map(state.projects.map((project) => [project.id, project.name]))
  const projectAcronymById = new Map(
    state.projects.map((project) => [project.id, PROJECT_SEARCH_ACRONYMS[project.name] ?? ""])
  )

  return state.tasks
    .map((task) => {
      const projectName = projectNameById.get(task.projectId) ?? ""
      const projectAcronym = projectAcronymById.get(task.projectId) ?? ""
      return {
        task,
        score: getTaskSearchScore(task, normalized, projectName, projectAcronym),
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.task.title.localeCompare(b.task.title)
    })
}

export function getGlobalSearchResults(query: string): Task[] {
  return rankGlobalSearchResults(query).map((entry) => entry.task)
}

export function getGlobalSearchSuggestions(query: string, limit = 5): Task[] {
  if (limit <= 0) return []
  return rankGlobalSearchResults(query)
    .slice(0, limit)
    .map((entry) => entry.task)
}

// ── EventHub actions & selectors ─────────────────────────────────────────────

export function addEvent(draft: Omit<EventItem, "id" | "linkedTaskId">): EventItem {
  const stamp = Date.now()
  const eventId = `ev${stamp}`
  const taskId = `tev${stamp}`
  const newEvent: EventItem = { ...draft, id: eventId, linkedTaskId: taskId }
  const linkedTask = buildLinkedTaskForEvent(newEvent, taskId, state.sections)
  state = {
    ...state,
    events: [newEvent, ...state.events],
    tasks: [...state.tasks, linkedTask],
  }
  emitChange()
  addNotification({
    type: "assignment",
    title: "Event created",
    description: `"${newEvent.title}" was added to the comms calendar`,
    taskId,
    projectId: newEvent.projectId,
  })
  return newEvent
}

export function updateEvent(eventId: string, updates: Partial<EventItem>) {
  const event = state.events.find((e) => e.id === eventId)
  if (!event) return
  const merged = { ...event, ...updates }
  const meta = EVENT_FORMAT_META[merged.format]
  const isDone = merged.status === "completed"
  state = {
    ...state,
    events: state.events.map((e) => (e.id === eventId ? merged : e)),
    tasks: state.tasks.map((t) =>
      t.id === event.linkedTaskId
        ? {
            ...t,
            title: merged.title,
            dueDate: merged.date,
            commsTitle: merged.title,
            commsPublishDate: merged.date,
            commsEventType: meta.eventType,
            contentStatus: isDone ? "Confirmed" : t.contentStatus,
            completed: isDone,
            status: isDone ? "done" : t.status,
          }
        : t
    ),
  }
  emitChange()
}

export function deleteEvent(eventId: string) {
  const event = state.events.find((e) => e.id === eventId)
  if (!event) return
  state = {
    ...state,
    events: state.events.filter((e) => e.id !== eventId),
    tasks: state.tasks.filter((t) => t.id !== event.linkedTaskId),
    activeTaskId: state.activeTaskId === event.linkedTaskId ? null : state.activeTaskId,
  }
  emitChange()
}

export function getEventForTask(taskId: string): EventItem | undefined {
  return state.events.find((e) => e.linkedTaskId === taskId)
}

export interface SpeakerDirectoryEntry extends EventSpeaker {
  events: number
  topics: string[]
}

export function getSpeakerDirectory(): SpeakerDirectoryEntry[] {
  const map = new Map<string, SpeakerDirectoryEntry>()
  for (const e of state.events) {
    for (const s of e.speakers) {
      const existing = map.get(s.name)
      if (existing) {
        existing.events += 1
        for (const t of e.topics) {
          if (!existing.topics.includes(t)) existing.topics.push(t)
        }
      } else {
        map.set(s.name, { ...s, events: 1, topics: [...e.topics] })
      }
    }
  }
  return [...map.values()].sort((a, b) => b.events - a.events)
}

export function getTopicCounts(): { topic: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const e of state.events) {
    for (const t of e.topics) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
}

export interface EventAnalytics {
  totalEvents: number
  totalInvited: number
  totalRegistered: number
  totalAttended: number
  showRate: number
  byFormat: { format: EventFormat; label: string; count: number; chart: string }[]
}

export function getEventAnalytics(): EventAnalytics {
  const events = state.events
  const totalInvited = events.reduce((s, e) => s + e.invited, 0)
  const totalRegistered = events.reduce((s, e) => s + e.registered, 0)
  const totalAttended = events.reduce((s, e) => s + e.attended, 0)
  const done = events.filter((e) => e.status === "completed")
  const showRate = done.length
    ? Math.round(
        (done.reduce((s, e) => s + e.attended / (e.registered || 1), 0) / done.length) * 100
      )
    : 0
  const byFormat = (Object.keys(EVENT_FORMAT_META) as EventFormat[]).map((format) => ({
    format,
    label: EVENT_FORMAT_META[format].label,
    count: events.filter((e) => e.format === format).length,
    chart: EVENT_FORMAT_META[format].chart,
  }))
  return {
    totalEvents: events.length,
    totalInvited,
    totalRegistered,
    totalAttended,
    showRate,
    byFormat,
  }
}

