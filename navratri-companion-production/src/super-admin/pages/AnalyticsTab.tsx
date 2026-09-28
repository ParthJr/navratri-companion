import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  UserCheck,
  Calendar,
  Percent,
  Clock,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

export const AnalyticsTab: React.FC = () => {
  const {
    bookings,
    companions,
    payouts,
    customers,
    getTotalRevenue,
    getRegistrationRevenue,
    getBookingFeeRevenue,
    getGMV,
    getTotalCompanions,
    registrationFeeConfig,
  } = useSuperAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'volume' | 'hosts' | 'customers'>('revenue');

  const totalRevenue = getTotalRevenue();
  const gmv = getGMV();
  const totalPayoutsDisbursed = payouts
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.netPayoutDue, 0);

  // Group real bookings by date for daily financial ledger
  const dailyLedgerMap: Record<string, { date: string; sessions: number; gmv: number; platformRevenue: number; payouts: number }> = {};

  bookings.forEach((b) => {
    const d = b.date || 'Today';
    if (!dailyLedgerMap[d]) {
      dailyLedgerMap[d] = { date: d, sessions: 0, gmv: 0, platformRevenue: 0, payouts: 0 };
    }
    dailyLedgerMap[d].sessions += 1;
    dailyLedgerMap[d].gmv += b.totalFee || 0;
    dailyLedgerMap[d].platformRevenue += b.platformFee || 50;
    dailyLedgerMap[d].payouts += b.baseFee || 0;
  });

  const dailyLedger = Object.values(dailyLedgerMap);

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#160b24] border border-white/10 w-fit">
        {(['revenue', 'volume', 'hosts', 'customers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeSubTab === tab
                ? 'bg-[#fd8a42] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'revenue' && 'Revenue & GMV'}
            {tab === 'volume' && 'Booking Volume'}
            {tab === 'hosts' && 'Companion Performance'}
            {tab === 'customers' && 'Customer Retention'}
          </button>
        ))}
      </div>

      {activeSubTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Gross Merchandise Value (GMV)</span>
              <div className="text-2xl font-black text-white mt-1">₹{gmv.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400 mt-1">Total transaction volume across bookings</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Net Platform Revenue</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400 mt-1">Registration fees + platform booking fees</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Companion Earnings Disbursed</span>
              <div className="text-2xl font-black text-purple-400 mt-1">₹{totalPayoutsDisbursed.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400 mt-1">Directly paid to verified companions</p>
            </div>
          </div>

          {/* Daily Table Breakdown */}
          <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Daily Financial Ledger
              </span>
              <span className="text-xs text-slate-400">{dailyLedger.length} Recorded Days</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Sessions</th>
                    <th className="py-3 px-4">GMV</th>
                    <th className="py-3 px-4">Platform Revenue</th>
                    <th className="py-3 px-4">Companion Payouts</th>
                    <th className="py-3 px-4 text-right">Avg Pass Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dailyLedger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                        No revenue recorded yet
                      </td>
                    </tr>
                  ) : (
                    dailyLedger.map((row) => (
                      <tr key={row.date} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-semibold text-white">{row.date}</td>
                        <td className="py-3 px-4 font-mono">{row.sessions} passes</td>
                        <td className="py-3 px-4 font-bold text-white">₹{row.gmv.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">₹{row.platformRevenue.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-purple-300">₹{row.payouts.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          ₹{row.sessions > 0 ? Math.round(row.gmv / row.sessions) : 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'volume' && (
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Booking Demand Volume</h3>
            <p className="text-xs text-slate-400">Total bookings recorded across platform</p>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-bold text-sm text-slate-400">No booking data yet</p>
            </div>
          ) : (
            <div className="space-y-3 pt-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white">Total Passes Booked</span>
                <span className="text-[#fd8a42] font-semibold">{bookings.length} Passes</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'hosts' && (
        <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Companion Host Roster</h3>
          {companions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-bold text-sm text-slate-400">0 Companions</p>
              <p className="text-xs text-slate-500 mt-1">No companion hosts approved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companions.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-white block">{c.name}</span>
                      <span className="text-[11px] text-slate-400">{c.city} • {c.area}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-slate-400">Rating:</span>
                    <span className="font-bold text-amber-400">★ {c.rating} ({c.reviewCount})</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Response Rate:</span>
                    <span className="text-emerald-400 font-semibold">{c.responseRate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'customers' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">Registered Users</span>
            <div className="text-2xl font-black text-white">{customers.length}</div>
            <p className="text-[11px] text-slate-400">Registered customer accounts</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">Verified Registrations</span>
            <div className="text-2xl font-black text-emerald-400">
              {customers.filter((c) => c.registrationFeePaid || c.paymentStatus === 'Approved').length}
            </div>
            <p className="text-[11px] text-slate-400">Completed ₹{registrationFeeConfig.amount} fee verification</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">Total Bookings Executed</span>
            <div className="text-2xl font-black text-[#fd8a42]">{bookings.length}</div>
            <p className="text-[11px] text-slate-400">Customer booking transactions</p>
          </div>
        </div>
      )}
    </div>
  );
};
