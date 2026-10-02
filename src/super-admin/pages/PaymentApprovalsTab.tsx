import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  AlertCircle,
  RefreshCw,
  Filter,
  Check,
  X,
  Radio,
  MessageCircle,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
  fetchPaymentApprovalsFromDb,
  approvePaymentInDb,
  rejectPaymentInDb,
  fetchBookingPaymentsFromDb,
  verifyBookingPaymentInDb,
  rejectBookingPaymentInDb,
  DbPaymentApprovalRequest,
} from '../../services/dbService';
import {
  generateCustomerPaymentWhatsAppUrl,
  generateCompanionRegistrationWhatsAppUrl,
  generatePaymentSupportWhatsAppUrl,
  cleanWhatsAppNumber,
} from '../../utils/whatsapp';

export const PaymentApprovalsTab: React.FC = () => {
  const {
    customers,
    confirmUserPayment,
    rejectUserPayment,
    currentAdmin,
    registrationFeeConfig,
  } = useSuperAdmin();

  // Active Sub-Tab: 'bookings' (Lock in Escrow) vs 'registrations' (₹499 Companion Registration Fee)
  const [activeQueueTab, setActiveQueueTab] = useState<'bookings' | 'registrations'>('bookings');

  // Registration Payments Queue
  const [dbRequests, setDbRequests] = useState<DbPaymentApprovalRequest[]>([]);
  // Customer Booking Payments Queue (BOOKING_PAYMENT)
  const [bookingPayments, setBookingPayments] = useState<any[]>([]);
  const [bookingPendingCount, setBookingPendingCount] = useState(0);
  const [bookingConfirmedCount, setBookingConfirmedCount] = useState(0);
  const [bookingRejectedCount, setBookingRejectedCount] = useState(0);

  const [dbConnected, setDbConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReasonType, setRejectionReasonType] = useState('Transaction ID not found');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load both Queues from Central Database
  const loadApprovals = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      // 1. Fetch Companion Registrations
      const regRes = await fetchPaymentApprovalsFromDb();
      if (regRes.success && Array.isArray(regRes.requests)) {
        setDbRequests(regRes.requests);
        setDbConnected(true);
      }

      // 2. Fetch Customer Booking Payments
      const bookRes = await fetchBookingPaymentsFromDb();
      if (bookRes.success && Array.isArray(bookRes.payments)) {
        setBookingPayments(bookRes.payments);
        setBookingPendingCount(bookRes.pendingCount || 0);
        setBookingConfirmedCount(bookRes.confirmedCount || 0);
        setBookingRejectedCount(bookRes.rejectedCount || 0);
      }
    } catch (e) {
      setDbConnected(false);
      console.warn('Error loading payment approvals from database:', e);
    } finally {
      setLoading(false);
      if (!isBackground) setIsRefreshing(false);
    }
  }, []);

  // Initial load and live polling every 8 seconds for multi-device synchronization
  useEffect(() => {
    loadApprovals();
    const interval = setInterval(() => {
      loadApprovals(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [loadApprovals]);

  // Combine DB requests with any local fallback if DB is empty
  const allApprovalRequests = dbRequests.map((req) => {
    return {
      userId: req.userId,
      name: req.name,
      email: req.email,
      phone: req.phone,
      role: req.role || 'customer',
      city: req.city || 'Ahmedabad',
      amount: req.amount || registrationFeeConfig.amount || 499,
      paymentReference: req.paymentReference || 'Submitted (Pending Ref)',
      transactionId: req.transactionId || '—',
      paymentMethod: req.paymentMethod || 'UPI',
      submittedAt: req.submittedAt || 'Recently',
      confirmedAt: req.approvedAt,
      rejectedAt: req.rejectedAt,
      rejectionReason: req.rejectionReason || '',
      status: req.status || 'Pending Verification',
      rawStatus: req.paymentStatus || 'PENDING',
      aadhaarImage: req.aadhaarImage,
      selfieImage: req.selfieImage,
    };
  });

  const filteredRequests = allApprovalRequests.filter((req) => {
    const matchesSearch =
      req.userId.toLowerCase().includes(search.toLowerCase()) ||
      req.name.toLowerCase().includes(search.toLowerCase()) ||
      req.email.toLowerCase().includes(search.toLowerCase()) ||
      req.phone.includes(search) ||
      req.paymentReference.toLowerCase().includes(search.toLowerCase()) ||
      (req.transactionId && req.transactionId.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && req.status === 'Pending Verification') ||
      (statusFilter === 'approved' && req.status === 'Approved') ||
      (statusFilter === 'rejected' && req.status === 'Rejected');

    return matchesSearch && matchesStatus;
  });

  const pendingCount = allApprovalRequests.filter((r) => r.status === 'Pending Verification').length;
  const approvedCount = allApprovalRequests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = allApprovalRequests.filter((r) => r.status === 'Rejected').length;

  const handleApprove = async (userId: string, userName: string) => {
    try {
      const adminName = currentAdmin?.name || currentAdmin?.adminId || 'Master Admin';
      const res = await approvePaymentInDb(userId, adminName);
      
      // Update local Context
      confirmUserPayment(userId);

      if (res.success) {
        setActionToast({
          message: `Payment Approved! User @${userId} (${userName}) account is activated and login is now enabled across all devices.`,
          type: 'success',
        });
      } else {
        setActionToast({
          message: res.errorMessage || 'Failed to update payment status in database.',
          type: 'error',
        });
      }

      // Re-fetch to update table instantly
      await loadApprovals(true);
      setTimeout(() => setActionToast(null), 5000);
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error approving payment', type: 'error' });
    }
  };

  const handleOpenRejectModal = (userId: string) => {
    setRejectingUserId(userId);
    setRejectingBookingId(null);
    setRejectionReasonType('Transaction ID not found');
    setCustomRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingUserId) return;
    try {
      const finalReason =
        rejectionReasonType === 'Other'
          ? (customRejectionReason.trim() || 'Payment rejected by Super Admin')
          : rejectionReasonType;
      const adminName = currentAdmin?.name || currentAdmin?.adminId || 'Master Admin';
      const res = await rejectPaymentInDb(rejectingUserId, finalReason, adminName);
      
      // Update local context
      rejectUserPayment(rejectingUserId, finalReason);

      if (res.success) {
        setActionToast({
          message: `Payment Rejected for User ID @${rejectingUserId}. Login access remains disabled.`,
          type: 'success',
        });
      } else {
        setActionToast({
          message: res.errorMessage || 'Failed to update rejection in database.',
          type: 'error',
        });
      }

      setRejectingUserId(null);
      setCustomRejectionReason('');
      await loadApprovals(true);
      setTimeout(() => setActionToast(null), 5000);
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error rejecting payment', type: 'error' });
    }
  };

  // --- BOOKING PAYMENT HANDLERS ---
  const handleConfirmBookingPayment = async (bookingId: string, customerName: string, amount: number) => {
    try {
      const res = await verifyBookingPaymentInDb(bookingId);
      if (res.success) {
        setActionToast({
          message: `Payment Confirmed! ₹${amount.toLocaleString('en-IN')} locked in escrow for ${customerName} (Booking #${bookingId}).`,
          type: 'success',
        });
      } else {
        setActionToast({
          message: res.errorMessage || 'Failed to confirm booking payment in database.',
          type: 'error',
        });
      }
      await loadApprovals(true);
      setTimeout(() => setActionToast(null), 5000);
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error verifying booking payment', type: 'error' });
    }
  };

  const handleOpenRejectBookingModal = (bookingId: string) => {
    setRejectingBookingId(bookingId);
    setRejectingUserId(null);
    setRejectionReasonType('Transaction ID not found');
    setCustomRejectionReason('');
  };

  const handleConfirmRejectBooking = async () => {
    if (!rejectingBookingId) return;
    try {
      const finalReason =
        rejectionReasonType === 'Other'
          ? (customRejectionReason.trim() || 'Payment could not be verified')
          : rejectionReasonType;
      const res = await rejectBookingPaymentInDb(rejectingBookingId, finalReason);
      if (res.success) {
        setActionToast({
          message: `Booking Payment Rejected for #${rejectingBookingId}. Status set to REJECTED.`,
          type: 'success',
        });
      } else {
        setActionToast({
          message: res.errorMessage || 'Failed to reject booking payment.',
          type: 'error',
        });
      }
      setRejectingBookingId(null);
      setCustomRejectionReason('');
      await loadApprovals(true);
      setTimeout(() => setActionToast(null), 5000);
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error rejecting booking payment', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            actionToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{actionToast.message}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Tabs: Booking Payments (Lock in Escrow) vs Registration Fees */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveQueueTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeQueueTab === 'bookings'
              ? 'bg-[#fd8a42] text-white shadow-lg'
              : 'bg-[#201033] text-slate-300 hover:text-white hover:bg-[#2c1646]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Customer Booking Payments</span>
          {bookingPendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {bookingPendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveQueueTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeQueueTab === 'registrations'
              ? 'bg-[#fd8a42] text-white shadow-lg'
              : 'bg-[#201033] text-slate-300 hover:text-white hover:bg-[#2c1646]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Companion Registration Fees (₹499)</span>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-[#160b24] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#fd8a42]/10 border border-[#fd8a42]/30 text-[#fd8a42]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {activeQueueTab === 'bookings' ? 'Customer Booking Payments Queue' : 'Companion Registration Approvals Queue'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeQueueTab === 'bookings'
              ? 'Review customer bookings locked in escrow (₹1,200 base + ₹70 platform fee = ₹1,270). Verify transaction and click Confirm Payment or WhatsApp.'
              : 'Review host companion ₹499 registration fee applications, verify UTR, and activate login accounts.'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced with Supabase PostgreSQL Database
            </span>
          </div>
        </div>

        {/* Action Button & Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => loadApprovals(false)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-[#201033] hover:bg-[#2e1847] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#fd8a42] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Queue'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending: <strong className="text-white font-bold">{activeQueueTab === 'bookings' ? bookingPendingCount : pendingCount}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirmed: <strong className="text-white font-bold">{activeQueueTab === 'bookings' ? bookingConfirmedCount : approvedCount}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Rejected: <strong className="text-white font-bold">{activeQueueTab === 'bookings' ? bookingRejectedCount : rejectedCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeQueueTab === 'bookings'
                ? 'Search bookings by Customer, Companion, Booking ID, or Payment Reference...'
                : 'Search registrations by User ID, Name, Email, Mobile, or UTR...'
            }
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#201033] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="approved">Approved / Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 1. CUSTOMER BOOKINGS QUEUE */}
      {activeQueueTab === 'bookings' && (
        <div className="bg-[#160b24] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1f1030] text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Customer &amp; Companion</th>
                  <th className="py-3.5 px-4">Booking ID &amp; Date</th>
                  <th className="py-3.5 px-4 text-right">Fee Breakdown</th>
                  <th className="py-3.5 px-4">Payment Ref / Escrow</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Action &amp; WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && bookingPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#fd8a42]" />
                        <span>Loading customer booking payments from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookingPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-xs font-medium">
                      No customer booking payments found. When a customer locks escrow, it appears here instantly.
                    </td>
                  </tr>
                ) : (
                  bookingPayments
                    .filter((p) => {
                      const matchesSearch =
                        (p.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.companionName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.bookingId || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.bookingReference || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.paymentReference || '').toLowerCase().includes(search.toLowerCase());

                      const isPending = p.paymentStatus === 'PENDING_CONFIRMATION';
                      const isConfirmed = p.paymentStatus === 'CONFIRMED';
                      const isRejected = p.paymentStatus === 'REJECTED';

                      const matchesStatus =
                        statusFilter === 'all' ||
                        (statusFilter === 'pending' && isPending) ||
                        (statusFilter === 'approved' && isConfirmed) ||
                        (statusFilter === 'rejected' && isRejected);

                      return matchesSearch && matchesStatus;
                    })
                    .map((bp) => {
                      const isPending = bp.paymentStatus === 'PENDING_CONFIRMATION';
                      const isConfirmed = bp.paymentStatus === 'CONFIRMED';
                      const isRejected = bp.paymentStatus === 'REJECTED';

                      const customerWaUrl = generateCustomerPaymentWhatsAppUrl(
                        bp.customerPhone,
                        bp.customerName,
                        bp.totalPrice,
                        bp.bookingReference || bp.bookingId,
                        bp.companionName
                      );

                      return (
                        <tr key={bp.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Customer & Companion */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Customer:</span>
                                <p className="font-bold text-white text-sm">{bp.customerName || 'Verified Guest'}</p>
                                {bp.customerPhone && (
                                  <p className="text-[11px] text-slate-400 font-mono">{bp.customerPhone}</p>
                                )}
                              </div>
                              <div className="pt-1 border-t border-white/5">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Companion:</span>
                                <p className="font-semibold text-[#fd8a42]">{bp.companionName}</p>
                              </div>
                            </div>
                          </td>

                          {/* Booking ID & Date */}
                          <td className="py-3.5 px-4 space-y-1">
                            <span className="font-mono text-purple-300 bg-[#201033] px-2 py-0.5 rounded text-[11px] border border-purple-500/20">
                              #{bp.bookingReference || bp.bookingId}
                            </span>
                            <p className="text-slate-300 text-xs mt-1">{bp.date} • {bp.timeSlot}</p>
                            <p className="text-slate-400 text-[11px] truncate max-w-[180px]">{bp.venue}</p>
                          </td>

                          {/* Fee Breakdown */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="space-y-0.5">
                              <span className="text-slate-400 text-[11px] block">Base: ₹{bp.basePrice}</span>
                              <span className="text-slate-400 text-[11px] block">+ Platform Fee: ₹{bp.platformFee}</span>
                              <div className="pt-1 border-t border-white/10 font-bold text-sm text-emerald-400">
                                Total: ₹{bp.totalPrice}
                              </div>
                            </div>
                          </td>

                          {/* Payment Ref / Escrow */}
                          <td className="py-3.5 px-4 space-y-1">
                            <span className="font-mono bg-[#201033] px-2.5 py-1 rounded-md text-[11px] text-[#fd8a42] font-semibold border border-[#fd8a42]/20 block max-w-fit">
                              {bp.paymentReference}
                            </span>
                            <span className="text-[10px] text-emerald-400 block font-medium">
                              Escrow: {bp.escrowStatus}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
                                <Clock className="w-3 h-3" />
                                <span>PENDING CONFIRMATION</span>
                              </span>
                            )}
                            {isConfirmed && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>CONFIRMED • ESCROW LOCKED</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>PAYMENT REJECTED</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => handleConfirmBookingPayment(bp.id, bp.customerName, bp.totalPrice)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                                    title="Confirm payment and lock escrow"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>CONFIRM</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenRejectBookingModal(bp.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                                    title="Reject payment"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>REJECT</span>
                                  </button>
                                </>
                              ) : isConfirmed ? (
                                <span className="text-[11px] text-emerald-400 font-medium">
                                  Verified ✓
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleConfirmBookingPayment(bp.id, bp.customerName, bp.totalPrice)}
                                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10 transition-colors cursor-pointer"
                                >
                                  Re-Confirm
                                </button>
                              )}

                              {/* WhatsApp Contact Button */}
                              <a
                                href={customerWaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer"
                                title="Contact customer on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
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
      )}

      {/* 2. COMPANION REGISTRATION FEE QUEUE */}
      {activeQueueTab === 'registrations' && (
        <div className="bg-[#160b24] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1f1030] text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">User ID &amp; Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-right">Fee</th>
                  <th className="py-3.5 px-4">Payment Reference</th>
                  <th className="py-3.5 px-4">Transaction ID / UTR</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Action &amp; WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && allApprovalRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#fd8a42]" />
                        <span>Loading registration payments from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500 text-xs font-medium">
                      {allApprovalRequests.length === 0
                        ? 'No registration payments found in database.'
                        : 'No payment approval requests found matching your filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.userId} className="hover:bg-white/[0.02] transition-colors">
                      {/* User ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fd8a42] to-[#c9184a] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {req.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{req.name}</p>
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#fd8a42]/10 text-[#fd8a42] border border-[#fd8a42]/30">
                                Host
                              </span>
                            </div>
                            <p className="text-[11px] text-[#fd8a42] font-mono">@{req.userId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="text-slate-300">{req.email}</p>
                        <p className="text-slate-400 font-mono text-[11px]">{req.phone}</p>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                        ₹{req.amount}
                      </td>

                      {/* Payment Ref */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono bg-[#201033] px-2.5 py-1 rounded-md text-[11px] text-purple-300 border border-purple-500/20">
                          {req.paymentReference}
                        </span>
                      </td>

                      {/* Transaction ID / UTR */}
                      <td className="py-3.5 px-4 font-mono">
                        {req.transactionId && req.transactionId !== '—' ? (
                          <span className="bg-[#201033] px-2.5 py-1 rounded-md text-[11px] text-[#fd8a42] font-bold border border-[#fd8a42]/30">
                            {req.transactionId}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Not Entered</span>
                        )}
                      </td>

                      {/* Submission Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {req.submittedAt}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {req.status === 'Pending Verification' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Pending Verification</span>
                          </span>
                        )}
                        {req.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Approved • Login Active</span>
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                          {req.status === 'Pending Verification' ? (
                            <>
                              <button
                                onClick={() => handleApprove(req.userId, req.name)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                                title="Approve payment & activate account"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => handleOpenRejectModal(req.userId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                                title="Reject payment reference"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : req.status === 'Approved' ? (
                            <span className="text-[11px] text-emerald-400/80 font-medium italic">
                              Activated
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(req.userId, req.name)}
                              className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10 transition-colors cursor-pointer"
                            >
                              Re-Approve
                            </button>
                          )}

                          {/* WhatsApp Button */}
                          <a
                            href={generateCompanionRegistrationWhatsAppUrl(req.phone, req.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal (for User Registration) */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#160b24] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Reject Registration Payment</h3>
              </div>
              <button onClick={() => setRejectingUserId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting payment for User ID <strong className="text-white">@{rejectingUserId}</strong> will keep their account inactive and prompt them to re-enter their Transaction ID / UTR.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">Select Rejection Reason:</label>
              <select
                value={rejectionReasonType}
                onChange={(e) => setRejectionReasonType(e.target.value)}
                className="w-full bg-[#201033] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Transaction ID not found">Transaction ID not found</option>
                <option value="Incorrect amount">Incorrect amount</option>
                <option value="Duplicate transaction">Duplicate transaction</option>
                <option value="Payment not received">Payment not received</option>
                <option value="Invalid UTR">Invalid UTR</option>
                <option value="Other">Other (with text input)</option>
              </select>
            </div>

            {rejectionReasonType === 'Other' && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold">Custom Rejection Reason:</label>
                <textarea
                  required
                  rows={3}
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="Specify why payment is rejected..."
                  className="w-full bg-[#201033] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingUserId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Booking Payment Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#160b24] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Reject Customer Booking Payment</h3>
              </div>
              <button onClick={() => setRejectingBookingId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting payment for Booking <strong className="text-white">#{rejectingBookingId}</strong> will notify the customer with "Payment could not be confirmed" and provide WhatsApp support.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">Select Rejection Reason:</label>
              <select
                value={rejectionReasonType}
                onChange={(e) => setRejectionReasonType(e.target.value)}
                className="w-full bg-[#201033] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Transaction ID not found">Transaction ID not found</option>
                <option value="Amount mismatch">Amount mismatch</option>
                <option value="Duplicate payment reference">Duplicate payment reference</option>
                <option value="Payment not received in platform account">Payment not received in platform account</option>
                <option value="Other">Other (with text input)</option>
              </select>
            </div>

            {rejectionReasonType === 'Other' && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold">Custom Rejection Reason:</label>
                <textarea
                  required
                  rows={3}
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="Specify why booking payment is rejected..."
                  className="w-full bg-[#201033] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingBookingId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectBooking}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
