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
        const { driver } = await import('driver.js')
        await import('driver.js/dist/driver.css')

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

        // Small delay for DOM to settle
        setTimeout(() => {
          driverRef.current?.drive()
        }, 300)
      } catch {
        // driver.js not available, skip onboarding
        completeOnboarding()
      }
    }

    const timer = setTimeout(init, 600)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (driverRef.current) {
        driverRef.current.destroy()
        driverRef.current = null
      }
    }
  }, [showOnboarding, pathname, completeOnboarding, t])

  if (!showOnboarding || pathname !== '/') return null

  return null
}