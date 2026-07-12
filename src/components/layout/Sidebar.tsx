'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { Home, FolderOpen, Calendar, FileText, Users, Settings, ShieldCheck, X, Menu, ChevronLeft, Sun, Moon, HelpCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslations } from 'next-intl';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';

// Context
type SidebarContextType = {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleMobile: () => void;
  toggleCollapse: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isCollapsed: false,
  toggleMobile: () => {},
  toggleCollapse: () => {},
  closeMobile: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// Navigation items
const navItems = [
  { href: '/', labelKey: 'dashboard', icon: Home, onboardingId: 'sidebar-dashboard' },
  { href: '/dossiers', labelKey: 'dossiers', icon: FolderOpen, onboardingId: 'sidebar-dossiers' },
  { href: '/audiences', labelKey: 'audiences', icon: Calendar, onboardingId: 'sidebar-audiences' },
  { href: '/documents', labelKey: 'documents', icon: FileText, onboardingId: 'sidebar-documents' },
  { href: '/utilisateurs', labelKey: 'users', icon: Users, onboardingId: null },
];

const bottomItems = [
  { href: '/audit', labelKey: 'audit', icon: ShieldCheck, danger: true, onboardingId: null },
  { href: '/parametres', labelKey: 'settings', icon: Settings, onboardingId: null },
];

// Provider
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobile = useCallback(() => setIsOpen(p => !p), []);
  const toggleCollapse = useCallback(() => setIsCollapsed(p => !p), []);
  const closeMobile = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, toggleMobile, toggleCollapse, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Toggle button for the header
export function SidebarToggle() {
  const { toggleMobile } = useSidebar();
  return (
    <button
      onClick={toggleMobile}
      className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 lg:hidden"
      aria-label="Menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

// Main Sidebar
export default function Sidebar() {
  const { isOpen, isCollapsed, toggleMobile, toggleCollapse, closeMobile } = useSidebar();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('Sidebar');
  const { startOnboarding } = useOnboarding();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-primary text-white flex flex-col shadow-xl
          transition-all duration-300 ease-in-out
          /* Desktop */
          lg:static lg:z-auto
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          /* Mobile */
          ${isOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-onboarding="sidebar-nav"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 min-h-[72px]">
          {!isCollapsed || isOpen ? (
            <h1 className="text-xl font-bold tracking-wider text-secondary">
              LEGALYX<span className="text-white text-sm font-light ml-1">CMS</span>
            </h1>
          ) : (
            <h1 className="text-lg font-bold text-secondary mx-auto">L</h1>
          )}
          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isCollapsed ? t('expand') : t('collapse')}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            {/* Mobile close */}
            <button
              onClick={closeMobile}
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed && !isOpen ? t(item.labelKey) : undefined}
                aria-current={active ? 'page' : undefined}
                data-onboarding={item.onboardingId || undefined}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative group
                  ${active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'hover:bg-white/10 text-white/80'
                  }
                  ${isCollapsed && !isOpen ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${active ? 'text-secondary' : 'text-secondary/70'}`} />
                {(!isCollapsed || isOpen) && <span className="text-sm">{t(item.labelKey)}</span>}
                {/* Active indicator */}
                {active && isCollapsed && !isOpen && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-full" />
                )}
                {/* Tooltip for collapsed desktop */}
                {isCollapsed && !isOpen && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {t(item.labelKey)}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider + Bottom Items */}
          <div className="pt-4 mt-4 border-t border-white/10">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  title={isCollapsed && !isOpen ? t(item.labelKey) : undefined}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative group mb-1
                    ${item.danger
                      ? active
                        ? 'bg-red-900/40 text-red-100'
                        : 'hover:bg-red-900/20 text-red-200/70'
                      : active
                        ? 'bg-white/15 text-white'
                        : 'hover:bg-white/10 text-white/80'
                    }
                    ${isCollapsed && !isOpen ? 'justify-center' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${item.danger ? 'text-red-400' : active ? 'text-secondary' : 'text-secondary/70'}`} />
                  {(!isCollapsed || isOpen) && (
                    <span className={`text-sm ${item.danger ? 'font-medium' : ''}`}>{t(item.labelKey)}</span>
                  )}
                  {isCollapsed && !isOpen && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {t(item.labelKey)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 w-full"
            aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            title={isCollapsed ? (theme === 'dark' ? t('lightMode') : t('darkMode')) : undefined}
            data-onboarding="theme-toggle"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 shrink-0 text-secondary" />
            ) : (
              <Moon className="w-5 h-5 shrink-0 text-secondary/70" />
            )}
            {!isCollapsed && <span className="text-sm text-white/80">
              {theme === 'dark' ? t('lightMode') : t('darkMode')}
            </span>}
          </button>

          {/* Help / Restart onboarding */}
          {!isCollapsed && (
            <button
              onClick={startOnboarding}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 w-full text-white/50 hover:text-white/70"
              aria-label="Guide"
            >
              <HelpCircle className="w-5 h-5 shrink-0" />
              <span className="text-xs">Guide</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}