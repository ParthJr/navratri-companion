import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useSuperAdmin } from './context/SuperAdminContext';
import { SuperAdminLogin } from './components/SuperAdminLogin';
import { SuperAdminSidebar } from './components/SuperAdminSidebar';
import { SuperAdminHeader } from './components/SuperAdminHeader';
import { ROLE_PERMISSIONS } from './types';

// Pages
import { OverviewTab } from './pages/OverviewTab';
import { BookingsTab } from './pages/BookingsTab';
import { CompletionTab } from './pages/CompletionTab';
import { UsersTab } from './pages/UsersTab';
import { PaymentApprovalsTab } from './pages/PaymentApprovalsTab';
import { CompanionsTab } from './pages/CompanionsTab';
import { ApplicationsTab } from './pages/ApplicationsTab';
import { PayoutsTab } from './pages/PayoutsTab';
import { PaymentsTab } from './pages/PaymentsTab';
import { ComplaintsTab } from './pages/ComplaintsTab';
import { SafetyTab } from './pages/SafetyTab';
import { PlatformFeesTab } from './pages/PlatformFeesTab';
import { RegistrationFeeTab } from './pages/RegistrationFeeTab';
import { CommissionTab } from './pages/CommissionTab';
import { PricingPackagesTab } from './pages/PricingPackagesTab';
import { CouponsTab } from './pages/CouponsTab';
import { NotificationsTab } from './pages/NotificationsTab';
import { AnalyticsTab } from './pages/AnalyticsTab';
import { AdminUsersTab } from './pages/AdminUsersTab';
import { AuditLogsTab } from './pages/AuditLogsTab';
import { SettingsTab } from './pages/SettingsTab';
import { UpiSettingsTab } from './pages/UpiSettingsTab';
import { LegalPoliciesTab } from './pages/LegalPoliciesTab';

interface SuperAdminAppProps {
  onExitToCustomerApp: () => void;
}

export const SuperAdminApp: React.FC<SuperAdminAppProps> = ({ onExitToCustomerApp }) => {
  const { isAuthenticated, activeTab, setActiveTab, currentAdmin, hasTabPermission } = useSuperAdmin();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Today');

  // If not logged in, show dedicated Super Admin login screen
  if (!isAuthenticated) {
    return <SuperAdminLogin onExitToCustomerApp={onExitToCustomerApp} />;
  }

  const isCurrentTabAllowed = hasTabPermission(activeTab);
  const currentRoleConfig = currentAdmin ? ROLE_PERMISSIONS[currentAdmin.role] : null;

  return (
    <div className="min-h-screen bg-[#0d0517] text-slate-100 flex flex-row overflow-x-hidden font-sans selection:bg-[#fd8a42]/30 selection:text-white">
      {/* Sidebar */}
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onExitToCustomerApp={onExitToCustomerApp}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onExitToCustomerApp={onExitToCustomerApp}
          dateFilter={dateFilter}
          onChangeDateFilter={(f) => setDateFilter(f)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {!isCurrentTabAllowed ? (
            <div className="bg-[#160b24] border border-red-500/30 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4 my-12 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Protected Admin Route</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access to module <span className="font-mono text-white font-semibold">/{activeTab}</span> is restricted by Role-Based Access Control (RBAC).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 max-w-md mx-auto">
                Logged in as: <strong className="text-white">{currentAdmin?.name}</strong> (<span className="text-[#fd8a42] font-semibold">{currentRoleConfig?.displayName || 'Admin'}</span>).
              </div>
              <div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Allowed Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab dateFilter={dateFilter} />}
              {activeTab === 'bookings' && <BookingsTab />}
              {activeTab === 'completion' && <CompletionTab />}
              {activeTab === 'users' && <UsersTab onExitToCustomerApp={onExitToCustomerApp} />}
              {activeTab === 'payment-approvals' && <PaymentApprovalsTab />}
              {activeTab === 'companions' && <CompanionsTab />}
              {activeTab === 'applications' && <ApplicationsTab />}
              {activeTab === 'payouts' && <PayoutsTab />}
              {activeTab === 'payments' && <PaymentsTab />}
              {activeTab === 'complaints' && <ComplaintsTab />}
              {activeTab === 'safety' && <SafetyTab />}
              {activeTab === 'platform-fees' && <PlatformFeesTab />}
              {activeTab === 'registration-fee' && <RegistrationFeeTab />}
              {activeTab === 'commissions' && <CommissionTab />}
              {activeTab === 'pricing-packages' && <PricingPackagesTab />}
              {activeTab === 'coupons' && <CouponsTab />}
              {activeTab === 'notifications' && <NotificationsTab mode="notifications" />}
              {activeTab === 'announcements' && <NotificationsTab mode="announcements" />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'admin-users' && <AdminUsersTab />}
              {activeTab === 'audit-logs' && <AuditLogsTab />}
              {activeTab === 'legal-policies' && <LegalPoliciesTab />}
              {activeTab === 'settings' && <SettingsTab />}
              {activeTab === 'upi-settings' && <UpiSettingsTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
