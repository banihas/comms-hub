"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setActiveView, setActiveProject, setReportingTab } from "@/lib/store"
import { useMounted } from "@/hooks/use-mounted"

interface TourStep {
  target: string          // data-tour attribute value
  title: string
  description: string
  position: "top" | "bottom" | "left" | "right"
  navigateTo?: string     // ActiveView to navigate to before showing step
  onEnter?: () => void     // extra side-effect to run when the step is shown
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "sidebar-nav",
    title: "Navigation",
    description:
      "Use these links to switch between views — Home for your dashboard, My Tasks for personal work, Inbox for notifications, Approvals for managing sign-offs, Calendar for scheduling, and Content Calendar for communications planning.",
    position: "right",
  },
  {
    target: "sidebar-projects",
    title: "Projects",
    description:
      "All your team projects are listed here with open task counts. Click any project — like the highlighted one — to see its tasks in List, Board, or Calendar view. You can also create new projects with the + button.",
    position: "right",
    navigateTo: "project",
    onEnter: () => setActiveProject("p1"),
  },
  {
    target: "home-stats",
    title: "Dashboard Overview",
    description:
      "The Home view gives you a quick overview: task stats, upcoming deadlines for the next 7 days, project progress, and recent activity across your workspace.",
    position: "bottom",
    navigateTo: "home",
  },
  {
    target: "content-calendar-area",
    title: "Content Calendar",
    description:
      "Plan weekly communications with a visual calendar. See Large Banners, Small Banners, and content cards organized by day with status tracking (Pending / Confirmed).",
    position: "bottom",
    navigateTo: "content-calendar",
  },
  {
    target: "approvals-area",
    title: "Approvals",
    description:
      "Track and manage approval workflows in one place. The \"Needs My Approval\" tab shows requests awaiting your review — approve or reject with a single click. The \"My Requests\" tab lets you monitor the status of approvals you've sent to others, with per-person status indicators.",
    position: "bottom",
    navigateTo: "approvals",
  },
  {
    target: "reporting-channel-performance",
    title: "Channel Performance",
    description:
      "The Reporting tab breaks down how your communications are performing. The Channel Performance section shows open rates, click rates, and engagement across every channel — CIBC Today, Viva Engage, Email, Events and more — so you can see what's resonating with your audience.",
    position: "top",
    navigateTo: "reporting",
    onEnter: () => setReportingTab("channel-performance"),
  },
  {
    target: "events-area",
    title: "Events",
    description:
      "Plan and track events end-to-end. Create an event, target the right audiences, and every event is automatically linked to a task and synced to the comms calendar so nothing falls through the cracks.",
    position: "bottom",
    navigateTo: "events",
  },
  {
    target: "comms-calendar-details",
    title: "Comms Calendar Details",
    description:
      "When a task is labelled \"For Comms Calendar\", a dedicated details section appears in the task panel. Click \"Edit Details\" to open the pop-out modal where you can configure channel sources (CIBC Today, Viva Engage, Email, Events), assign a comms lead, set publish dates, and manage target audiences. Selecting CIBC Today automatically requests Editorial & Publishing approval.",
    position: "left",
  },
  {
    target: "sidebar-theme",
    title: "Theme Toggle",
    description:
      "Switch between Light and Dark mode to suit your preference. The app will remember your choice.",
    position: "right",
  },
]

interface ProductTourProps {
  isOpen: boolean
  onClose: () => void
}

