import Sidebar, { SidebarProvider, SidebarToggle } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';
import { NotificationProvider } from '@/components/NotificationProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SidebarProvider>
          <OnboardingProvider>
            <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-8">
                  {children}
                </main>
              </div>
            </div>
            <OnboardingOverlay />
          </OnboardingProvider>
        </SidebarProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}