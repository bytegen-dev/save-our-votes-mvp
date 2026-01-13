import { requireAuth } from '@/lib/auth/middleware';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarProvider } from '@/components/layout/sidebar-provider';
import { cookies } from 'next/headers';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get('sidebar-collapsed')?.value === 'true';

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div
          className="flex flex-1 flex-col overflow-y-auto transition-all duration-300 md:data-[sidebar-collapsed=true]:ml-16 md:data-[sidebar-collapsed=false]:ml-64"
          id="main-content"
          data-sidebar-collapsed={defaultCollapsed}
        >
          <Header session={session} />
          <main className="flex-1 bg-background container-max">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
