import React, { useState, useMemo } from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  Sparkles,
  Zap,
  X,
  AlertCircle,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Check,
  PauseCircle,
  FileText,
  DollarSign,
  User,
  MapPin,
  Key,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { Booking } from '../../types';

export const PayoutsTab: React.FC = () => {
  const { bookings, updatePayoutStatus } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // KPI Calculations based strictly on bookings database
  const totalEscrow = useMemo(() => {
    return bookings
      .filter((b) => b.payoutStatus === 'escrow_held' || !b.checkedIn)
      .reduce((sum, b) => sum + b.totalFee, 0);
  }, [bookings]);

  const pendingPayouts = useMemo(() => {
    return bookings
      .filter((b) => b.payoutStatus === 'escrow_held' || b.payoutStatus === 'ready_to_pay')
      .reduce((sum, b) => sum + b.baseFee, 0);
  }, [bookings]);

  const readyForPayout = useMemo(() => {
    return bookings
      .filter((b) => b.payoutStatus === 'ready_to_pay' || b.payoutStatus === 'approved')
      .reduce((sum, b) => sum + b.baseFee, 0);
  }, [bookings]);

  const totalPaid = useMemo(() => {
    return bookings
      .filter((b) => b.payoutStatus === 'paid')
      .reduce((sum, b) => sum + b.baseFee, 0);
  }, [bookings]);

  const onHoldAmount = useMemo(() => {
    return bookings
      .filter((b) => b.payoutStatus === 'rejected')
      .reduce((sum, b) => sum + b.baseFee, 0);
  }, [bookings]);

  // Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.id.toLowerCase().includes(query) ||
        b.companionName.toLowerCase().includes(query) ||
        b.guestName.toLowerCase().includes(query) ||
        (b.companionUpi && b.companionUpi.toLowerCase().includes(query));

      let matchesStatus = true;
      if (statusFilter === 'pending_approval') {
        matchesStatus = b.payoutStatus === 'ready_to_pay';
      } else if (statusFilter === 'ready') {
        matchesStatus = b.payoutStatus === 'approved' || b.payoutStatus === 'ready_to_pay';
      } else if (statusFilter === 'paid') {
        matchesStatus = b.payoutStatus === 'paid';
      } else if (statusFilter === 'on_hold') {
        matchesStatus = b.payoutStatus === 'rejected';
      } else if (statusFilter === 'escrow') {
        matchesStatus = b.payoutStatus === 'escrow_held';
      }

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const handleStatusChange = (
    bookingId: string,
    newStatus: 'ready_to_pay' | 'approved' | 'paid' | 'rejected',
    labelMsg: string
  ) => {
    updatePayoutStatus(bookingId, newStatus);
    setActionNotice(labelMsg);
    setTimeout(() => setActionNotice(null), 4000);

    // Keep drawer in sync if open
    if (selectedBookingForDetail && selectedBookingForDetail.id === bookingId) {
      setSelectedBookingForDetail({
        ...selectedBookingForDetail,
        payoutStatus: newStatus,
      });
    }
  };

  const renderStatusBadge = (payoutStatus: Booking['payoutStatus'], isCompleted: boolean) => {
    switch (payoutStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Paid
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            <Zap className="w-3 h-3 text-blue-400" />
            Approved
          </span>
        );
      case 'ready_to_pay':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            Pending Admin Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
            <PauseCircle className="w-3 h-3 text-rose-400" />
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            {isCompleted ? 'Ready for Payout' : 'Escrow Held'}
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
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid (5 Responsive Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Escrow */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Escrow</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-white font-mono">
              ₹{totalEscrow.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Held safely in platform vault</p>
          </div>
        </div>

        {/* 2. Pending Payouts */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-amber-300 font-mono">
              ₹{pendingPayouts.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-amber-400/80 mt-0.5">Awaiting meeting completion</p>
          </div>
        </div>

        {/* 3. Ready for Payout */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-blue-500/30 bg-blue-500/5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-blue-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ready for Payout</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-blue-300 font-mono">
              ₹{readyForPayout.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-blue-400/80 mt-0.5">OTP Verified • Admin Review</p>
          </div>
        </div>

        {/* 4. Paid */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-emerald-400 font-mono">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">Disbursed via UPI / Bank</p>
          </div>
        </div>

        {/* 5. On Hold */}
        <div className="p-4 rounded-2xl bg-[#160b24] border border-rose-500/30 bg-rose-500/5 flex flex-col justify-between col-span-2 sm:col-span-1 shadow-md">
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Hold</span>
            <PauseCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-rose-300 font-mono">
              ₹{onHoldAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-rose-400/80 mt-0.5">Under dispute or hold</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Search by Booking ID, Companion, or Customer..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Payouts' },
            { id: 'pending_approval', label: 'Pending Approval' },
            { id: 'ready', label: 'Ready' },
            { id: 'paid', label: 'Paid' },
            { id: 'on_hold', label: 'On Hold' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setStatusFilter(f.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Companion Payouts Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#fd8a42]" />
            <span>Companion Payout &amp; Escrow Ledger</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredBookings.length} Record{filteredBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Companion</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Booking Amount</th>
                <th className="py-3.5 px-4 text-right">Platform Fee</th>
                <th className="py-3.5 px-4 text-right">Companion Payout</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-medium">
                    {bookings.length === 0 ? 'No payout records yet' : 'No payout records found matching current search/filter.'}
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Booking ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#fd8a42] whitespace-nowrap">
                      #{b.id}
                    </td>

                    {/* Companion */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
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

                    {/* Customer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{b.guestName}</div>
                      <div className="text-[10px] text-slate-400">{b.guestPhone}</div>
                    </td>

                    {/* Booking Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-white whitespace-nowrap font-mono">
                      ₹{b.totalFee.toLocaleString('en-IN')}
                    </td>

                    {/* Platform Fee */}
                    <td className="py-3.5 px-4 text-right text-purple-300 whitespace-nowrap font-mono">
                      ₹{b.platformFee.toLocaleString('en-IN')}
                    </td>

                    {/* Companion Payout */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm whitespace-nowrap font-mono">
                      ₹{b.baseFee.toLocaleString('en-IN')}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(b.payoutStatus, b.status === 'completed')}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForDetail(b)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                          title="Review Payout Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-300" />
                          <span>Review Payout</span>
                        </button>

                        {b.payoutStatus === 'ready_to_pay' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                b.id,
                                'approved',
                                `Approved payout of ₹${b.baseFee.toLocaleString('en-IN')} for ${b.companionName}!`
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {b.payoutStatus === 'approved' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                b.id,
                                'paid',
                                `Marked payout of ₹${b.baseFee.toLocaleString('en-IN')} as Paid to ${b.companionName}!`
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{currentPage}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({filteredBookings.length} total payouts)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payout Detail Drawer / Modal */}
      {selectedBookingForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#160b24] border border-white/15 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 my-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1f1035]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payout Detail &amp; Escrow Verification
                </span>
                <h3 className="font-bold text-lg text-white flex items-center gap-2 mt-0.5">
                  <span>Booking Pass #{selectedBookingForDetail.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForDetail(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs text-slate-300 overflow-y-auto max-h-[80vh]">
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-bold text-slate-300">Current Payout Status</span>
                {renderStatusBadge(
                  selectedBookingForDetail.payoutStatus,
                  selectedBookingForDetail.status === 'completed'
                )}
              </div>

              {/* Companion & Customer Box */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#201033] border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Companion Host
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedBookingForDetail.companionAvatar}
                      alt={selectedBookingForDetail.companionName}
                      className="w-7 h-7 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <span className="font-bold text-white block">{selectedBookingForDetail.companionName}</span>
                      <span className="text-[10px] text-slate-400">{selectedBookingForDetail.companionCity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Customer Guest
                  </span>
                  <span className="font-bold text-white block">{selectedBookingForDetail.guestName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedBookingForDetail.guestPhone}</span>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider block">
                  Financial Breakdown
                </span>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Total Booking Amount</span>
                  <span className="font-bold text-white font-mono text-sm">
                    ₹{selectedBookingForDetail.totalFee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Platform Operating Fee</span>
                  <span className="font-bold text-purple-300 font-mono">
                    ₹{selectedBookingForDetail.platformFee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 pt-2 font-bold text-sm">
                  <span className="text-emerald-400">Net Companion Earnings</span>
                  <span className="text-emerald-400 font-mono text-base">
                    ₹{selectedBookingForDetail.baseFee.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Session Details & Verification Details */}
              <div className="space-y-2 bg-[#201033] p-4 rounded-2xl border border-white/10 text-[11px]">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Venue &amp; Slot:</span>
                  <span className="font-bold text-white">
                    {selectedBookingForDetail.venue} ({selectedBookingForDetail.timeSlot})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Booking Date:</span>
                  <span className="font-bold text-white">{selectedBookingForDetail.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Completion OTP Status:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedBookingForDetail.completionOtpVerified || selectedBookingForDetail.status === 'completed'
                      ? `Verified ✓ (OTP: ${selectedBookingForDetail.completionOtp || '8492'})`
                      : 'Pending Customer Verification'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Completed Timestamp:</span>
                  <span className="font-mono text-white">
                    {selectedBookingForDetail.completedAt || 'Today, 10:15 PM'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Transaction Reference ID:</span>
                  <span className="font-mono text-amber-300">
                    TXN-PAYOUT-{selectedBookingForDetail.id}-UPI
                  </span>
                </div>
              </div>

              {/* Admin Action Buttons in Modal */}
              <div className="pt-2 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Update Payout Decision
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        selectedBookingForDetail.id,
                        'approved',
                        `Payout approved for Booking #${selectedBookingForDetail.id}!`
                      )
                    }
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        selectedBookingForDetail.id,
                        'paid',
                        `Payout marked as Paid for Booking #${selectedBookingForDetail.id}!`
                      )
                    }
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Mark Paid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        selectedBookingForDetail.id,
                        'rejected',
                        `Payout placed On Hold for Booking #${selectedBookingForDetail.id}.`
                      )
                    }
                    className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>On Hold</span>
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
