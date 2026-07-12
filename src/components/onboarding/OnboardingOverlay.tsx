'use client'

import { useEffect, useRef } from 'react'
import { useOnboarding } from './OnboardingProvider'
import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/routing'

export default function OnboardingOverlay() {
  const { showOnboarding, completeOnboarding } = useOnboarding()
  const t = useTranslations('Onboarding')
  const pathname = usePathname()
  const driverRef = useRef<any>(null)

  useEffect(() => {
    if (!showOnboarding || pathname !== '/' || driverRef.current) return

    let cancelled = false

    const init = async () => {
      try {
        const driverModule = await import('driver.js')
        if (cancelled) return

        const steps = [
          {
            element: '[data-onboarding="dashboard-title"]',
            popover: {
              title: `${t('step')} 1/7 — ${t('dashboard')}`,
              description: t('dashboardDesc'),
              side: 'bottom' as const,
              align: 'start' as const,
            },
          },
          {
            element: '[data-onboarding="stats-grid"]',
            popover: {
              title: `${t('step')} 2/7 — ${t('dashboard')}`,
              description: t('dashboardDesc'),
              side: 'bottom' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-onboarding="sidebar-dossiers"]',
            popover: {
              title: `${t('step')} 3/7 — ${t('dossiers')}`,
              description: t('dossiersDesc'),
              side: 'right' as const,
              align: 'start' as const,
            },
          },
          {
            element: '[data-onboarding="sidebar-audiences"]',
            popover: {
              title: `${t('step')} 4/7 — ${t('audiences')}`,
              description: t('audiencesDesc'),
              side: 'right' as const,
              align: 'start' as const,
            },
          },
          {
            element: '[data-onboarding="sidebar-documents"]',
            popover: {
              title: `${t('step')} 5/7 — ${t('documents')}`,
              description: t('documentsDesc'),
              side: 'right' as const,
              align: 'start' as const,
            },
          },
          {
            element: '[data-onboarding="sidebar-nav"]',
            popover: {
              title: `${t('step')} 6/7 — ${t('sidebar')}`,
              description: t('sidebarDesc'),
              side: 'right' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-onboarding="theme-toggle"]',
            popover: {
              title: `${t('step')} 7/7 — ${t('darkMode')}`,
              description: t('darkModeDesc'),
              side: 'right' as const,
              align: 'end' as const,
            },
          },
        ]

        // Load CSS separately to avoid SSR issues
        try {
          await import('driver.js/dist/driver.css')
        } catch {
          // CSS might already be loaded or fail silently
        }

        if (cancelled) return

        const { driver } = driverModule
        driverRef.current = driver({
          showProgress: true,
          steps,
          progressText: `${t('step')} {current} / {total}`,
          nextBtnText: t('next'),
          prevBtnText: t('prev'),
          doneBtnText: t('done'),
          onHighlightStarted: (element: Element | undefined) => {
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          },
          onDestroyStarted: () => {
            completeOnboarding()
            driverRef.current = null
          },
          allowClose: false,
        })

        setTimeout(() => {
          if (!cancelled) driverRef.current?.drive()
        }, 500)
      } catch {
        completeOnboarding()
      }
    }

    const timer = setTimeout(init, 800)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (driverRef.current) {
        try { driverRef.current.destroy() } catch {}
        driverRef.current = null
      }
    }
  }, [showOnboarding, pathname, completeOnboarding, t])

  // Never render anything on server
  return null
}