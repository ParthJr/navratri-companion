import React, { useState } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  Flame,
  LogOut,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { SuperAdminTab, ROLE_PERMISSIONS } from '../types';

interface SuperAdminHeaderProps {
  onOpenMobileSidebar: () => void;
  onExitToCustomerApp: () => void;
  dateFilter: string;
  onChangeDateFilter: (filter: string) => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({
  onOpenMobileSidebar,
  onExitToCustomerApp,
  dateFilter,
  onChangeDateFilter,
}) => {
  const { activeTab, setActiveTab, currentAdmin, logout, safetyIncidents, complaints, applicants, platformFeeConfig } = useSuperAdmin();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dateFilterOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Custom Range',
  ];

  const getTabTitle = (tab: SuperAdminTab) => {
    switch (tab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'bookings':
        return 'Booking Management';
      case 'completion':
        return 'Completion Management & OTP';
      case 'users':
        return 'Customer / User Management';
      case 'companions':
        return 'Companion Directory';
      case 'applications':
        return 'Host Applications & KYC';
      case 'payouts':
        return 'Companion Payouts & Escrow';
      case 'payments':
        return 'Payments & Transactions';
      case 'complaints':
        return 'Complaints & Disputes';
      case 'safety':
        return 'Safety & Emergency SOS';
      case 'platform-fees':
        return 'Platform Fee Settings';
      case 'registration-fee':
        return 'Companion Registration Fee';
      case 'commissions':
        return 'Commission Management';
      case 'pricing-packages':
        return 'Pricing & Package Tiers';
      case 'coupons':
        return 'Coupons & Promo Codes';
      case 'notifications':
        return 'System Notifications';
      case 'announcements':
        return 'Broadcast Announcements';
      case 'analytics':
        return 'Revenue & Market Analytics';
      case 'admin-users':
        return 'Admin Users & RBAC Permissions';
      case 'audit-logs':
        return 'Security Audit Trail';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'Super Admin';
    }
  };

  const activeAlerts = [
    ...safetyIncidents.filter((s) => s.status === 'active').map((s) => ({
      title: `Active SOS Alert: ${s.venue}`,
      desc: `${s.guestName} & ${s.companionName} (${s.emergencyOfficer})`,
      type: 'sos' as const,
      time: s.timestamp,
    })),
    ...complaints.filter((c) => c.status === 'open').map((c) => ({
      title: `Open Complaint: ${c.subject}`,
      desc: `Filed by ${c.reporterName} (${c.category})`,
      type: 'complaint' as const,
      time: c.createdAt,
    })),
    ...applicants.filter((a) => a.status === 'pending_review').map((a) => ({
      title: `New Host Application: ${a.name}`,
      desc: `${a.city} • ${a.garbaStyle}`,
      type: 'app' as const,
      time: a.appliedAt,
    })),
  ];

  return (
    <header className="sticky top-0 z-20 bg-[#12081f]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {getTabTitle(activeTab)}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Platform
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-400">
            Navratri Companion • Operational Control Console
          </p>
        </div>
      </div>

      {/* Right: Actions, Filters, Notifications, Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Date Filter */}
        <div className="relative hidden xl:flex items-center">
          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={dateFilter}
            onChange={(e) => onChangeDateFilter(e.target.value)}
            className="bg-[#1e1030] text-xs text-slate-200 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-[#fd8a42] appearance-none cursor-pointer hover:bg-[#281540] transition-colors"
          >
            {dateFilterOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#12081f] text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Fee Tag Preview */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
          <span className="text-slate-400">Fee:</span>
          <span className="font-semibold text-[#fd8a42]">
            {platformFeeConfig.feeType === 'percentage'
              ? `${platformFeeConfig.percentageRate}%`
              : `₹${platformFeeConfig.fixedFee} Fixed`}
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fd8a42] ring-2 ring-[#12081f]" />
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#1a0f2b] border border-white/15 shadow-2xl p-4 text-xs z-50 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="font-bold text-white text-sm">Real-time Platform Alerts</span>
                <button
                  onClick={() => setShowNotifPopover(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
                {activeAlerts.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No active operational alerts.</p>
                ) : (
                  activeAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate">{alert.title}</span>
                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{alert.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Admin Role & Logout */}
        {currentAdmin && (
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right">
              <span className="text-xs font-semibold text-white block truncate max-w-[130px]">
                {currentAdmin.name}
              </span>
              <span className="text-[10px] text-[#fd8a42] font-semibold block capitalize truncate max-w-[130px]">
                {ROLE_PERMISSIONS[currentAdmin.role]?.displayName || 'Admin'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Logout Platform Operations"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Exit to Customer App Button */}
        <button
          onClick={onExitToCustomerApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#fd8a42]/20 to-[#c9184a]/20 border border-[#fd8a42]/30 text-white hover:bg-[#fd8a42]/30 text-xs font-semibold transition-all shadow-sm"
          title="Switch to Customer Facing App"
        >
          <span>Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#fd8a42]" />
        </button>
      </div>
    </header>
  );
};
