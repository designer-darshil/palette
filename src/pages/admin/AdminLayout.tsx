import React, { useState } from 'react';
import {
  LayoutDashboard,
  Palette,
  Layers,
  Wand2,
  Sparkles,
  Grid,
  BookmarkCheck,
  FolderTree,
  Network,
  UploadCloud,
  CheckCircle2,
  Power,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { RouteType } from '../../types';
import { KromaButton } from '../../components/common/KromaButton';

interface AdminLayoutProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onNavigatePublic: (route: RouteType) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigateTab,
  onNavigatePublic,
  children,
}) => {
  const { currentUser, logout, isSuperAdmin } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  const { isActive: isMaintenanceActive } = useMaintenance();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'STUDIO',
      items: [
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'palettes', label: 'Palettes', icon: Layers },
        { id: 'patterns', label: 'Patterns', icon: Grid },
        { id: 'combos', label: 'Harmonies', icon: Wand2 },
        { id: 'gradients', label: 'Gradients', icon: Sparkles },
      ],
    },
    {
      label: 'CONTENT',
      items: [
        { id: 'collections', label: 'Collections', icon: BookmarkCheck },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'relationships', label: 'Relationships', icon: Network },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'import', label: 'Import', icon: UploadCloud },
        { id: 'validation', label: 'Data Health', icon: CheckCircle2 },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'maintenance', label: 'Maintenance', icon: Power },
        ...(isSuperAdmin
          ? [{ id: 'users', label: 'Staff & Roles', icon: ShieldCheck }]
          : []),
        { id: 'security', label: 'Security', icon: ShieldCheck },
      ],
    },
  ];

  const handleTabClick = (tabId: string) => {
    onNavigateTab(tabId);
    setMobileSidebarOpen(false);
  };

  // Find active item info for breadcrumb
  let activeLabel = 'Dashboard';
  let activeSection = 'OVERVIEW';
  for (const group of navGroups) {
    const found = group.items.find((i) => i.id === currentTab);
    if (found) {
      activeLabel = found.label;
      activeSection = group.label;
      break;
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-bg-canvas text-text-primary font-sans relative w-full lg:flex-row">
      {/* Mobile Top App Bar */}
      <header className="flex lg:hidden sticky top-0 z-[90] bg-surface-1 border-b border-border-subtle py-2.5 px-4 items-center justify-between w-full" aria-label="Admin Navigation Header">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle Navigation"
            className="w-8 h-8 flex items-center justify-center rounded-xs border border-border-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {mobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-text-primary">KROMA</span>
            <span className="text-xs font-medium text-text-tertiary tracking-wide">ADMIN</span>
          </div>
        </div>

        <KromaButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigatePublic({ path: 'home' })}
          iconLeft={<ArrowLeft size={13} />}
          className="!text-xs !py-1 !px-2.5"
        >
          Site
        </KromaButton>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[99] block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Rail */}
      <aside
        className={`w-[240px] bg-surface-1 border-r border-border-subtle flex flex-col justify-between p-4 flex-shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] h-[100dvh] sticky top-0 overflow-y-auto ${
          mobileSidebarOpen
            ? 'fixed inset-y-0 left-0 z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.5)] translate-x-0'
            : 'fixed -translate-x-full lg:static lg:translate-x-0'
        }`}
        aria-label="Admin Navigation"
      >
        <div className="flex flex-col">
          {/* Brand */}
          <div className="pb-5 mb-5 border-b border-border-subtle">
            <div className="text-base font-bold tracking-tight text-text-primary leading-none">KROMA</div>
            <div className="text-xs font-medium text-text-tertiary tracking-widest mt-0.5">ADMIN</div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex flex-col gap-5">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary px-2 mb-1.5 select-none">
                  {group.label}
                </div>
                <div className="flex flex-col gap-px">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    const isMaintenance = item.id === 'maintenance';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabClick(item.id)}
                        className={`group relative flex items-center justify-between pl-2.5 pr-2 py-[7px] rounded-xs text-[13px] transition-colors text-left ${
                          isActive
                            ? 'text-text-primary bg-surface-2 font-semibold'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                        }`}
                      >
                        {/* Active accent bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-kroma-red" />
                        )}

                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={16}
                            strokeWidth={isActive ? 2 : 1.75}
                            className={isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}
                          />
                          <span>{item.label}</span>
                        </div>

                        {/* Maintenance active indicator */}
                        {isMaintenance && isMaintenanceActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-kroma-red shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-border-subtle flex flex-col gap-3">
          {/* Theme Toggle */}
          <div className="flex bg-surface-2 p-0.5 rounded-xs gap-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-xs transition-colors ${
                theme === 'light'
                  ? 'bg-surface-1 text-text-primary shadow-sm font-medium'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Sun size={12} />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-surface-1 text-text-primary shadow-sm font-medium'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Moon size={12} />
              <span>Dark</span>
            </button>
          </div>

          {/* Account */}
          {currentUser && (
            <div className="text-xs text-text-secondary truncate px-0.5">
              {currentUser.email}
            </div>
          )}

          {/* Sign Out */}
          <KromaButton
            variant="outline"
            size="sm"
            onClick={logout}
            iconLeft={<LogOut size={13} />}
            className="!w-full !justify-center !text-xs !py-1.5 !min-h-[32px]"
          >
            Sign Out
          </KromaButton>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Workspace Header */}
        <header className="shrink-0 flex items-center justify-between px-6 lg:px-8 py-3 border-b border-border-subtle bg-surface-1/70 backdrop-blur-md z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>ADMIN</span>
            <span className="opacity-40">/</span>
            <span>{activeSection}</span>
            <span className="opacity-40">/</span>
            <span className="text-text-primary font-semibold">{activeLabel}</span>
          </div>

          {/* Header Action */}
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigatePublic({ path: 'home' })}
            iconLeft={<ArrowLeft size={13} />}
            className="!text-xs !py-1.5 !px-3 !min-h-[32px]"
          >
            Public Site
          </KromaButton>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-10 sm:p-6 sm:pb-12 bg-bg-canvas min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
