"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, ArrowUpRight, Calendar, User, CircleDot } from "lucide-react"
import {
  useStore,
  getGlobalSearchResults,
  setSearchQuery,
  setActiveProject,
  setActiveTask,
  setActiveView,
  type Task,
} from "@/lib/store"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const priorityLabel: Record<Task["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
}

function formatDateUTC(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function SearchResultsView() {
  const store = useStore()
  const [query, setQuery] = useState(store.searchQuery)

  useEffect(() => {
    setQuery(store.searchQuery)
  }, [store.searchQuery])

  const hasQuery = query.trim().length > 0

  const projectById = useMemo(
    () => new Map(store.projects.map((project) => [project.id, project])),
    [store.projects]
  )

  const results = useMemo(
    () => getGlobalSearchResults(query),
    [query, store.tasks, store.projects]
  )

  function submitSearch() {
    setSearchQuery(query.trim())
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-border bg-card px-8 pt-8 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Global Search Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find matching records across all projects.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                submitSearch()
              }
            }}
            placeholder="Search all records..."
            className="h-9 w-full max-w-xl"
          />
          <Button size="sm" onClick={submitSearch} className="gap-1.5">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {!hasQuery
            ? "Type a query to search across all records."
            : `${results.length} result${results.length === 1 ? "" : "s"} found for \"${query.trim()}\"`}
        </div>
      </header>

      <ScrollArea className="flex-1">
        {!hasQuery ? (
          <div className="flex min-h-[280px] items-center justify-center px-8 py-10 text-sm text-muted-foreground">
            Start typing in the search box to see global results.
          </div>
        ) : results.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-8 py-10 text-sm text-muted-foreground">
            <CircleDot className="h-8 w-8" />
            <p>No records matched your search.</p>
          </div>
        ) : (
          <div className="flex flex-col px-6 py-4">
            {results.map((task) => {
              const project = projectById.get(task.projectId)

              return (
                <div
                  key={task.id}
                  className={cn(
                    "group mb-2 rounded-lg border border-border bg-card px-4 py-3 transition-colors",
                    "hover:bg-accent/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => setActiveTask(task.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-sm font-semibold text-foreground">{task.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {project && (
                          <Badge variant="outline" className="font-normal" style={{ borderColor: `${project.color}66` }}>
                            {project.name}
                          </Badge>
                        )}
                        {task.assignee && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateUTC(task.dueDate)}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                      )}
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                      {task.priority !== "none" && (
                        <Badge variant="secondary">{priorityLabel[task.priority]}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setActiveProject(task.projectId)
                          setActiveTask(task.id)
                          setActiveView("project")
                        }}
                      >
                        Open
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
