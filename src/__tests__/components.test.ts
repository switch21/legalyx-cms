import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}))

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

vi.mock('@/components/onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({ showOnboarding: false, startOnboarding: vi.fn(), completeOnboarding: vi.fn(), currentStep: 0, setCurrentStep: vi.fn() }),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

vi.mock('driver.js', () => ({
  driver: () => ({ drive: vi.fn(), destroy: vi.fn() }),
}))

describe('Pagination component', () => {
  it('should not render when total pages is 1', async () => {
    const Pagination = (await import('@/components/ui/Pagination')).default
    const { container } = render(<Pagination total={10} currentPage={1} limit={20} />)
    expect(container.innerHTML).toBe('')
  })

  it('should render page numbers when total exceeds limit', async () => {
    const Pagination = (await import('@/components/ui/Pagination')).default
    render(<Pagination total={50} currentPage={1} limit={10} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

describe('SearchBar component', () => {
  it('should render with placeholder', async () => {
    const SearchBar = (await import('@/components/ui/SearchBar')).default
    render(<SearchBar placeholder="Test placeholder" />)
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })
})