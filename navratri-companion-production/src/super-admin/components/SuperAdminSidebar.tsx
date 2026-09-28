import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  FileCheck2,
  Wallet,
  CreditCard,
  AlertCircle,
  ShieldAlert,
  Percent,
  Coins,
  Package,
  Ticket,
  MapPin,
  Building2,
  Bell,
  Megaphone,
  BarChart3,
  TrendingUp,
  Shield,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  QrCode,
  ShieldCheck,
  Key,
  Scale,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { SuperAdminTab, ROLE_PERMISSIONS } from '../types';

interface SuperAdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onExitToCustomerApp: () => void;
}

interface NavItem {
  id: SuperAdminTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onExitToCustomerApp,
}) => {
  const {
    activeTab,
    setActiveTab,
    currentAdmin,
    logout,
    hasTabPermission,
    applicants,
    complaints,
    safetyIncidents,
    payouts,
    customers,
  } = useSuperAdmin();

  const pendingAppsCount = applicants.filter((a) => a.status === 'pending_review').length;
  const openComplaintsCount = complaints.filter((c) => c.status === 'open' || c.status === 'investigating').length;
  const activeSosCount = safetyIncidents.filter((s) => s.status === 'active').length;
  const pendingPayoutsCount = payouts.filter((p) => p.status === 'pending').length;

  // Calculate pending payment approvals: strictly query records where payment has been submitted for approval
  const pendingPaymentApprovalsCount = customers.filter(
    (c) => c.paymentStatus === 'Pending Verification'
  ).length;

  const sections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'users', label: 'Users', icon: Users },
        {
          id: 'payment-approvals',
          label: 'Payment Approvals',
          icon: ShieldCheck,
          badge: pendingPaymentApprovalsCount > 0 ? pendingPaymentApprovalsCount : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold',
        },
        { id: 'companions', label: 'Companions', icon: UserCheck },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'completion', label: 'Completion Management', icon: Key },
        {
          id: 'applications',
          label: 'Applications',
          icon: FileCheck2,
          badge: pendingAppsCount > 0 ? pendingAppsCount : undefined,
          badgeColor: 'bg-[#fd8a42] text-white',
        },
        {
          id: 'complaints',
          label: 'Complaints',
          icon: AlertCircle,
          badge: openComplaintsCount > 0 ? openComplaintsCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'safety',
          label: 'Safety',
          icon: ShieldAlert,
          badge: activeSosCount > 0 ? 'ALERT' : undefined,
          badgeColor: 'bg-red-500 text-white animate-pulse',
        },
      ],
    },
    {
      title: 'FINANCE & PAYMENTS',
      items: [
        { id: 'payments', label: 'Payments', icon: CreditCard },
        {
          id: 'payouts',
          label: 'Payouts',
          icon: Wallet,
          badge: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
          badgeColor: 'bg-emerald-500 text-white',
        },
        { id: 'upi-settings', label: 'UPI Settings', icon: QrCode },
        { id: 'platform-fees', label: 'Platform Fees', icon: Percent },
        { id: 'pricing-packages', label: 'Pricing', icon: Package },
        { id: 'commissions', label: 'Commissions', icon: TrendingUp },
        { id: 'registration-fee', label: 'Registration Fee', icon: Coins },
        { id: 'coupons', label: 'Coupons', icon: Ticket },
      ],
    },
    {
      title: 'COMMUNICATION & ANALYTICS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'admin-users', label: 'Admin Users', icon: ShieldCheck },
        { id: 'roles-permissions', label: 'Roles & Permissions', icon: Shield },
        { id: 'legal-policies', label: 'Legal & Policies', icon: Scale },
        { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
        { id: 'settings', label: 'Platform Settings', icon: Settings },
      ],
    },
  ];

  const handleSelectTab = (tab: SuperAdminTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#12081f] text-slate-300 border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fd8a42] to-[#c9184a] flex items-center justify-center shadow-md shadow-[#fd8a42]/20 shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-sm tracking-wide text-white block truncate">
                NAVRATRI COMPANION
              </span>
              <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider block truncate">
                PLATFORM OPERATIONS
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white items-center justify-center transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Overview / Platform Operations Dashboard Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => handleSelectTab('overview')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white shadow-lg shadow-[#fd8a42]/20'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
          title="Platform Operations Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">Operations Dashboard</span>}
        </button>
      </div>

      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 custom-scrollbar">
        {sections
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => hasTabPermission(item.id)),
          }))
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#fd8a42]' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {item.badge && !collapsed && (
                      <span
                        className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.badgeColor || 'bg-slate-700 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#fd8a42] rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
      </div>

      {/* Bottom Switcher & Admin User Info */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-2 bg-[#0d0517]">
        {/* Quick exit to customer app */}
        <button
          onClick={onExitToCustomerApp}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          title="Exit to Customer Marketplace"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-[#fd8a42]" />
          {!collapsed && <span>Exit to Marketplace</span>}
        </button>

        {/* Current Admin Profile & Logout */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#fd8a42]/20 border border-[#fd8a42]/30 flex items-center justify-center text-xs font-bold text-[#fd8a42] shrink-0">
              {currentAdmin?.name.charAt(0) || 'A'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentAdmin?.name || 'Super Admin'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#fd8a42] font-semibold truncate capitalize">
                    {ROLE_PERMISSIONS[currentAdmin?.role || 'super_admin']?.displayName || 'Admin'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">@{currentAdmin?.adminId}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Logout Platform Operations"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Logout Platform Operations</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 transition-all duration-200 z-30 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
