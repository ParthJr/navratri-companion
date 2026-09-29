import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
  RefreshCw,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { Companion, HostApplicant } from '../../types';

interface DiagnosticRecord {
  id: string;
  name: string;
  phone: string;
  city: string;
  area: string;
  avatarUrl?: string;
  accountStatus: string;
  profileStatus: string;
  verificationStatus: string;
  availabilityStatus: string;
  isVisible: boolean;
  visibilityReason: string;
  source: 'companion' | 'applicant' | 'user';
  rawRecord?: any;
}

export const CompanionsTab: React.FC = () => {
  const {
    companions,
    bookings,
    payouts,
    applicants,
    customers,
    refreshCompanions,
    isLoadingCompanions,
    setActiveTab,
  } = useSuperAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'diagnostics'>('directory');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [diagVisibilityFilter, setDiagVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered Approved Companions for Directory View
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

  // Compile Comprehensive Companion Diagnostics
  const diagnosticRecords: DiagnosticRecord[] = [];
  const processedKeys = new Set<string>();

  // 1. Live Active Companions (Known to be visible or approved)
  companions.forEach((comp) => {
    const key = comp.phone || comp.id;
    processedKeys.add(key);
    processedKeys.add(comp.id);
    if (comp.name) processedKeys.add(comp.name.toLowerCase());

    diagnosticRecords.push({
      id: comp.id,
      name: comp.name,
      phone: comp.phone || 'N/A',
      city: comp.city,
      area: comp.area,
      avatarUrl: comp.avatarUrl,
      accountStatus: 'Active',
      profileStatus: comp.bio && comp.price2h > 0 ? 'Complete' : 'Incomplete Pricing',
      verificationStatus: 'ID Verified & Approved',
      availabilityStatus:
        comp.availableDates && comp.availableDates.length > 0
          ? `${comp.availableDates.length} Dates Available`
          : 'All Dates (Full Season)',
      isVisible: true,
      visibilityReason: 'Approved companion with verified ID and published listing',
      source: 'companion',
      rawRecord: comp,
    });
  });

  // 2. Host Applicants (Pending review, Approved, or Rejected)
  (applicants || []).forEach((app) => {
    const key = app.phone || app.id;
    if (processedKeys.has(key) || (app.name && processedKeys.has(app.name.toLowerCase()))) {
      return; // Already accounted for in live companions
    }
    processedKeys.add(key);
    processedKeys.add(app.id);

    let isVisible = false;
    let reason = '';

    if (app.status === 'pending_review') {
      isVisible = false;
      reason = 'Host application pending admin review and approval';
    } else if (app.status === 'rejected') {
      isVisible = false;
      reason = 'Application rejected during background or ID verification';
    } else if (app.status === 'approved') {
      if (!app.feePaid) {
        isVisible = false;
        reason = 'Registration fee payment pending confirmation';
      } else if (!app.idVerified) {
        isVisible = false;
        reason = 'Aadhaar / ID document verification pending';
      } else {
        isVisible = true;
        reason = 'Application approved; ready for discovery';
      }
    }

    diagnosticRecords.push({
      id: app.id,
      name: app.name,
      phone: app.phone,
      city: app.city,
      area: app.area || 'City Area',
      avatarUrl: app.photoUrl,
      accountStatus:
        app.status === 'approved'
          ? 'Active'
          : app.status === 'rejected'
          ? 'Rejected'
          : 'Pending Review',
      profileStatus: app.bio && app.hourlyRate > 0 ? 'Complete' : 'Missing Bio / Rates',
      verificationStatus:
        app.status === 'approved'
          ? 'Approved'
          : app.idVerified
          ? 'ID Uploaded (Pending Review)'
          : 'ID Incomplete',
      availabilityStatus:
        app.datesAvailable && app.datesAvailable.length > 0
          ? `${app.datesAvailable.length} Dates`
          : 'Default Season',
      isVisible,
      visibilityReason: reason,
      source: 'applicant',
      rawRecord: app,
    });
  });

  // 3. User accounts with role = 'companion'
  (customers || [])
    .filter((c) => (c.role || '').toLowerCase() === 'companion')
    .forEach((cust) => {
      const key = cust.phone || cust.id;
      if (processedKeys.has(key) || (cust.name && processedKeys.has(cust.name.toLowerCase()))) {
        return;
      }
      processedKeys.add(key);

      let isVisible = false;
      let reason = '';

      if (cust.status === 'suspended') {
        reason = 'Companion account suspended by admin';
      } else if (cust.status === 'blocked') {
        reason = 'Companion account blocked';
      } else if (!cust.registrationFeePaid && cust.paymentStatus !== 'Approved') {
        reason = 'Registration fee pending payment';
      } else if (!cust.idVerified) {
        reason = 'Identity verification pending';
      } else {
        reason = 'Host onboarding application not completed';
      }

      diagnosticRecords.push({
        id: cust.id,
        name: cust.name,
        phone: cust.phone,
        city: cust.city,
        area: 'Registered Account',
        avatarUrl: (cust as any).profilePhoto,
        accountStatus: cust.status === 'active' ? 'Active Account' : cust.status,
        profileStatus: cust.idVerified ? 'Basic Profile' : 'Incomplete KYC',
        verificationStatus: cust.idVerified ? 'ID Verified' : 'Pending Verification',
        availabilityStatus: 'Not Configured',
        isVisible,
        visibilityReason: reason,
        source: 'user',
        rawRecord: cust,
      });
    });

  // Filter diagnostics based on search & visibility tab
  const filteredDiagnostics = diagnosticRecords.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.id.toLowerCase().includes(search.toLowerCase()) ||
      rec.city.toLowerCase().includes(search.toLowerCase()) ||
      rec.phone.includes(search);

    const matchesCity = cityFilter === 'all' || rec.city === cityFilter;

    const matchesVisibility =
      diagVisibilityFilter === 'all' ||
      (diagVisibilityFilter === 'visible' && rec.isVisible) ||
      (diagVisibilityFilter === 'hidden' && !rec.isVisible);

    return matchesSearch && matchesCity && matchesVisibility;
  });

  const totalCandidates = diagnosticRecords.length;
  const visibleCount = diagnosticRecords.filter((d) => d.isVisible).length;
  const hiddenCount = diagnosticRecords.filter((d) => !d.isVisible).length;
  const pendingApprovalCount = diagnosticRecords.filter(
    (d) => d.accountStatus.toLowerCase().includes('pending')
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span className="font-medium">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Navigation & Refresh Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'directory'
                ? 'bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white shadow-lg shadow-[#fd8a42]/20'
                : 'bg-[#201033] text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Approved Directory ({companions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'diagnostics'
                ? 'bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white shadow-lg shadow-[#fd8a42]/20'
                : 'bg-[#201033] text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Visibility Diagnostics</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                hiddenCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {hiddenCount} hidden
            </span>
          </button>
        </div>

        <button
          onClick={async () => {
            await refreshCompanions();
            handleAction('Catalog refreshed from Central Database.');
          }}
          disabled={isLoadingCompanions}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#fd8a42] ${isLoadingCompanions ? 'animate-spin' : ''}`} />
          <span>{isLoadingCompanions ? 'Syncing...' : 'Sync Database'}</span>
        </button>
      </div>

      {/* VIEW 1: APPROVED DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
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
                      <td colSpan={9} className="text-center py-10 text-slate-500 font-medium">
                        {companions.length === 0
                          ? 'No approved companions found in database.'
                          : 'No companions found matching search criteria.'}
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
                              <span className="text-slate-500 font-normal text-[10px]">
                                ({comp.reviewCount})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {comp.responseRate} response
                            </div>
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
                            <div className="font-bold text-emerald-400">
                              ₹{stats.grossEarned.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Net: ₹{stats.netPayoutDue.toLocaleString('en-IN')}
                            </div>
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
                                onClick={() =>
                                  handleAction(`Updated top partner status for ${comp.name}`)
                                }
                                className="p-1.5 rounded-lg bg-[#fd8a42]/10 hover:bg-[#fd8a42]/20 text-[#fd8a42]"
                                title="Toggle Star Companion"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: VISIBILITY DIAGNOSTICS & HEALTH */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-4">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Total Candidates
              </span>
              <span className="text-xl font-extrabold text-white font-mono">{totalCandidates}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Across all tables</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Visible to Customers
              </span>
              <span className="text-xl font-extrabold text-emerald-300 font-mono">{visibleCount}</span>
              <span className="text-[10px] text-emerald-400/70 block mt-1">Live in marketplace search</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                Hidden / Ineligible
              </span>
              <span className="text-xl font-extrabold text-rose-300 font-mono">{hiddenCount}</span>
              <span className="text-[10px] text-rose-400/70 block mt-1">Requires approval or payment</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                Pending Admin Review
              </span>
              <span className="text-xl font-extrabold text-amber-300 font-mono">
                {pendingApprovalCount}
              </span>
              <span className="text-[10px] text-amber-400/70 block mt-1">Needs verification action</span>
            </div>
          </div>

          {/* Diagnostic Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate by name, ID, phone, or city..."
                className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={diagVisibilityFilter}
                onChange={(e) => setDiagVisibilityFilter(e.target.value as any)}
                className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
              >
                <option value="all">All Visibility ({diagnosticRecords.length})</option>
                <option value="visible">Visible Only ({visibleCount})</option>
                <option value="hidden">Hidden Only ({hiddenCount})</option>
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
              >
                <option value="all">All Cities</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Gandhinagar">Gandhinagar</option>
              </select>
            </div>
          </div>

          {/* Diagnostic Inspection Table */}
          <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Candidate / ID</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Profile Status</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4 text-center">Visible to Customers</th>
                    <th className="py-3.5 px-4">Reason / Diagnosis</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDiagnostics.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-500 font-medium">
                        No companion candidate records found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDiagnostics.map((rec) => (
                      <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Name & ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {rec.avatarUrl ? (
                              <img
                                src={rec.avatarUrl}
                                alt={rec.name}
                                className="w-7 h-7 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#fd8a42]/20 border border-[#fd8a42]/30 flex items-center justify-center text-xs font-bold text-[#fd8a42]">
                                {rec.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-white block">{rec.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                #{rec.id} • {rec.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-white font-medium block">{rec.city}</span>
                          <span className="text-[10px] text-slate-400">{rec.area}</span>
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              rec.accountStatus.toLowerCase().includes('active')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : rec.accountStatus.toLowerCase().includes('pending')
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {rec.accountStatus}
                          </span>
                        </td>

                        {/* Profile Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                          {rec.profileStatus}
                        </td>

                        {/* Verification Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {rec.verificationStatus.includes('Approved') ||
                          rec.verificationStatus.includes('Verified') ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {rec.verificationStatus}
                            </span>
                          ) : rec.verificationStatus.includes('Rejected') ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                              <Clock className="w-3.5 h-3.5" /> {rec.verificationStatus}
                            </span>
                          )}
                        </td>

                        {/* Availability Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {rec.availabilityStatus}
                        </td>

                        {/* Visible to Customers Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {rec.isVisible ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>YES</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>NO</span>
                            </span>
                          )}
                        </td>

                        {/* Exact Diagnosis Reason */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <span
                            className={`text-xs ${
                              rec.isVisible
                                ? 'text-emerald-400 font-medium'
                                : 'text-rose-300/90 font-medium'
                            }`}
                          >
                            {rec.visibilityReason}
                          </span>
                        </td>

                        {/* Quick Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {rec.source === 'applicant' ? (
                            <button
                              onClick={() => setActiveTab('applications')}
                              className="px-2.5 py-1 rounded-lg bg-[#fd8a42]/10 hover:bg-[#fd8a42]/20 text-[#fd8a42] text-[11px] font-semibold transition-colors"
                            >
                              Review Host
                            </button>
                          ) : rec.source === 'user' ? (
                            <button
                              onClick={() => setActiveTab('users')}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-semibold transition-colors"
                            >
                              Inspect User
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedCompanion(rec.rawRecord)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
                            >
                              Details
                            </button>
                          )}
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
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Government KYC & Safety Audit
                </span>
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
