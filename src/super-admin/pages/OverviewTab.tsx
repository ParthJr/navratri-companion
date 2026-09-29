import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Users,
  UserCheck,
  ShieldAlert,
  Wallet,
  Coins,
  Percent,
  ArrowUpRight,
  FileCheck2,
  AlertTriangle,
  Flame,
  ChevronRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

interface OverviewTabProps {
  dateFilter: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ dateFilter }) => {
  const {
    bookings,
    customers,
    companions,
    applicants,
    payouts,
    payments,
    complaints,
    safetyIncidents,
    platformFeeConfig,
    registrationFeeConfig,
    setActiveTab,
    getTotalRevenue,
    getRegistrationRevenue,
    getBookingFeeRevenue,
    getGMV,
    getTotalUsers,
    getActiveUsers,
    getTotalCompanions,
    getPendingApplications,
    getActiveBookings,
    getCompletedBookings,
    getCancelledBookings,
    getOpenComplaints,
    getSafetyIncidents,
  } = useSuperAdmin();

  // Metrics Calculations directly from context functions
  const totalRevenue = getTotalRevenue();
  const registrationRevenue = getRegistrationRevenue();
  const bookingFeeRevenue = getBookingFeeRevenue();
  const gmv = getGMV();

  const totalUsers = getTotalUsers();
  const activeUsers = getActiveUsers();
  const verifiedUsers = customers.filter((c) => c.idVerified || c.paymentStatus === 'Approved').length;

  const totalCompanionsCount = getTotalCompanions();
  const pendingAppsCount = getPendingApplications();

  const totalBookingsCount = bookings.length;
  const activeBookingsCount = getActiveBookings();
  const completedBookingsCount = getCompletedBookings();
  const cancelledBookingsCount = getCancelledBookings();

  const openComplaintsCount = getOpenComplaints();
  const safetyIncidentsCount = getSafetyIncidents();
  const emergencySosActive = safetyIncidents.filter((s) => s.status === 'active' || s.status === 'police_dispatched').length;

  const pendingPayoutsAmount = payouts
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.netPayoutDue, 0);

  // Group real completed payments or bookings by date for charts/tables
  const completedTxns = payments.filter((p) => p.status === 'paid');

  const regFeeShare = totalRevenue > 0 ? Math.round((registrationRevenue / totalRevenue) * 100) : 0;
  const bookingFeeShare = totalRevenue > 0 ? Math.round((bookingFeeRevenue / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Platform Banner Alert if active SOS emergency */}
      {emergencySosActive > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-300 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div>
              <p className="font-bold text-white text-sm">Emergency Alert Active</p>
              <p className="text-xs">{emergencySosActive} active SOS alert in progress.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('safety')}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md"
          >
            Open Safety Desk
          </button>
        </div>
      )}

      {/* 1. REVENUE METRICS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Revenue & Financial Metrics ({dateFilter})
          </h2>
          <span className="text-xs text-[#fd8a42] font-semibold">Live Operational Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400 font-medium">Total Platform Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Registration + Booking Platform Fees
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400 font-medium">Registration Fees (₹{registrationFeeConfig.amount})</span>
              <div className="w-8 h-8 rounded-xl bg-[#fd8a42]/10 border border-[#fd8a42]/30 flex items-center justify-center text-[#fd8a42]">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{registrationRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              From user registration payments
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400 font-medium">Booking Platform Fees</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{bookingFeeRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Current Fee: {platformFeeConfig.feeType === 'percentage' ? `${platformFeeConfig.percentageRate}%` : `₹${platformFeeConfig.fixedFee}/booking`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400 font-medium">Gross Merchandise Value (GMV)</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{gmv.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Total booking value generated
            </p>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marketplace */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Marketplace Bookings</span>
            <Calendar className="w-4 h-4 text-[#fd8a42]" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalBookingsCount === 0 ? '0 Bookings' : `${totalBookingsCount} Bookings`}
          </div>
          <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1 border-t border-white/5">
            {totalBookingsCount === 0 ? (
              <span className="text-slate-500">No booking data yet</span>
            ) : (
              <>
                <span className="text-emerald-400">{activeBookingsCount} Active</span>
                <span>•</span>
                <span className="text-blue-400">{completedBookingsCount} Completed</span>
                <span>•</span>
                <span className="text-red-400">{cancelledBookingsCount} Cancelled</span>
              </>
            )}
          </div>
        </div>

        {/* Users */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Registered Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalUsers === 0 ? '0 Users' : `${totalUsers} Users`}
          </div>
          <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1 border-t border-white/5">
            {totalUsers === 0 ? (
              <span className="text-slate-500">No registered users yet</span>
            ) : (
              <>
                <span className="text-emerald-400">{activeUsers} Active</span>
                <span>•</span>
                <span className="text-purple-400">{verifiedUsers} Verified</span>
              </>
            )}
          </div>
        </div>

        {/* Companions */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Approved Companions</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalCompanionsCount === 0 ? '0 Companions' : `${totalCompanionsCount} Verified`}
          </div>
          <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1 border-t border-white/5">
            {pendingAppsCount === 0 ? (
              <span className="text-slate-500">No pending applications</span>
            ) : (
              <span className="text-amber-400">{pendingAppsCount} Applications Pending</span>
            )}
          </div>
        </div>

        {/* Safety Desk */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Safety &amp; Complaints</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {emergencySosActive > 0 ? (
              <span className="text-red-400">{emergencySosActive} SOS Alert!</span>
            ) : (
              <span className="text-emerald-400">All Safe</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1 border-t border-white/5">
            <span>{openComplaintsCount === 0 ? 'No complaints' : `${openComplaintsCount} Open Complaints`}</span>
            <span>•</span>
            <span>{safetyIncidentsCount === 0 ? 'No incidents' : `${safetyIncidentsCount} Incidents`}</span>
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW: REVENUE TRENDS & GMV BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Booking GMV & Revenue Performance</h3>
              <p className="text-xs text-slate-400">Calculated from actual completed booking transaction records</p>
            </div>
          </div>

          {/* Real Data Chart or Empty State */}
          {gmv === 0 && totalRevenue === 0 ? (
            <div className="w-full h-64 border border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-white/[0.01]">
              <BarChart3 className="w-10 h-10 text-slate-500 mb-2" />
              <p className="text-sm font-bold text-white">No revenue recorded yet</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Transaction metrics and revenue curves will automatically populate as real guests place bookings and complete payments.
              </p>
            </div>
          ) : (
            <div className="w-full h-64 relative pt-4 flex items-end justify-around border-b border-white/10 pb-2">
              <div className="text-center text-xs">
                <div className="text-xl font-bold text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</div>
                <div className="text-slate-400 text-[10px] mt-1">Net Platform Revenue</div>
              </div>
              <div className="text-center text-xs">
                <div className="text-xl font-bold text-[#fd8a42]">₹{gmv.toLocaleString('en-IN')}</div>
                <div className="text-slate-400 text-[10px] mt-1">Gross Booking Volume</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Platform Revenue Breakdown */}
        <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Revenue Composition</h3>
            <p className="text-xs text-slate-400">Platform earnings structure</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Registration Fees</span>
                <span className="font-bold text-white">₹{registrationRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#fd8a42]" style={{ width: `${regFeeShare}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ₹{registrationFeeConfig.amount} on-time host registration ({regFeeShare}% of total revenue)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Booking Platform Fees</span>
                <span className="font-bold text-white">₹{bookingFeeRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${bookingFeeShare}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Platform fee per pass booking ({bookingFeeShare}% of total revenue)
              </p>
            </div>
          </div>

          {/* Quick Action Link */}
          <button
            onClick={() => setActiveTab('platform-fees')}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#fd8a42] border border-[#fd8a42]/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Adjust Platform Fees &amp; Pricing</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. FAST OPERATIONAL SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('bookings')}
          className="p-3.5 rounded-2xl bg-[#160b24] border border-white/10 hover:border-[#fd8a42]/50 text-left transition-all group"
        >
          <Calendar className="w-4 h-4 text-[#fd8a42] mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Arrival Check-Ins</p>
          <p className="text-[11px] text-slate-400">
            {totalBookingsCount === 0 ? 'No booking data yet' : `${totalBookingsCount} bookings total`}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className="p-3.5 rounded-2xl bg-[#160b24] border border-white/10 hover:border-emerald-500/50 text-left transition-all group"
        >
          <Wallet className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Disburse Payouts</p>
          <p className="text-[11px] text-slate-400">
            {pendingPayoutsAmount === 0 ? 'No pending payments' : `₹${pendingPayoutsAmount.toLocaleString('en-IN')} pending transfer`}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className="p-3.5 rounded-2xl bg-[#160b24] border border-white/10 hover:border-amber-500/50 text-left transition-all group"
        >
          <FileCheck2 className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Review Applications</p>
          <p className="text-[11px] text-slate-400">
            {pendingAppsCount === 0 ? 'No pending applications' : `${pendingAppsCount} companion apps queued`}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className="p-3.5 rounded-2xl bg-[#160b24] border border-white/10 hover:border-purple-500/50 text-left transition-all group"
        >
          <Flame className="w-4 h-4 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-white">Safety Desk</p>
          <p className="text-[11px] text-slate-400">
            {openComplaintsCount === 0 ? 'No complaints' : `${openComplaintsCount} open disputes`}
          </p>
        </button>
      </div>
    </div>
  );
};
