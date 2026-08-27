import React, { useState } from 'react';
import { RouteType } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminColorsPage } from './AdminColorsPage';
import { AdminPalettesPage } from './AdminPalettesPage';
import { AdminCombosPage } from './AdminCombosPage';
import { AdminGradientsPage } from './AdminGradientsPage';
import { AdminCategoriesPage } from './AdminCategoriesPage';
import { AdminRelationshipsPage } from './AdminRelationshipsPage';
import { AdminImportPage } from './AdminImportPage';
import { AdminValidationPage } from './AdminValidationPage';
import { AdminSecurityPage } from './AdminSecurityPage';
import { AdminUsersPage } from './AdminUsersPage';
import { SEOHead } from '../../components/seo/SEOHead';

interface AdminHubPageProps {
  onNavigatePublic: (route: RouteType) => void;
}

export const AdminHubPage: React.FC<AdminHubPageProps> = ({ onNavigatePublic }) => {
  const { isAuthenticated } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return (
      <AdminLoginPage
        onNavigatePublic={onNavigatePublic}
        onLoginSuccess={() => setCurrentTab('dashboard')}
      />
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <AdminDashboardPage onNavigateTab={setCurrentTab} />;
      case 'colors':
        return <AdminColorsPage />;
      case 'palettes':
        return <AdminPalettesPage />;
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
      default:
        return <AdminDashboardPage onNavigateTab={setCurrentTab} />;
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
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        onNavigatePublic={onNavigatePublic}
      >
        {renderTabContent()}
      </AdminLayout>
    </>
  );
};

