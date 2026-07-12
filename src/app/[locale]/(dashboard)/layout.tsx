import Sidebar, { SidebarProvider } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userRole: string | null = null;
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase.rpc('get_my_profile_json');
    userRole = profile?.role || null;
  } catch {
    // Fallback: show all items if role can't be determined
  }

  return (
    <SidebarProvider userRole={userRole}>
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
  );
}