'use client';

import { useAppStore, type ViewType } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Gift,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; view: ViewType }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'admin-dashboard' },
  { icon: Users, label: 'Leads', view: 'admin-leads' },
  { icon: BookOpen, label: 'Referência Comercial', view: 'admin-reference' },
  { icon: Gift, label: 'Regras de Oferta', view: 'admin-offer-rules' },
  { icon: Shield, label: 'Política de Privacidade', view: 'admin-privacy' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { currentView, adminName, setView, logout, sidebarOpen, setSidebarOpen } = useAppStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        )}
      >
        <div className="flex items-center justify-between p-4 h-16">
          <div className={cn('flex items-center gap-2', !sidebarOpen && 'lg:justify-center')}>
            <Image src="/logo-cme.png" alt="CME" width={32} height={32} className="h-8 w-auto flex-shrink-0" />
            {sidebarOpen && <span className="font-bold text-sm">CME INTELIGENTE</span>}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <ChevronLeft className={cn('w-4 h-4 transition-transform', !sidebarOpen && 'rotate-180')} />
          </button>
        </div>

        <Separator className="bg-sidebar-border" />

        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => { setView(item.view); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        <div className="p-3">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {adminName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{adminName}</p>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sidebar-accent text-sidebar-accent-foreground">
                    Admin
                  </Badge>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-lg hover:bg-sidebar-accent/50" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold">
                {adminName?.charAt(0) || 'A'}
              </div>
              <button onClick={handleLogout} className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-lg hover:bg-sidebar-accent/50" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold">
              {NAV_ITEMS.find((n) => n.view === currentView)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="text-muted-foreground text-xs">
              Ver Site
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