export function ProductTour({ isOpen, onClose }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = welcome screen
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const mounted = useMounted()

  const totalSteps = TOUR_STEPS.length

  const updateSpotlight = useCallback(() => {
    if (currentStep < 0 || currentStep >= totalSteps) {
      setSpotlightRect(null)
      return
    }

    const step = TOUR_STEPS[currentStep]
    const el = document.querySelector(`[data-tour="${step.target}"]`)

    if (el) {
      const rect = el.getBoundingClientRect()
      setSpotlightRect(rect)
    } else {
      setSpotlightRect(null)
    }
  }, [currentStep, totalSteps])

  // Navigate to the right view if the step requires it
  useEffect(() => {
    if (!isOpen || currentStep < 0 || currentStep >= totalSteps) return

    const step = TOUR_STEPS[currentStep]
    if (step.navigateTo) {
      setActiveView(step.navigateTo as Parameters<typeof setActiveView>[0])
    }
    step.onEnter?.()

    // Retry finding the element a few times to handle async view transitions
    let attempts = 0
    const maxAttempts = 5
    const tryUpdate = () => {
      updateSpotlight()
      attempts++
      if (!document.querySelector(`[data-tour="${step.target}"]`) && attempts < maxAttempts) {
        return setTimeout(tryUpdate, 150)
      }
      return undefined
    }
    const timer = setTimeout(tryUpdate, 100)
    return () => clearTimeout(timer)
  }, [currentStep, isOpen, totalSteps, updateSpotlight])

  // Update spotlight on resize/scroll
  useEffect(() => {
    if (!isOpen) return

    window.addEventListener("resize", updateSpotlight)
    window.addEventListener("scroll", updateSpotlight, true)
    return () => {
      window.removeEventListener("resize", updateSpotlight)
      window.removeEventListener("scroll", updateSpotlight, true)
    }
  }, [isOpen, updateSpotlight])

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(-1)
      setSpotlightRect(null)
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const isWelcome = currentStep === -1
  const isComplete = currentStep >= totalSteps
  const step = currentStep >= 0 && currentStep < totalSteps ? TOUR_STEPS[currentStep] : null

  function handleNext() {
    if (isComplete) {
      onClose()
      return
    }
    setCurrentStep((s) => s + 1)
  }

  function handlePrev() {
    setCurrentStep((s) => Math.max(-1, s - 1))
  }

  function handleSkip() {
    onClose()
  }

  // Calculate tooltip position based on spotlight rect and step position
  function getTooltipStyle(): React.CSSProperties {
    if (!spotlightRect || !step) return {}

    const padding = 12
    const margin = 16
    const tooltipWidth = 340
    const tooltipHeight = 220
    const vw = window.innerWidth
    const vh = window.innerHeight

    const style: React.CSSProperties = { maxWidth: tooltipWidth }

    // Clamp helpers keep the tooltip fully inside the viewport
    const clampTop = (t: number) =>
      Math.max(margin, Math.min(t, vh - tooltipHeight - margin))
    const clampLeft = (l: number) =>
      Math.max(margin, Math.min(l, vw - tooltipWidth - margin))

    // Available space on each side of the spotlight
    const spaceBelow = vh - spotlightRect.bottom
    const spaceAbove = spotlightRect.top
    const spaceRight = vw - spotlightRect.right
    const spaceLeft = spotlightRect.left

    switch (step.position) {
      case "right": {
        if (spaceRight >= tooltipWidth + padding + margin) {
          style.left = spotlightRect.right + padding
          style.top = clampTop(spotlightRect.top)
        } else if (spaceLeft >= tooltipWidth + padding + margin) {
          style.left = clampLeft(spotlightRect.left - tooltipWidth - padding)
          style.top = clampTop(spotlightRect.top)
        } else {
          // No room beside: overlay near the top-left of the target
          style.left = clampLeft(spotlightRect.left)
          style.top = clampTop(spotlightRect.bottom + padding)
        }
        break
      }
      case "left": {
        if (spaceLeft >= tooltipWidth + padding + margin) {
          style.left = clampLeft(spotlightRect.left - tooltipWidth - padding)
          style.top = clampTop(spotlightRect.top)
        } else if (spaceRight >= tooltipWidth + padding + margin) {
          style.left = spotlightRect.right + padding
          style.top = clampTop(spotlightRect.top)
        } else {
          style.left = clampLeft(spotlightRect.right - tooltipWidth)
          style.top = clampTop(spotlightRect.bottom + padding)
        }
        break
      }
      case "bottom": {
        style.left = clampLeft(spotlightRect.left)
        if (spaceBelow >= tooltipHeight + padding + margin) {
          style.top = spotlightRect.bottom + padding
        } else if (spaceAbove >= tooltipHeight + padding + margin) {
          style.top = clampTop(spotlightRect.top - tooltipHeight - padding)
        } else {
          // Target too tall to sit above/below: pin near bottom of viewport
          style.top = vh - tooltipHeight - margin
        }
        break
      }
      case "top": {
        style.left = clampLeft(spotlightRect.left)
        if (spaceAbove >= tooltipHeight + padding + margin) {
          style.top = clampTop(spotlightRect.top - tooltipHeight - padding)
        } else if (spaceBelow >= tooltipHeight + padding + margin) {
          style.top = spotlightRect.bottom + padding
        } else {
          // Target too tall to sit above/below: pin near top of viewport
          style.top = margin
        }
        break
      }
    }

    return style
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      {(isWelcome || isComplete) ? (
        // Full overlay for welcome/complete screens
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      ) : spotlightRect ? (
        // Spotlight overlay with cutout
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={spotlightRect.left - 6}
                y={spotlightRect.top - 6}
                width={spotlightRect.width + 12}
                height={spotlightRect.height + 12}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      ) : (
        <div className="absolute inset-0 bg-black/55" />
      )}

      {/* Spotlight ring around target */}
      {spotlightRect && !isWelcome && !isComplete && (
        <div
          className="absolute rounded-lg ring-2 ring-primary/80 transition-all duration-300 pointer-events-none"
          style={{
            top: spotlightRect.top - 6,
            left: spotlightRect.left - 6,
            width: spotlightRect.width + 12,
            height: spotlightRect.height + 12,
          }}
        />
      )}

      {/* Welcome Screen */}
      {isWelcome && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background border rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Welcome to Comms Hub!
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Let&apos;s take a quick tour to help you get the most out of your communications planning workspace. This will only take a minute.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleNext} className="w-full">
                Start Tour
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background border rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <span className="text-2xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              You&apos;re all set!
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You now know the essentials. Start by exploring your Home dashboard or diving into a project. You can replay this tour anytime from the sidebar.
            </p>
            <Button onClick={handleSkip} className="w-full">
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Step Tooltip */}
      {step && (
        <div
          ref={tooltipRef}
          className="absolute z-10 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={spotlightRect ? getTooltipStyle() : { top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 340 }}
        >
          <div className="bg-background border rounded-xl shadow-2xl p-5">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-3">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-6 bg-primary"
                      : i < currentStep
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>

            <h3 className="text-base font-semibold mb-1.5">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {totalSteps}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                  {currentStep < totalSteps - 1 && (
                    <ChevronRight className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
