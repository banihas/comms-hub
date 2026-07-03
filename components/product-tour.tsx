"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setActiveView } from "@/lib/store"
import { useMounted } from "@/hooks/use-mounted"

interface TourStep {
  target: string          // data-tour attribute value
  title: string
  description: string
  position: "top" | "bottom" | "left" | "right"
  navigateTo?: string     // ActiveView to navigate to before showing step
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
      "All your team projects are listed here with open task counts. Click any project to see its tasks in List, Board, or Calendar view. You can also create new projects with the + button.",
    position: "right",
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
    const tooltipWidth = 340
    const tooltipEstimatedHeight = 200

    const style: React.CSSProperties = { maxWidth: tooltipWidth }

    switch (step.position) {
      case "right": {
        const top = Math.max(16, Math.min(spotlightRect.top, window.innerHeight - tooltipEstimatedHeight - 16))
        style.top = top
        style.left = spotlightRect.right + padding
        break
      }
      case "left": {
        const top = Math.max(16, Math.min(spotlightRect.top, window.innerHeight - tooltipEstimatedHeight - 16))
        style.top = top
        style.right = window.innerWidth - spotlightRect.left + padding
        break
      }
      case "bottom": {
        const top = spotlightRect.bottom + padding
        // If tooltip would go off-screen bottom, place it above instead
        if (top + tooltipEstimatedHeight > window.innerHeight - 16) {
          style.bottom = window.innerHeight - spotlightRect.top + padding
        } else {
          style.top = top
        }
        style.left = Math.max(16, Math.min(spotlightRect.left, window.innerWidth - tooltipWidth - 16))
        break
      }
      case "top": {
        style.bottom = window.innerHeight - spotlightRect.top + padding
        style.left = Math.max(16, Math.min(spotlightRect.left, window.innerWidth - tooltipWidth - 16))
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
