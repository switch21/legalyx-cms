'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { usePathname } from '@/i18n/routing'

interface OnboardingContextType {
  showOnboarding: boolean
  startOnboarding: () => void
  completeOnboarding: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const OnboardingContext = createContext<OnboardingContextType>({
  showOnboarding: false,
  startOnboarding: () => {},
  completeOnboarding: () => {},
  currentStep: 0,
  setCurrentStep: () => {},
})

export function useOnboarding() {
  return useContext(OnboardingContext)
}

const ONBOARDING_KEY = 'legalyx-onboarding-completed'
const STEPS_KEY = 'legalyx-onboarding-step'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const pathname = usePathname()

  // Check if onboarding was completed
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY)
    if (!completed) {
      // Show onboarding only on dashboard
      if (pathname === '/') {
        const savedStep = parseInt(localStorage.getItem(STEPS_KEY) || '0', 10)
        setCurrentStep(savedStep)
        setShowOnboarding(true)
      }
    }
  }, [pathname])

  const startOnboarding = useCallback(() => {
    setCurrentStep(0)
    setShowOnboarding(true)
  }, [])

  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false)
    localStorage.setItem(ONBOARDING_KEY, 'true')
    localStorage.removeItem(STEPS_KEY)
  }, [])

  // Persist current step
  useEffect(() => {
    if (showOnboarding) {
      localStorage.setItem(STEPS_KEY, String(currentStep))
    }
  }, [currentStep, showOnboarding])

  return (
    <OnboardingContext.Provider value={{ showOnboarding, startOnboarding, completeOnboarding, currentStep, setCurrentStep }}>
      {children}
    </OnboardingContext.Provider>
  )
}