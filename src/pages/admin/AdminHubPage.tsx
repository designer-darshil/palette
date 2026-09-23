import React, { useEffect } from 'react';
import { RouteType } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminColorsPage } from './AdminColorsPage';
import { AdminPalettesPage } from './AdminPalettesPage';
import { AdminPatternsPage } from './AdminPatternsPage';
import { AdminCollectionsPage } from './AdminCollectionsPage';
import { AdminCombosPage } from './AdminCombosPage';
import { AdminGradientsPage } from './AdminGradientsPage';
import { AdminCategoriesPage } from './AdminCategoriesPage';
import { AdminRelationshipsPage } from './AdminRelationshipsPage';
import { AdminImportPage } from './AdminImportPage';
import { AdminValidationPage } from './AdminValidationPage';
import { AdminSecurityPage } from './AdminSecurityPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminMaintenancePage } from './AdminMaintenancePage';
import { SEOHead } from '../../components/seo/SEOHead';

interface AdminHubPageProps {
  currentTab?: string;
  onNavigateAdmin?: (tab: string) => void;
  onNavigatePublic: (route: RouteType) => void;
}

export const AdminHubPage: React.FC<AdminHubPageProps> = ({
  currentTab = 'dashboard',
  onNavigateAdmin,
  onNavigatePublic,
}) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Normalize effective tab (any obsolete signup/register paths normalize to dashboard)
  const isSpecialAuthTab = currentTab === 'login' || currentTab === 'signup' || currentTab === 'register' || currentTab === 'create-account';
  const effectiveTab = isSpecialAuthTab ? 'dashboard' : currentTab;

  // If user is already authenticated and hits /admin/login or signup directly, redirect them to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && isSpecialAuthTab && onNavigateAdmin) {
      onNavigateAdmin('dashboard');
    }
  }, [isLoading, isAuthenticated, isSpecialAuthTab, onNavigateAdmin]);

  // Auth session initialization state: prevent premature login redirects or flashes
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-[#F8F8F8] dark:bg-[#090A0C] text-[#171717] dark:text-[#F8F8F8] font-mono text-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-pulse" />
          <span className="font-bold tracking-widest uppercase">KROMA OPERATIONS</span>
        </div>
        <div className="text-[#707070] dark:text-[#9DA3AF]">
          Verifying administrative cryptographic session...
        </div>
      </div>
    );
  }

  // Unauthenticated: Render dedicated Login form preserving target admin route
  if (!isAuthenticated) {
    const rawReturn = currentTab && !isSpecialAuthTab ? currentTab : 'dashboard';
    return (
      <AdminLoginPage
        returnTab={rawReturn}
        onNavigatePublic={onNavigatePublic}
        onLoginSuccess={(targetTab) => {
          const destination = targetTab && !['login', 'signup', 'register', 'create-account'].includes(targetTab) ? targetTab : 'dashboard';
          if (onNavigateAdmin) {
            onNavigateAdmin(destination);
          }
        }}
      />
    );
  }

  const handleNavigateTab = (tabId: string) => {
    if (onNavigateAdmin) {
      onNavigateAdmin(tabId);
    }
  };

  const renderTabContent = () => {
    switch (effectiveTab) {
      case 'dashboard':
        return <AdminDashboardPage onNavigateTab={handleNavigateTab} />;
      case 'colors':
        return <AdminColorsPage />;
      case 'palettes':
        return <AdminPalettesPage />;
      case 'patterns':
        return <AdminPatternsPage />;
      case 'collections':
        return <AdminCollectionsPage />;
      case 'combos':
        return <AdminCombosPage />;
      case 'gradients':
        return <AdminGradientsPage />;
      case 'categories':
        return <AdminCategoriesPage />;
      case 'relationships':
        return <AdminRelationshipsPage />;
      case 'import':
        return <AdminImportPage />;
      case 'validation':
        return <AdminValidationPage />;
      case 'users':
        return <AdminUsersPage />;
      case 'security':
        return <AdminSecurityPage />;
      case 'maintenance':
        return <AdminMaintenancePage />;
      default:
        return <AdminDashboardPage onNavigateTab={handleNavigateTab} />;
    }
  };

  return (
    <>
      <SEOHead
        title="Admin Control Hub | KROMA"
        description="Restricted administration center for curated library taxonomy and asset management."
        canonicalPath="/admin"
        noindex={true}
        nofollow={true}
      />
      <AdminLayout
        currentTab={effectiveTab}
        onNavigateTab={handleNavigateTab}
        onNavigatePublic={onNavigatePublic}
      >
        {renderTabContent()}
      </AdminLayout>
    </>
  );
};
