import React, { useState, useMemo } from 'react';
import {
  Key,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  Check,
  PauseCircle,
  X,
  Zap,
  Sliders,
  Send,
  Lock,
  ArrowDown,
  Sparkles,
  Info,
  Calendar,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Phone,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { Booking } from '../../types';

interface CompletionSettings {
  completionOtpEnabled: boolean;
  otpLength: number; // 4 digits
  otpExpiryMinutes: number; // 15, 30, 60
  resendOtpEnabled: boolean;
  maxOtpAttempts: number; // 3, 5, 10
  autoCompletionEnabled: boolean;
}

export const CompletionTab: React.FC = () => {
  const { bookings, updateBookingCompletionAndAudit, addAuditLog, updatePayoutStatus } = useSuperAdmin();

  // Settings State with LocalStorage Persistence
  const [settings, setSettings] = useState<CompletionSettings>(() => {
    const saved = localStorage.getItem('navratri_completion_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      completionOtpEnabled: true,
      otpLength: 4,
      otpExpiryMinutes: 30,
      resendOtpEnabled: true,
      maxOtpAttempts: 3,
      autoCompletionEnabled: false,
    };
  });

  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [payoutFilter, setPayoutFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [manualOtpInput, setManualOtpInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const updateSettings = (key: keyof CompletionSettings, val: any) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    localStorage.setItem('navratri_completion_settings', JSON.stringify(updated));
    addAuditLog('Completion Settings Updated', 'system', `Admin updated completion setting [${key}] to ${val}`);
    setActionNotice(`Updated Completion Setting: ${key} = ${val}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Helper status mappers
  const getDisplaySessionStatus = (b: Booking) => {
    if (b.status === 'cancelled') return 'On Hold';
    if (b.payoutStatus === 'rejected') return 'Completion Disputed';
    if (b.status === 'completed') return 'Completed';
    if (b.completionOtpVerified) return 'OTP Verified';
    if (b.completionOtpSent || b.completionOtp) return 'OTP Pending';
    if (b.sessionStarted || b.checkedIn) return 'Completion Requested';
    return 'Session Active';
  };

  const getDisplayCompletionStatus = (b: Booking) => {
    if (b.payoutStatus === 'rejected') return 'Completion Disputed';
    if (b.status === 'completed') return 'Completed';
    if (b.completionOtpVerified) return 'OTP Verified';
    if (b.completionOtpSent || b.completionOtp) return 'OTP Pending';
    return 'Session Active';
  };

  const getDisplayPayoutStatus = (b: Booking) => {
    if (b.payoutStatus === 'paid') return 'Paid';
    if (b.payoutStatus === 'approved') return 'Approved';
    if (b.payoutStatus === 'ready_to_pay') return 'Pending Admin Approval';
    if (b.payoutStatus === 'rejected') return 'On Hold';
    if (b.status === 'completed') return 'Pending Admin Approval';
    return 'Awaiting Completion';
  };

  // Filter Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.companionName.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        (b.completionOtp && b.completionOtp.includes(q));

      const sessStatus = getDisplaySessionStatus(b);
      const payStatus = getDisplayPayoutStatus(b);

      const matchesSession = sessionFilter === 'all' || sessStatus === sessionFilter;
      const matchesPayout = payoutFilter === 'all' || payStatus === payoutFilter;

      return matchesSearch && matchesSession && matchesPayout;
    });
  }, [bookings, search, sessionFilter, payoutFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Actions
  const handleGenerateOtp = (bookingId: string) => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    updateBookingCompletionAndAudit(
      bookingId,
      {
        completionOtp: newCode,
        completionOtpSent: true,
      },
      'Admin Generated Completion OTP',
      `Admin generated 4-digit completion OTP [${newCode}] for Booking #${bookingId}.`
    );
    setActionNotice(`Generated Completion OTP [${newCode}] for Booking #${bookingId}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResendOtp = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    const code = target?.completionOtp || Math.floor(1000 + Math.random() * 9000).toString();
    updateBookingCompletionAndAudit(
      bookingId,
      {
        completionOtp: code,
        completionOtpSent: true,
      },
      'Admin Resent Completion OTP',
      `Admin resent completion OTP [${code}] to customer ${target?.guestName || ''} for Booking #${bookingId}.`
    );
    setActionNotice(`Resent Completion OTP [${code}] to Customer for Booking #${bookingId}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleVerifyCompletion = (bookingId: string, enteredOtp?: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    if (enteredOtp && target.completionOtp && enteredOtp.trim() !== target.completionOtp) {
      alert(`Invalid OTP! Required: ${target.completionOtp}`);
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateBookingCompletionAndAudit(
      bookingId,
      {
        status: 'completed',
        completionOtpVerified: true,
        completedAt: nowTime,
        payoutStatus: 'ready_to_pay',
      },
      'Admin Verified Meeting Completion',
      `Admin verified completion for Booking #${bookingId}. Meeting completed at ${nowTime}. Payout moved to Pending Admin Approval.`
    );
    setActionNotice(`Verified Completion for Booking #${bookingId}. Payout is now Pending Admin Approval.`);
    setTimeout(() => setActionNotice(null), 4000);

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        status: 'completed',
        completionOtpVerified: true,
        payoutStatus: 'ready_to_pay',
      });
    }
  };

  const handlePutOnHold = (bookingId: string, reason = 'Administrative Hold') => {
    updateBookingCompletionAndAudit(
      bookingId,
      {
        payoutStatus: 'rejected',
      },
      'Admin Placed Booking On Hold',
      `Admin placed Booking #${bookingId} on hold. Reason: ${reason}`
    );
    setActionNotice(`Placed Booking #${bookingId} on Hold / Dispute.`);
    setTimeout(() => setActionNotice(null), 4000);

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, payoutStatus: 'rejected' });
    }
  };

  const handleConfirmPayout = (bookingId: string) => {
    updatePayoutStatus(bookingId, 'paid');
    addAuditLog('Admin Released Payout', 'payouts', `Platform Admin confirmed & released payout for Booking #${bookingId}.`);
    setActionNotice(`Payout confirmed and marked PAID for Booking #${bookingId}!`);
    setTimeout(() => setActionNotice(null), 4000);

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, payoutStatus: 'paid' });
    }
  };

  // Render Badges
  const renderSessionStatusBadge = (sessStatus: string) => {
    switch (sessStatus) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Completed
          </span>
        );
      case 'OTP Verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            OTP Verified
          </span>
        );
      case 'OTP Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            OTP Pending
          </span>
        );
      case 'Completion Requested':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            <Send className="w-3 h-3 text-purple-400" />
            Completion Requested
          </span>
        );
      case 'Completion Disputed':
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
            <PauseCircle className="w-3 h-3 text-rose-400" />
            {sessStatus}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
            Session Active
          </span>
        );
    }
  };

  const renderPayoutStatusBadge = (payoutStatus: string) => {
    switch (payoutStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Paid
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            <Check className="w-3 h-3 text-blue-400" />
            Approved
          </span>
        );
      case 'Pending Admin Approval':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            Pending Admin Approval
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
            <PauseCircle className="w-3 h-3 text-rose-400" />
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-slate-400" />
            Awaiting Completion
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: COMPLETION SETTINGS CONFIGURATION CARD */}
      <div className="bg-[#160b24] p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fd8a42] to-[#c9184a] flex items-center justify-center text-white shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>1. Completion OTP &amp; Meeting Verification Settings</span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure global OTP parameters for meeting completion verification. (Meeting Start OTP is disabled).
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
            Strict 4-Digit OTP Enforced
          </span>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
          {/* Completion OTP Toggle */}
          <div className="p-3.5 bg-[#201033] rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-300">Completion OTP</div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-bold ${settings.completionOtpEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {settings.completionOtpEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <button
                type="button"
                onClick={() => updateSettings('completionOtpEnabled', !settings.completionOtpEnabled)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  settings.completionOtpEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* OTP Length */}
          <div className="p-3.5 bg-[#201033] rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-300">OTP Length</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-black text-amber-300 font-mono">4 Digits</span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">Standard</span>
            </div>
          </div>

          {/* OTP Expiry Minutes */}
          <div className="p-3.5 bg-[#201033] rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-300">OTP Expiry</div>
            <select
              value={settings.otpExpiryMinutes}
              onChange={(e) => updateSettings('otpExpiryMinutes', Number(e.target.value))}
              className="mt-2 bg-[#12081f] text-xs font-bold text-white border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#fd8a42] cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={120}>2 Hours</option>
            </select>
          </div>

          {/* Resend OTP Toggle */}
          <div className="p-3.5 bg-[#201033] rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-300">Resend OTP</div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-bold ${settings.resendOtpEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {settings.resendOtpEnabled ? 'ALLOWED' : 'DISABLED'}
              </span>
              <button
                type="button"
                onClick={() => updateSettings('resendOtpEnabled', !settings.resendOtpEnabled)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  settings.resendOtpEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Maximum Attempts */}
          <div className="p-3.5 bg-[#201033] rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-300">Max Attempts</div>
            <select
              value={settings.maxOtpAttempts}
              onChange={(e) => updateSettings('maxOtpAttempts', Number(e.target.value))}
              className="mt-2 bg-[#12081f] text-xs font-bold text-white border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#fd8a42] cursor-pointer"
            >
              <option value={3}>3 Attempts</option>
              <option value={5}>5 Attempts</option>
              <option value={10}>10 Attempts</option>
            </select>
          </div>

          {/* Auto Completion Toggle */}
          <div className="p-3.5 bg-[#201033] rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-300">Auto-Completion</div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-bold ${settings.autoCompletionEnabled ? 'text-blue-400' : 'text-slate-400'}`}>
                {settings.autoCompletionEnabled ? 'ON (24h)' : 'OFF (Manual)'}
              </span>
              <button
                type="button"
                onClick={() => updateSettings('autoCompletionEnabled', !settings.autoCompletionEnabled)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  settings.autoCompletionEnabled ? 'bg-blue-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Rule Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Critical Governance Rule:</strong> Completion OTP verifies meeting completion only. It does <strong>NEVER</strong> automatically transfer funds to companion accounts. Payouts require explicit Platform Admin approval.
          </span>
        </div>
      </div>

      {/* SECTION 2: COMPLETION FLOW PIPELINE VISUALIZER */}
      <div className="bg-[#160b24] p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#fd8a42]" />
          <span>Meeting Completion &amp; Payout Release Flow Pipeline</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-1.5 text-center text-[10px] font-bold">
          {[
            { step: '1', label: 'Session Active', bg: 'bg-[#201033] text-cyan-300 border-cyan-500/30' },
            { step: '2', label: 'Complete Meeting', bg: 'bg-[#201033] text-purple-300 border-purple-500/30' },
            { step: '3', label: 'OTP Generated', bg: 'bg-[#201033] text-amber-300 border-amber-500/30' },
            { step: '4', label: 'Customer Receives', bg: 'bg-[#201033] text-amber-300 border-amber-500/30' },
            { step: '5', label: 'Companion Enters', bg: 'bg-[#201033] text-amber-300 border-amber-500/30' },
            { step: '6', label: 'OTP Verified', bg: 'bg-[#201033] text-blue-300 border-blue-500/30' },
            { step: '7', label: 'Booking Completed', bg: 'bg-[#201033] text-emerald-300 border-emerald-500/30' },
            { step: '8', label: 'Pending Approval', bg: 'bg-[#201033] text-amber-300 border-amber-500/30' },
            { step: '9', label: 'Admin Reviews', bg: 'bg-[#201033] text-purple-300 border-purple-500/30' },
            { step: '10', label: 'Admin Confirms', bg: 'bg-[#201033] text-blue-300 border-blue-500/30' },
            { step: '11', label: 'Payout = Paid', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
          ].map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border flex flex-col items-center justify-between ${item.bg}`}>
              <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-[9px] mb-1">
                {item.step}
              </span>
              <span className="leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#160b24] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Booking ID, Customer, Companion, or OTP code..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42] transition-colors"
          />
        </div>

        {/* Session Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'Session Active', label: 'Active' },
            { id: 'Completion Requested', label: 'Requested' },
            { id: 'OTP Pending', label: 'OTP Pending' },
            { id: 'OTP Verified', label: 'Verified' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Completion Disputed', label: 'Disputed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setSessionFilter(f.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                sessionFilter === f.id
                  ? 'bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2 & 4: MAIN BOOKING COMPLETION TABLE */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-[#fd8a42]" />
            <span>Active &amp; Completed Booking Sessions</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredBookings.length} Booking{filteredBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Companion</th>
                <th className="py-3.5 px-4">Session Start</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4 text-center">Session Status</th>
                <th className="py-3.5 px-4 text-center">OTP Status</th>
                <th className="py-3.5 px-4 text-center">Payout Status</th>
                <th className="py-3.5 px-4 text-right">Admin Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No booking sessions found matching current search/filter.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const sessStatus = getDisplaySessionStatus(b);
                  const payStatus = getDisplayPayoutStatus(b);
                  const otpCode = b.completionOtp || '8492';

                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#fd8a42] whitespace-nowrap">
                        #{b.id}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">{b.guestName}</div>
                        <div className="text-[10px] text-slate-400">{b.guestPhone}</div>
                      </td>

                      {/* Companion */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={b.companionAvatar}
                            alt={b.companionName}
                            className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white">{b.companionName}</div>
                            <div className="text-[10px] text-slate-400">{b.companionCity}</div>
                          </div>
                        </div>
                      </td>

                      {/* Session Start */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{b.date}</div>
                        <div className="text-[10px] font-mono text-slate-400">{b.timeSlot}</div>
                      </td>

                      {/* Session Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-white">
                        {b.duration}
                      </td>

                      {/* Session Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderSessionStatusBadge(sessStatus)}
                      </td>

                      {/* OTP Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {b.completionOtpVerified || b.status === 'completed' ? (
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Verified ✓ ({otpCode})
                          </span>
                        ) : b.completionOtpSent || b.completionOtp ? (
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                            Generated ({otpCode})
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-slate-500">Pending Gen</span>
                        )}
                      </td>

                      {/* Payout Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderPayoutStatusBadge(payStatus)}
                      </td>

                      {/* Admin Quick Action Controls */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Generate / Resend OTP */}
                          {!b.completionOtpVerified && b.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() =>
                                b.completionOtpSent
                                  ? handleResendOtp(b.id)
                                  : handleGenerateOtp(b.id)
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                              title={b.completionOtpSent ? 'Resend OTP to Customer' : 'Generate Completion OTP'}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{b.completionOtpSent ? 'Resend OTP' : 'Gen OTP'}</span>
                            </button>
                          )}

                          {/* Verify Completion */}
                          {!b.completionOtpVerified && b.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleVerifyCompletion(b.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
                              title="Verify Completion Code"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          )}

                          {/* Confirm Admin Payout */}
                          {(b.payoutStatus === 'ready_to_pay' || (b.status === 'completed' && b.payoutStatus !== 'paid')) && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayout(b.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
                              title="Confirm Admin Payout Release"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Confirm Payout</span>
                            </button>
                          )}

                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="Inspect Completion Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{currentPage}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({filteredBookings.length} total sessions)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: DETAILED INSPECTION & MANUAL CONTROL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#160b24] border border-white/15 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 my-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1f1035]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Admin Completion Control Panel
                </span>
                <h3 className="font-bold text-lg text-white flex items-center gap-2 mt-0.5">
                  <span>Booking Session #{selectedBooking.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-300 overflow-y-auto max-h-[80vh]">
              {/* Status Row */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#201033] border border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Session Status
                  </span>
                  {renderSessionStatusBadge(getDisplaySessionStatus(selectedBooking))}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Payout Status
                  </span>
                  {renderPayoutStatusBadge(getDisplayPayoutStatus(selectedBooking))}
                </div>
              </div>

              {/* Participants Box */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#201033] border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Customer
                  </span>
                  <span className="font-bold text-white block">{selectedBooking.guestName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedBooking.guestPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Companion Host
                  </span>
                  <span className="font-bold text-white block">{selectedBooking.companionName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedBooking.companionCity}</span>
                </div>
              </div>

              {/* OTP Live Status & Verification Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Completion OTP Code</span>
                  </span>
                  <span className="text-lg font-mono font-black text-amber-200 tracking-widest bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">
                    {selectedBooking.completionOtp || '8492'}
                  </span>
                </div>

                {/* Manual OTP Input Verification */}
                {!selectedBooking.completionOtpVerified && selectedBooking.status !== 'completed' && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-bold text-amber-300 block">
                      Manual Admin Verification (Enter OTP to force complete):
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={manualOtpInput}
                        onChange={(e) => setManualOtpInput(e.target.value)}
                        placeholder="Enter 4-digit OTP"
                        className="flex-1 bg-[#12081f] border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleVerifyCompletion(selectedBooking.id, manualOtpInput);
                          setManualOtpInput('');
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider block">
                  Booking Financials
                </span>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Total Paid by Customer</span>
                  <span className="font-bold text-white font-mono">₹{selectedBooking.totalFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Platform Commission</span>
                  <span className="font-bold text-purple-300 font-mono">₹{selectedBooking.platformFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 font-bold">
                  <span className="text-emerald-400">Net Companion Payout</span>
                  <span className="text-emerald-400 font-mono text-sm">₹{selectedBooking.baseFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Admin Override Controls */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Admin Control Overrides (Recorded in Audit Log)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateOtp(selectedBooking.id)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate / Resend OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyCompletion(selectedBooking.id)}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Completion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmPayout(selectedBooking.id)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Release Payout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePutOnHold(selectedBooking.id)}
                    className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Put On Hold</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
