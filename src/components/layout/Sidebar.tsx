'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { Home, FolderOpen, Calendar, FileText, Users, Settings, ShieldCheck, X, Menu, ChevronLeft } from 'lucide-react';

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
  { href: '/', label: 'Tableau de bord', icon: Home },
  { href: '/dossiers', label: 'Dossiers', icon: FolderOpen },
  { href: '/audiences', label: 'Audiences', icon: Calendar },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/utilisateurs', label: 'Utilisateurs', icon: Users },
];

const bottomItems = [
  { href: '/audit', label: "Journal d'Audit", icon: ShieldCheck, danger: true },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
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
              aria-label={isCollapsed ? 'Développer' : 'Réduire'}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            {/* Mobile close */}
            <button
              onClick={closeMobile}
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
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
                title={isCollapsed && !isOpen ? item.label : undefined}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-colors relative group
                  ${active
                    ? 'bg-white/15 text-white'
                    : 'hover:bg-white/10 text-white/80'
                  }
                  ${isCollapsed && !isOpen ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-secondary' : 'text-secondary/70'}`} />
                {(!isCollapsed || isOpen) && <span className="text-sm">{item.label}</span>}
                {/* Tooltip for collapsed desktop */}
                {isCollapsed && !isOpen && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider + Audit */}
          <div className="pt-4 mt-4 border-t border-white/10">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  title={isCollapsed && !isOpen ? item.label : undefined}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl transition-colors relative group mb-1
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
                  <Icon className={`w-5 h-5 shrink-0 ${item.danger ? 'text-red-400' : active ? 'text-secondary' : 'text-secondary/70'}`} />
                  {(!isCollapsed || isOpen) && (
                    <span className={`text-sm ${item.danger ? 'font-medium' : ''}`}>{item.label}</span>
                  )}
                  {isCollapsed && !isOpen && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}