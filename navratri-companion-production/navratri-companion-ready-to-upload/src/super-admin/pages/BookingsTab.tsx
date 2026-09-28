import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  X,
  CreditCard,
  Phone,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Ban,
  ArrowRight,
  ExternalLink,
  HeartHandshake,
  Play,
  Check,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { Booking } from '../../types';

export const BookingsTab: React.FC = () => {
  const {
    bookings,
    markBookingCheckedIn,
    startBookingSession,
    markBookingCompleted,
    confirmAdminPayout,
    cancelBooking,
    refundBooking,
  } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionConfirmModal, setActionConfirmModal] = useState<{
    type: 'check_in' | 'start_session' | 'complete' | 'cancel' | 'refund';
    booking: Booking;
  } | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.companionName.toLowerCase().includes(search.toLowerCase()) ||
      b.venue.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmAction = () => {
    if (!actionConfirmModal) return;
    const { type, booking } = actionConfirmModal;

    if (type === 'check_in') {
      markBookingCheckedIn(booking.id, 'Super Admin Manual Intervention');
    } else if (type === 'start_session') {
      startBookingSession(booking.id);
    } else if (type === 'complete') {
      markBookingCompleted(booking.id);
    } else if (type === 'cancel') {
      cancelBooking(booking.id);
    } else if (type === 'refund') {
      refundBooking(booking.id);
    }

    setActionConfirmModal(null);
    if (selectedBooking && selectedBooking.id === booking.id) {
      const updated = bookings.find((b) => b.id === booking.id);
      if (updated) setSelectedBooking(updated);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse';
      case 'completed':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking ID, Guest, Companion, or Venue..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Statuses ({bookings.length})</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active (In Session)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled / Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table with Clean Check-In / Session Flow */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Companion</th>
                <th className="py-3.5 px-4">Venue &amp; City</th>
                <th className="py-3.5 px-4">Date &amp; Slot</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Check-in Status</th>
                <th className="py-3.5 px-4">Session Status</th>
                <th className="py-3.5 px-4">Check-in Time</th>
                <th className="py-3.5 px-4">Session Start</th>
                <th className="py-3.5 px-4">Completion OTP</th>
                <th className="py-3.5 px-4">Payout Status</th>
                <th className="py-3.5 px-4 text-right">Intervention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-slate-500 font-medium">
                    {bookings.length === 0 ? 'No booking data yet' : 'No bookings found matching search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Booking ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#fd8a42] whitespace-nowrap">
                      #{b.id}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{b.guestName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#fd8a42]" />
                        <span>{b.guestPhone}</span>
                      </div>
                    </td>

                    {/* Companion */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={b.companionAvatar}
                          alt={b.companionName}
                          className="w-7 h-7 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="font-semibold text-white">{b.companionName}</div>
                          <div className="text-[10px] text-slate-400">{b.companionCity}</div>
                        </div>
                      </div>
                    </td>

                    {/* Venue & City */}
                    <td className="py-3.5 px-4 whitespace-nowrap max-w-[160px]">
                      <div className="text-white font-medium truncate">{b.venue}</div>
                      <div className="text-[10px] text-slate-400 truncate">{b.companionCity}</div>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-white">{b.date}</div>
                      <div className="text-[10px] text-slate-400">{b.timeSlot}</div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">₹{b.totalFee}</div>
                      <div className="text-[10px] text-slate-400">
                        Base ₹{b.baseFee} + <span className="text-[#fd8a42]">Fee ₹{b.platformFee}</span>
                      </div>
                    </td>

                    {/* Check-in Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Checked In ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pending Arrival
                        </span>
                      )}
                    </td>

                    {/* Session Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getStatusBadge(b.status)}`}>
                        {b.status === 'active' ? 'Session Active' : b.status}
                      </span>
                    </td>

                    {/* Check-in Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-300">
                      {b.checkInTime || '—'}
                    </td>

                    {/* Session Start Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-300">
                      {b.sessionStartTime || '—'}
                    </td>

                    {/* Completion OTP */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.completionOtpVerified || b.status === 'completed' ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified ✓
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            OTP: {b.completionOtp || '8492'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-amber-400 font-semibold text-[11px]">
                            Pending Verification
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            OTP: {b.completionOtp || '8492'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Payout Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.payoutStatus === 'paid' ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid ✓
                        </span>
                      ) : b.payoutStatus === 'ready_to_pay' ? (
                        <span className="text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Ready for Admin Payout
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Held in Escrow</span>
                      )}
                    </td>

                    {/* Intervention Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="View Full Booking Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Admin Action: Confirm Payout */}
                        {b.payoutStatus === 'ready_to_pay' && (
                          <button
                            onClick={() => {
                              confirmAdminPayout(b.id);
                              alert(`Payout confirmed! Companion earnings of ₹${b.baseFee.toLocaleString('en-IN')} marked as Paid for Booking #${b.id}.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                            title="Confirm Payout Transfer to Companion"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirm Payout</span>
                          </button>
                        )}

                        {/* Admin Manual Interventions: Mark Checked In */}
                        {!b.checkedIn && b.status !== 'cancelled' && (
                          <button
                            onClick={() => setActionConfirmModal({ type: 'check_in', booking: b })}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[10px] border border-emerald-500/30"
                            title="Manually Mark Checked In"
                          >
                            Mark Checked In
                          </button>
                        )}

                        {/* Admin Manual Interventions: Start Session */}
                        {b.checkedIn && !b.sessionStarted && b.status !== 'cancelled' && (
                          <button
                            onClick={() => setActionConfirmModal({ type: 'start_session', booking: b })}
                            className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-[10px] border border-blue-500/30 flex items-center gap-1"
                            title="Manually Start Festival Session"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>Start Session</span>
                          </button>
                        )}

                        {/* Admin Manual Interventions: Mark Completed */}
                        {b.status === 'active' && (
                          <button
                            onClick={() => setActionConfirmModal({ type: 'complete', booking: b })}
                            className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-[10px] border border-purple-500/30"
                            title="Mark Session Completed"
                          >
                            Complete
                          </button>
                        )}

                        {/* Admin Manual Interventions: Cancel Session */}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => setActionConfirmModal({ type: 'cancel', booking: b })}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Cancel Session & Issue Refund"
                          >
                            <Ban className="w-3.5 h-3.5" />
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
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#201333] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider">
                  Booking Inspection &amp; Manual Override
                </span>
                <h3 className="text-lg font-bold text-white">Pass #{selectedBooking.id}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Check-In and Session Status Banner */}
              <div className="p-4 rounded-2xl bg-[#201333] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Check-in &amp; Session Timeline
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="font-semibold block">1. Escrow Locked</span>
                    <span className="text-[10px] text-slate-400">Total ₹{selectedBooking.totalFee}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="font-semibold block">2. Contact Unlocked</span>
                    <span className="text-[10px] text-slate-400">Direct Comms</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    selectedBooking.checkedIn
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    {selectedBooking.checkedIn ? (
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    )}
                    <span className="font-semibold block">3. Venue Check-In</span>
                    <span className="text-[10px]">
                      {selectedBooking.checkedIn ? (selectedBooking.checkInTime || 'Checked In ✓') : 'Pending Meetup'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    selectedBooking.payoutStatus === 'paid'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                      : selectedBooking.payoutStatus === 'ready_to_pay'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    {selectedBooking.payoutStatus === 'paid' ? (
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    ) : (
                      <Clock className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                    )}
                    <span className="font-semibold block">4. Host Payout</span>
                    <span className="text-[10px]">
                      {selectedBooking.payoutStatus === 'paid'
                        ? 'Disbursed ✓'
                        : selectedBooking.payoutStatus === 'ready_to_pay'
                        ? 'Ready for UPI'
                        : 'Held in Escrow'}
                    </span>
                  </div>
                </div>

                {selectedBooking.checkedIn && (
                  <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Checked in by: <strong>{selectedBooking.checkedInBy || 'Direct Mobile Check-in'}</strong></span>
                    <span>Time: <strong>{selectedBooking.checkInTime || 'Recorded'}</strong></span>
                  </div>
                )}
              </div>

              {/* Guest & Companion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Guest Information</span>
                  <div className="text-sm font-bold text-white">{selectedBooking.guestName}</div>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBooking.guestPhone}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    Package Duration: {selectedBooking.duration}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#fd8a42]">Companion Partner</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedBooking.companionAvatar}
                      alt={selectedBooking.companionName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{selectedBooking.companionName}</div>
                      <div className="text-[11px] text-slate-400">{selectedBooking.companionCity}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBooking.companionPhone}</span>
                  </div>
                </div>
              </div>

              {/* Financial Calculation breakdown */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Financial Ledger Breakdown</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Companion Fee ({selectedBooking.duration}):</span>
                    <span>₹{selectedBooking.baseFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Platform Booking Fee (Retained by Owner):</span>
                    <span className="text-[#fd8a42] font-semibold">₹{selectedBooking.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10 text-sm">
                    <span>Total Paid by Guest:</span>
                    <span>₹{selectedBooking.totalFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                    <span>Companion UPI Destination:</span>
                    <span className="font-mono text-slate-300">{selectedBooking.companionUpi || `${selectedBooking.companionName.toLowerCase()}@okaxis`}</span>
                  </div>
                </div>
              </div>

              {/* Admin Manual Intervention Controls inside modal */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                {!selectedBooking.checkedIn && selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      markBookingCheckedIn(selectedBooking.id, 'Super Admin Manual Intervention');
                      setSelectedBooking({ ...selectedBooking, checkedIn: true, checkInTime: 'Manual Check-In' });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Checked In</span>
                  </button>
                )}

                {selectedBooking.checkedIn && !selectedBooking.sessionStarted && selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      startBookingSession(selectedBooking.id);
                      setSelectedBooking({ ...selectedBooking, sessionStarted: true, status: 'active', payoutStatus: 'ready_to_pay' });
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Session</span>
                  </button>
                )}

                {selectedBooking.status === 'active' && (
                  <button
                    onClick={() => {
                      markBookingCompleted(selectedBooking.id);
                      setSelectedBooking({ ...selectedBooking, status: 'completed' });
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                  >
                    Mark Session Completed
                  </button>
                )}

                {selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      refundBooking(selectedBooking.id);
                      setSelectedBooking({ ...selectedBooking, status: 'cancelled', escrowStatus: 'Refunded' });
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    Cancel Session &amp; Refund (₹{selectedBooking.totalFee})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c0f2e] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Confirm Admin Action for Booking #{actionConfirmModal.booking.id}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {actionConfirmModal.type === 'check_in' &&
                `Manually confirm arrival check-in for guest "${actionConfirmModal.booking.guestName}" and companion "${actionConfirmModal.booking.companionName}" at ${actionConfirmModal.booking.venue}?`}
              {actionConfirmModal.type === 'start_session' &&
                `Start active festival session for Booking #${actionConfirmModal.booking.id}? This will unlock companion payout release upon completion.`}
              {actionConfirmModal.type === 'complete' &&
                `Mark session between ${actionConfirmModal.booking.guestName} and ${actionConfirmModal.booking.companionName} as fully completed?`}
              {actionConfirmModal.type === 'cancel' &&
                `Cancel this booking and release held slot back to companion availability?`}
              {actionConfirmModal.type === 'refund' &&
                `Issue complete refund of ₹${actionConfirmModal.booking.totalFee} back to customer source account?`}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setActionConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5"
              >
                Dismiss
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#fd8a42] hover:bg-[#fd8a42]/90"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
