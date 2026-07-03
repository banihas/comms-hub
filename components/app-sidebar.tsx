"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Home,
  CheckCircle2,
  Plus,
  ChevronDown,
  ChevronRight,
  Hash,
  Search,
  X,
  Inbox,
  CalendarDays,
  Megaphone,
  Target,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
  ClipboardCheck,
  CalendarPlus,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  useStore,
  setActiveProject,
  setActiveView,
  setSearchQuery,
  getGlobalSearchSuggestions,
  PROJECT_SEARCH_ACRONYMS,
  addProject,
  getPendingApprovalsForUser,
  CURRENT_USER,
  type ActiveView,
} from "@/lib/store"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const NAV_ITEMS: { id: ActiveView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "my-tasks", label: "My Tasks", icon: CheckCircle2 },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "approvals", label: "Approvals", icon: ClipboardCheck },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "content-calendar", label: "Content Calendar", icon: Megaphone },
  { id: "events", label: "Events", icon: CalendarPlus },
  { id: "goals", label: "Goals", icon: Target },
  { id: "reporting", label: "Reporting", icon: BarChart3 },
]

export function AppSidebar({ onStartTour }: { onStartTour?: () => void }) {
  const store = useStore()
  const { theme, setTheme } = useTheme()
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [globalSearchDraft, setGlobalSearchDraft] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1)

  const unreadCount = store.notifications.filter((n) => !n.read).length
  const pendingApprovalCount = getPendingApprovalsForUser(CURRENT_USER).length
  const hasSearchDraft = globalSearchDraft.trim().length > 0
  const currentUserInitials = CURRENT_USER
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const projectNameById = useMemo(
    () => new Map(store.projects.map((project) => [project.id, project.name])),
    [store.projects]
  )

  const projectAcronymById = useMemo(
    () =>
      new Map(
        store.projects.map((project) => [project.id, PROJECT_SEARCH_ACRONYMS[project.name] ?? ""])
      ),
    [store.projects]
  )

  const globalSuggestions = useMemo(
    () => getGlobalSearchSuggestions(globalSearchDraft, 6),
    [globalSearchDraft, store.tasks, store.projects]
  )

  useEffect(() => {
    if (!showSearch) return
    setGlobalSearchDraft(store.searchQuery)
  }, [showSearch, store.searchQuery])

  useEffect(() => {
    setHighlightedSuggestionIndex(-1)
  }, [globalSearchDraft])

  function commitGlobalSearch(rawQuery: string) {
    const query = rawQuery.trim()
    setGlobalSearchDraft(query)
    setSearchQuery(query)
    setShowSuggestions(false)
    setActiveView("search-results")
  }

  function handleCreateProject() {
    if (newName.trim()) {
      const colors = ["#E8675A", "#4ECDC4", "#6C5CE7", "#F0932B", "#686DE0"]
      addProject(newName.trim(), colors[Math.floor(Math.random() * colors.length)])
      setNewName("")
      setIsCreating(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header: workspace identity + collapse toggle */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Expanded state */}
            <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
              <Avatar className="h-7 w-7 shrink-0 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {currentUserInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-semibold tracking-tight">My Workspace</span>
              <SidebarTrigger className="ml-auto" />
            </div>
            {/* Collapsed state: just the trigger */}
            <div className="hidden group-data-[collapsible=icon]:flex justify-center py-1">
              <SidebarTrigger />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        <SidebarGroup className="pt-0 pb-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {showSearch ? (
                  <div className="flex items-center gap-1 px-2 group-data-[collapsible=icon]:hidden">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="relative flex-1 min-w-0">
                      <input
                        autoFocus
                        placeholder="Search all records..."
                        value={globalSearchDraft}
                        onChange={(e) => {
                          setGlobalSearchDraft(e.target.value)
                          setShowSuggestions(true)
                        }}
                        onFocus={() => {
                          if (globalSuggestions.length > 0) setShowSuggestions(true)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            if (hasSearchDraft) {
                              setGlobalSearchDraft("")
                              setSearchQuery("")
                              setShowSuggestions(false)
                            } else {
                              setShowSearch(false)
                            }
                            return
                          }

                          if (e.key === "ArrowDown" && globalSuggestions.length > 0) {
                            e.preventDefault()
                            setShowSuggestions(true)
                            setHighlightedSuggestionIndex((prev) =>
                              prev >= globalSuggestions.length - 1 ? 0 : prev + 1
                            )
                            return
                          }

                          if (e.key === "ArrowUp" && globalSuggestions.length > 0) {
                            e.preventDefault()
                            setShowSuggestions(true)
                            setHighlightedSuggestionIndex((prev) =>
                              prev <= 0 ? globalSuggestions.length - 1 : prev - 1
                            )
                            return
                          }

                          if (e.key === "Enter") {
                            e.preventDefault()
                            if (
                              highlightedSuggestionIndex >= 0 &&
                              highlightedSuggestionIndex < globalSuggestions.length
                            ) {
                              commitGlobalSearch(globalSuggestions[highlightedSuggestionIndex].title)
                              return
                            }
                            commitGlobalSearch(globalSearchDraft)
                          }
                        }}
                        onBlur={() => {
                          window.setTimeout(() => setShowSuggestions(false), 120)
                          if (!globalSearchDraft.trim()) setShowSearch(false)
                        }}
                        className="h-8 w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                      />

                      {showSuggestions && globalSuggestions.length > 0 && (
                        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-20 rounded-md border border-sidebar-border bg-sidebar shadow-sm">
                          <ul className="max-h-64 overflow-y-auto py-1">
                            {globalSuggestions.map((task, index) => (
                              <li key={task.id}>
                                <button
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => commitGlobalSearch(task.title)}
                                  className={cn(
                                    "flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-xs",
                                    highlightedSuggestionIndex === index
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                                  )}
                                >
                                  <span className="truncate">{task.title}</span>
                                  <span className="shrink-0 rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-sidebar-foreground/70">
                                    {projectAcronymById.get(task.projectId) || projectNameById.get(task.projectId)}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {hasSearchDraft && (
                      <button
                        onClick={() => {
                          setGlobalSearchDraft("")
                          setSearchQuery("")
                          setShowSuggestions(false)
                          setShowSearch(false)
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <SidebarMenuButton tooltip="Search" onClick={() => setShowSearch(true)}>
                    <Search />
                    <span>Search</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main navigation */}
        <SidebarGroup className="py-1" data-tour="sidebar-nav">
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={store.activeView === item.id}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.id === "inbox" && unreadCount > 0 && (
                    <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                  )}
                  {item.id === "approvals" && pendingApprovalCount > 0 && (
                    <SidebarMenuBadge>{pendingApprovalCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Projects */}
        <SidebarGroup className="py-1" data-tour="sidebar-projects">
          <SidebarGroupLabel asChild>
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex w-full items-center gap-1"
            >
              {projectsExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1 shrink-0" />
              )}
              Projects
            </button>
          </SidebarGroupLabel>
          <SidebarGroupAction onClick={() => setIsCreating(true)} title="New Project">
            <Plus />
          </SidebarGroupAction>
          {projectsExpanded && (
            <SidebarGroupContent>
              <SidebarMenu>
                {store.projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveProject(project.id)
                        setActiveView("project")
                      }}
                      isActive={
                        store.activeView === "project" &&
                        store.activeProjectId === project.id
                      }
                      tooltip={project.name}
                    >
                      <Hash className="shrink-0" style={{ color: project.color }} />
                      <span>{projectAcronymById.get(project.id) || project.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>
                      {store.tasks.filter(
                        (t) => t.projectId === project.id && !t.completed
                      ).length}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
                {isCreating && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1">
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateProject()
                          if (e.key === "Escape") {
                            setIsCreating(false)
                            setNewName("")
                          }
                        }}
                        onBlur={() => {
                          if (newName.trim()) handleCreateProject()
                          else setIsCreating(false)
                        }}
                        placeholder="Project name..."
                        className="w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2 py-1.5 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                      />
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: theme toggle + product tour */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onStartTour?.()}
              tooltip="Product Tour"
            >
              <Sparkles />
              <span>Product Tour</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem data-tour="sidebar-theme">
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              tooltip={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              <Sun className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span suppressHydrationWarning>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Clickable rail on the edge for collapse/expand */}
      <SidebarRail />
    </Sidebar>
  )
}
