import { describe, it, expect, vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next-intl/server', () => ({
  getTranslations: () => (key: string) => key,
}))

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  redirect: vi.fn(),
}))

describe('i18n messages', () => {
  it('should have matching keys in fr.json and en.json', async () => {
    const fr = await import('../../messages/fr.json')
    const en = await import('../../messages/en.json')

    const frKeys = JSON.stringify(fr.default, Object.keys(fr.default).sort())
    const enKeys = JSON.stringify(en.default, Object.keys(en.default).sort())

    expect(frKeys).toBe(enKeys)
  })

  it('should have all required top-level sections', async () => {
    const fr = await import('../../messages/fr.json')
    const sections = ['Common', 'Login', 'Dashboard', 'Dossiers', 'Audiences', 'Documents', 'Users', 'Audit', 'Settings', 'Sidebar', 'Notifications', 'Onboarding']
    
    sections.forEach(section => {
      expect(fr.default).toHaveProperty(section)
    })
  })
})