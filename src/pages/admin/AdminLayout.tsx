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
  Monitor,
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RouteType } from '../../types';

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
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle Admin Sidebar"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-glyph" style={{ width: 10, height: 10 }} />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.04em' }}>KROMA ADMIN</span>
          </div>
        </div>

        <button
          onClick={() => onNavigatePublic({ path: 'home' })}
          title="Return to Public Library"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <ArrowLeft size={13} />
          <span>Public</span>
        </button>
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

            <button
              onClick={() => onNavigatePublic({ path: 'home' })}
              title="Return to Public Library"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <ArrowLeft size={13} />
              <span>Public</span>
            </button>
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
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: 'none',
                          background: isActive ? 'var(--bg-surface-3)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'background 120ms ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Icon size={15} color={isActive ? '#E9C46A' : 'currentColor'} />
                        <span>{item.label}</span>
                      </button>
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
          <div style={{ display: 'flex', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-xs)', padding: '2px' }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1,
                border: 'none',
                background: theme === 'light' ? 'var(--bg-surface-3)' : 'transparent',
                color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: '4px',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              title="Light Theme"
            >
              <Sun size={12} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1,
                border: 'none',
                background: theme === 'dark' ? 'var(--bg-surface-3)' : 'transparent',
                color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: '4px',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              title="Dark Theme"
            >
              <Moon size={12} />
            </button>
            <button
              onClick={() => setTheme('system')}
              style={{
                flex: 1,
                border: 'none',
                background: theme === 'system' ? 'var(--bg-surface-3)' : 'transparent',
                color: theme === 'system' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: '4px',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              title="System Theme"
            >
              <Monitor size={12} />
            </button>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-stage">
        {children}
      </main>
    </div>
  );
};
