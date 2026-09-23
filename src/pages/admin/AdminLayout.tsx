import React, { useState } from 'react';
import {
  LayoutDashboard,
  Palette,
  Layers,
  Sparkles,
  Wand2,
  FolderTree,
  Network,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Power,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  Grid,
  BookmarkCheck,
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
  const { isActive: isMaintenanceActive, status: maintenanceStatus } = useMaintenance();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, dotColor: '#FF3B30' },
      ],
    },
    {
      label: 'CONTENT',
      items: [
        { id: 'colors', label: 'Colors', icon: Palette, dotColor: '#34C759' },
        { id: 'palettes', label: 'Palettes', icon: Layers, dotColor: '#FFD60A' },
        { id: 'patterns', label: 'Patterns', icon: Grid, dotColor: '#00AEEF' },
        { id: 'collections', label: 'Collections', icon: BookmarkCheck, dotColor: '#7B2CBF' },
        { id: 'combos', label: 'Harmonies', icon: Wand2, dotColor: '#FF9500' },
        { id: 'gradients', label: 'Gradients', icon: Sparkles, dotColor: '#00AEEF' },
      ],
    },
    {
      label: 'TAXONOMY & NETWORK',
      items: [
        { id: 'categories', label: 'Categories', icon: FolderTree, dotColor: '#707070' },
        { id: 'relationships', label: 'Resource Network', icon: Network, dotColor: '#707070' },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'import', label: 'Batch Import', icon: UploadCloud, dotColor: '#707070' },
        { id: 'validation', label: 'Data Health', icon: CheckCircle2, dotColor: '#34C759' },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        {
          id: 'maintenance',
          label: 'Maintenance',
          icon: Power,
          dotColor: isMaintenanceActive ? '#FF3B30' : maintenanceStatus === 'scheduled' ? '#FF9500' : '#34C759',
          badge: isMaintenanceActive ? 'LOCK' : undefined,
        },
        ...(isSuperAdmin
          ? [{ id: 'users', label: 'Staff & Roles', icon: ShieldCheck, dotColor: '#707070' }]
          : []),
        { id: 'security', label: 'Security', icon: ShieldCheck, dotColor: '#707070' },
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
    <div className="admin-layout-wrapper">
      {/* Mobile Top App Bar */}
      <header className="admin-mobile-header" aria-label="Admin Navigation Header">
        <div className="flex items-center gap-2.5">
          <KromaButton
            variant="outline"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle Navigation Rail"
            className="!w-8 !h-8 !min-h-[32px] !p-1"
          >
            {mobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </KromaButton>
          <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
            <span>KROMA ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigatePublic({ path: 'home' })}
            iconLeft={<ArrowLeft size={13} />}
            className="!text-xs !py-1 !px-2.5"
          >
            Public
          </KromaButton>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Compact Studio Navigation Rail (240px) */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}
        aria-label="Studio Rail"
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] shrink-0" />
              <div>
                <div className="font-bold text-xs tracking-wider uppercase">KROMA</div>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF] tracking-widest">
                  OPERATIONS
                </div>
              </div>
            </div>

            <span className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF] px-1.5 py-0.5 rounded-xs border border-black/10 dark:border-white/10">
              v2.4
            </span>
          </div>

          {/* User Account Capsule */}
          {currentUser && (
            <div className="mb-4 p-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs">
              <div className="text-xs font-mono text-[#171717] dark:text-[#F8F8F8] truncate font-medium">
                {currentUser.email}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: currentUser.role === 'super_admin' ? '#FF3B30' : '#34C759' }}
                />
                <span className="text-xs font-mono uppercase tracking-wider text-[#707070] dark:text-[#9DA3AF]">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Groups */}
          <nav className="flex flex-col gap-4">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col">
                <div className="text-xs font-mono uppercase tracking-[0.12em] text-[#707070] dark:text-[#9DA3AF] px-2 mb-1 font-semibold">
                  {group.label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabClick(item.id)}
                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xs text-xs font-medium transition-colors text-left ${
                          isActive
                            ? 'text-[#171717] dark:text-[#F8F8F8] bg-black/[0.06] dark:bg-white/[0.08] font-semibold'
                            : 'text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        {/* Subtle Active Accent Rule */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full"
                            style={{ backgroundColor: item.dotColor }}
                          />
                        )}

                        <div className="flex items-center gap-2 pl-0.5">
                          <Icon size={14} className={isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="font-mono text-xs uppercase tracking-wider px-1 py-0.2 bg-[#FF3B30]/15 text-[#FF3B30] rounded-xs font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Studio Rail Bottom Utilities */}
        <div className="pt-3 mt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
          {/* Theme Quick Switcher */}
          <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-xs gap-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-xs font-mono rounded-xs transition-colors ${
                theme === 'light'
                  ? 'bg-white text-[#171717] shadow-xs font-semibold'
                  : 'text-[#707070] hover:text-[#171717]'
              }`}
            >
              <Sun size={11} />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-xs font-mono rounded-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-[#181A20] text-[#F8F8F8] shadow-xs font-semibold'
                  : 'text-[#9DA3AF] hover:text-[#F8F8F8]'
              }`}
            >
              <Moon size={11} />
              <span>Dark</span>
            </button>
          </div>

          {/* Sign Out Button */}
          <KromaButton
            variant="outline"
            size="sm"
            onClick={logout}
            iconLeft={<LogOut size={13} />}
            className="!w-full !justify-center !text-xs !py-1.5 !min-h-[32px] text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
          >
            Sign Out
          </KromaButton>
        </div>
      </aside>

      {/* Main Workspace Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Compact Workspace Header */}
        <header className="shrink-0 flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#111216]/70 backdrop-blur-md z-10">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
            <span>ADMIN</span>
            <span className="opacity-40">/</span>
            <span>{activeSection}</span>
            <span className="opacity-40">/</span>
            <span className="text-[#171717] dark:text-[#F8F8F8] font-semibold">{activeLabel}</span>
          </div>

          {/* Header Quick Actions & Telemetry */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xs font-mono text-xs">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isMaintenanceActive ? '#FF3B30' : '#34C759' }}
              />
              <span className="text-[#707070] dark:text-[#9DA3AF]">
                {isMaintenanceActive ? 'LOCKDOWN' : 'SYSTEM ONLINE'}
              </span>
            </div>

            {/* Public Link */}
            <KromaButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigatePublic({ path: 'home' })}
              iconLeft={<ArrowLeft size={13} />}
              className="!text-xs !py-1.5 !px-3 !min-h-[32px] text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
            >
              Public Library
            </KromaButton>
          </div>
        </header>

        {/* Scrollable Stage Content */}
        <main className="admin-main-stage">
          {children}
        </main>
      </div>
    </div>
  );
};
