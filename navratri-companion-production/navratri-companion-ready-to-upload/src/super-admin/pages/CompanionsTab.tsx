import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Star,
  Eye,
  X,
  Phone,
  MapPin,
  Clock,
  Wallet,
  Sparkles,
  Ban,
  Check,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { Companion } from '../../types';

export const CompanionsTab: React.FC = () => {
  const { companions, bookings, payouts } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredCompanions = companions.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.area.toLowerCase().includes(search.toLowerCase()) ||
      comp.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesCity = cityFilter === 'all' || comp.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const getCompanionStats = (comp: Companion) => {
    const compBookings = bookings.filter((b) => b.companionId === comp.id);
    const payoutRecord = payouts.find((p) => p.companionId === comp.id);
    const gross = compBookings.reduce((sum, b) => sum + (b.baseFee || 0), 0);
    const net = payoutRecord ? payoutRecord.netPayoutDue : gross;

    return {
      totalBookings: compBookings.length,
      grossEarned: payoutRecord?.grossEarned ?? gross,
      netPayoutDue: net,
      payoutStatus: payoutRecord?.status || (gross > 0 ? 'pending' : 'none'),
    };
  };

  const handleAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span className="font-medium">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companion by name, area, or dance specialization..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Cities ({companions.length})</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
          </select>
        </div>
      </div>

      {/* Companions Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Companion</th>
                <th className="py-3.5 px-4">City & Area</th>
                <th className="py-3.5 px-4">Verification Badges</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Pricing (2h / 4h)</th>
                <th className="py-3.5 px-4">Bookings</th>
                <th className="py-3.5 px-4">Total Earnings</th>
                <th className="py-3.5 px-4">Host Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCompanions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 font-medium">
                    {companions.length === 0 ? '0 Companions' : 'No companions found matching search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredCompanions.map((comp) => {
                  const stats = getCompanionStats(comp);
                  return (
                  <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Companion info */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={comp.avatarUrl}
                          alt={comp.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{comp.name}</span>
                            {comp.isTopHost && (
                              <span className="text-[10px] bg-[#fd8a42]/20 text-[#fd8a42] px-1.5 py-0.2 rounded font-semibold">
                                TOP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Age {comp.age} • {comp.yearsExperience}y exp
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* City & Area */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-white font-medium">{comp.city}</div>
                      <div className="text-[11px] text-slate-400">{comp.area}</div>
                    </td>

                    {/* Verification Badges */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ID Verified
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <ShieldCheck className="w-3 h-3 text-blue-400" /> Background Cleared
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{comp.rating}</span>
                        <span className="text-slate-500 font-normal text-[10px]">({comp.reviewCount})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{comp.responseRate} response</div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <div className="text-white font-medium">₹{comp.price2h} (2h)</div>
                      <div className="text-slate-400 text-[10px]">₹{comp.price4h} (4h)</div>
                    </td>

                    {/* Bookings */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-white">
                      {stats.totalBookings}
                    </td>

                    {/* Earnings */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-emerald-400">₹{stats.grossEarned.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">Net: ₹{stats.netPayoutDue.toLocaleString('en-IN')}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Active Host
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCompanion(comp)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          title="View Full Host Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAction(`Updated top partner status for ${comp.name}`)}
                          className="p-1.5 rounded-lg bg-[#fd8a42]/10 hover:bg-[#fd8a42]/20 text-[#fd8a42]"
                          title="Toggle Star Companion"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPANION DOSSIER MODAL */}
      {selectedCompanion && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#201333] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCompanion.avatarUrl}
                  alt={selectedCompanion.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{selectedCompanion.name}</span>
                    <span className="text-xs text-slate-400 font-normal">Age {selectedCompanion.age}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedCompanion.city} • {selectedCompanion.area} • Phone: {selectedCompanion.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompanion(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Verification & ID Checklist */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Government KYC & Safety Audit</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    ✓ Aadhaar Card Verified
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    ✓ Face Match (99.4%)
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    ✓ Phone OTP Validated
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    ✓ Criminal Record Clear
                  </div>
                </div>
              </div>

              {/* Bio & Dance Specialties */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Garba Style & Bio</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  {selectedCompanion.fullBio}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCompanion.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#fd8a42]/10 text-[#fd8a42] text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & Payouts */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pass Pricing:</span>
                  <span className="text-white font-bold">2 Hours: ₹{selectedCompanion.price2h}</span>
                  <span className="text-slate-400 mx-2">|</span>
                  <span className="text-white font-bold">4 Hours: ₹{selectedCompanion.price4h}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Direct Payout UPI:</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {selectedCompanion.name.toLowerCase()}@okaxis
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    handleAction(`Suspended companion ${selectedCompanion.name}`);
                    setSelectedCompanion(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold"
                >
                  Suspend Companion
                </button>
                <button
                  onClick={() => {
                    handleAction(`Companion ${selectedCompanion.name} re-certified for Navratri Season.`);
                    setSelectedCompanion(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#fd8a42] hover:bg-[#fd8a42]/90 text-white text-xs font-semibold"
                >
                  Save & Confirm Certification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
