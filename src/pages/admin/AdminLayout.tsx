import React, { useState } from 'react';
import {
  LayoutDashboard,
  Palette,
  Layers,
  Wand2,
  Sparkles,
  FolderTree,
  Network,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  Power,
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

  const navItems = [
    { section: 'OVERVIEW', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      section: 'CONTENT LIBRARY',
      items: [
        { id: 'colors', label: 'Color Specimens', icon: Palette },
        { id: 'palettes', label: 'Palette Systems', icon: Layers },
        { id: 'combos', label: 'Harmonies / Combos', icon: Wand2 },
        { id: 'gradients', label: 'CSS Gradients', icon: Sparkles },
      ],
    },
    {
      section: 'ORGANIZATION',
      items: [
        { id: 'categories', label: 'Categories & Moods', icon: FolderTree },
        { id: 'relationships', label: 'Resource Network', icon: Network },
      ],
    },
    {
      section: 'DATA OPERATIONS',
      items: [
        { id: 'import', label: 'Batch Import (JSON/CSV)', icon: UploadCloud },
        { id: 'validation', label: 'Data Health & Audit', icon: CheckCircle2 },
      ],
    },
    {
      section: 'SYSTEM & SECURITY',
      items: [
        {
          id: 'maintenance',
          label: 'Maintenance Mode',
          icon: Power,
          badge: isMaintenanceActive ? 'ACTIVE' : undefined,
          statusDot: isMaintenanceActive ? '#EF4444' : maintenanceStatus === 'scheduled' ? '#F59E0B' : '#10B981',
        },
        ...(isSuperAdmin ? [{ id: 'users', label: 'User & Role Access', icon: ShieldCheck }] : []),
        { id: 'security', label: 'Security & Password', icon: ShieldCheck },
      ],
    },
  ];

  const handleTabClick = (tabId: string) => {
    onNavigateTab(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="admin-layout-wrapper">
      {/* Mobile Top App Bar */}
      <header className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KromaButton
            variant="outline"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle Admin Sidebar"
            className="!w-8 !h-8 !p-1"
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </KromaButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-glyph" style={{ width: 10, height: 10 }} />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.04em' }}>KROMA ADMIN</span>
          </div>
        </div>

        <KromaButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigatePublic({ path: 'home' })}
          title="Return to Public Library"
          iconLeft={<ArrowLeft size={13} />}
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Public
        </KromaButton>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-glyph" style={{ width: 10, height: 10 }} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em' }}>KROMA ADMIN</span>
            </div>

            <KromaButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigatePublic({ path: 'home' })}
              title="Return to Public Library"
              iconLeft={<ArrowLeft size={13} />}
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Public
            </KromaButton>
          </div>

          {/* User Badge */}
          {currentUser && (
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '10px',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.email}
              </div>
              <div style={{ display: 'inline-block', marginTop: '4px', background: 'rgba(230, 57, 70, 0.15)', color: '#E63946', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {navItems.map((group) => (
              <div key={group.section}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingLeft: '8px' }}>
                  {group.section}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <KromaButton
                        key={item.id}
                        variant={isActive ? 'filled' : 'ghost'}
                        size="sm"
                        onClick={() => handleTabClick(item.id)}
                        iconLeft={<Icon size={15} color={isActive ? '#E9C46A' : 'currentColor'} />}
                        className="!w-full !justify-start !text-left !px-2.5 !py-2 !text-[0.82rem] !rounded-[var(--radius-xs)] whitespace-nowrap"
                        style={{
                          background: isActive ? 'var(--bg-surface-3)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </KromaButton>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
          {/* Theme Quick Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-xs)', padding: '2px', gap: '2px' }}>
            <KromaButton
              variant={theme === 'light' ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => setTheme('light')}
              iconLeft={<Sun size={12} color={theme === 'light' ? 'currentColor' : '#E9C46A'} />}
              className="flex-1 !justify-center !py-1 !px-1.5 !text-[0.72rem] font-mono font-semibold !rounded-[2px]"
              style={{
                background: theme === 'light' ? 'var(--bg-surface-3)' : 'transparent',
                color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
              title="Light Theme"
            >
              Light
            </KromaButton>
            <KromaButton
              variant={theme === 'dark' ? 'filled' : 'ghost'}
              size="sm"
              onClick={() => setTheme('dark')}
              iconLeft={<Moon size={12} />}
              className="flex-1 !justify-center !py-1 !px-1.5 !text-[0.72rem] font-mono font-semibold !rounded-[2px]"
              style={{
                background: theme === 'dark' ? 'var(--bg-surface-3)' : 'transparent',
                color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
              title="Dark Theme"
            >
              Dark
            </KromaButton>
          </div>

          <KromaButton
            variant="outline"
            size="sm"
            onClick={logout}
            iconLeft={<LogOut size={13} />}
            className="!w-full !justify-center !text-[0.78rem] text-[var(--text-secondary)] whitespace-nowrap"
          >
            Sign Out
          </KromaButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-stage">
        {children}
      </main>
    </div>
  );
};
