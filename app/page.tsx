"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectHeader } from "@/components/project-header"
import { ListView } from "@/components/list-view"
import { BoardView } from "@/components/board-view"
import { CalendarView } from "@/components/calendar-view"
import { GanttView } from "@/components/gantt-view"
import { TaskDetail } from "@/components/task-detail"
import { HomeView } from "@/components/home-view"
import { MyTasksView } from "@/components/my-tasks-view"
import { InboxView } from "@/components/inbox-view"
import { GlobalCalendarView } from "@/components/global-calendar-view"
import { ContentCalendarView } from "@/components/content-calendar-view"
import { EventsView } from "@/components/events-view"
import { SearchResultsView } from "@/components/search-results-view"
import { ApprovalsView } from "@/components/approvals-view"
import { ReportingView } from "@/components/reporting-view"
import { PlaceholderView } from "@/components/placeholder-view"
import { ProductTour } from "@/components/product-tour"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function Page() {
  const store = useStore()
  const [tourOpen, setTourOpen] = useState(false)

  function withTaskDetail(content: React.ReactNode) {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {content}
        </div>
        {store.activeTaskId && <TaskDetail />}
      </div>
    )
  }

  function renderContent() {
    switch (store.activeView) {
      case "home":
        return withTaskDetail(<HomeView />)
      case "my-tasks":
        return withTaskDetail(<MyTasksView />)
      case "inbox":
        return withTaskDetail(<InboxView />)
      case "calendar":
        return withTaskDetail(<GlobalCalendarView />)
      case "content-calendar":
        return withTaskDetail(<ContentCalendarView />)
      case "events":
        return withTaskDetail(<EventsView />)
      case "search-results":
        return withTaskDetail(<SearchResultsView />)
      case "approvals":
        return withTaskDetail(<ApprovalsView />)
      case "goals":
        return <PlaceholderView title="Goals" description="Set and track objectives across your team. Connect tasks to goals to measure progress." icon="target" />
      case "reporting":
        return withTaskDetail(<ReportingView />)
      case "project":
        return (
          <>
            <ProjectHeader />
            {withTaskDetail(
              store.viewMode === "list" ? (
                <ListView />
              ) : store.viewMode === "board" ? (
                <BoardView />
              ) : store.viewMode === "gantt" ? (
                <GanttView />
              ) : (
                <CalendarView />
              )
            )}
          </>
        )
      default:
        return withTaskDetail(<HomeView />)
    }
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar onStartTour={() => setTourOpen(true)} />
      <SidebarInset className="overflow-hidden">
        {renderContent()}
      </SidebarInset>
      <ProductTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </SidebarProvider>
  )
}
