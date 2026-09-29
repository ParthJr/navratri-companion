import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  X,
  Eye,
  FileText,
  BadgeAlert,
  Coins,
  Sparkles,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
  fetchPaymentTransactionsFromDb,
  waiveUserFeeInDb,
  approvePaymentInDb,
  rejectPaymentInDb,
  PaymentTransactionRecord,
} from '../../services/dbService';

export const PaymentsTab: React.FC = () => {
  const { payments, currentAdmin } = useSuperAdmin();

  const [dbTransactions, setDbTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<PaymentTransactionRecord | null>(null);
  const [waivingTx, setWaivingTx] = useState<PaymentTransactionRecord | null>(null);
  const [waiveReason, setWaiveReason] = useState('Super Admin authorized promotion / verification waiver');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectingTx, setRejectingTx] = useState<PaymentTransactionRecord | null>(null);
  const [rejectionReasonType, setRejectionReasonType] = useState('Transaction ID not found');
  const [customRejectionReason, setCustomRejectionReason] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feeTypeFilter, setFeeTypeFilter] = useState('ALL');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetchPaymentTransactionsFromDb();
      if (res.success && Array.isArray(res.transactions)) {
        setDbTransactions(res.transactions);
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleVerifyPayment = async (tx: PaymentTransactionRecord) => {
    try {
      const adminName = currentAdmin?.name || currentAdmin?.adminId || 'Super Admin';
      const res = await approvePaymentInDb(tx.userId, adminName);
      if (res.success) {
        setActionNotice(`Payment verified & account activated for @${tx.userId}`);
        setTimeout(() => setActionNotice(null), 5000);
        if (selectedTx?.userId === tx.userId) setSelectedTx(null);
        await loadTransactions();
      } else {
        alert(res.errorMessage || 'Failed to verify payment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error verifying payment.');
    }
  };

  const handleOpenReject = (tx: PaymentTransactionRecord) => {
    setRejectingTx(tx);
    setRejectionReasonType('Transaction ID not found');
    setCustomRejectionReason('');
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTx) return;

    const finalReason =
      rejectionReasonType === 'Other'
        ? (customRejectionReason.trim() || 'Payment rejected by Super Admin')
        : rejectionReasonType;

    try {
      const adminName = currentAdmin?.name || currentAdmin?.adminId || 'Super Admin';
      const res = await rejectPaymentInDb(rejectingTx.userId, finalReason, adminName);
      if (res.success) {
        setActionNotice(`Payment rejected for @${rejectingTx.userId}. Reason: ${finalReason}`);
        setTimeout(() => setActionNotice(null), 5000);
        setRejectingTx(null);
        if (selectedTx?.userId === rejectingTx.userId) setSelectedTx(null);
        await loadTransactions();
      } else {
        alert(res.errorMessage || 'Failed to reject payment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting payment.');
    }
  };

  // Merge database transactions with context payments if db transactions are empty
  const allTransactions: PaymentTransactionRecord[] =
    dbTransactions.length > 0
      ? dbTransactions
      : payments.map((p) => ({
          id: p.id,
          userId: p.bookingId || p.customerName.toLowerCase().replace(/\s+/g, '_'),
          userName: p.customerName,
          userPhone: p.customerPhone,
          userRole: 'CUSTOMER',
          feeCode: 'BOOKING_ESCROW',
          feeName: 'Garba Night Booking Escrow',
          baseAmount: p.amount - p.platformFee,
          gstAmount: Math.round(p.platformFee * 0.18),
          totalAmount: p.amount,
          currency: 'INR',
          status: p.status === 'paid' ? 'PAID' : p.status === 'refunded' ? 'REFUNDED' : 'PENDING',
          gateway: 'RAZORPAY',
          orderId: p.bookingId,
          paymentId: p.gatewayTxnId,
          transactionId: p.id,
          paymentMethod: p.paymentMethod || 'UPI',
          paidAt: p.date,
          createdAt: p.date,
          updatedAt: p.date,
        }));

  // Filtering
  const filtered = allTransactions.filter((tx) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      (tx.transactionId || '').toLowerCase().includes(s) ||
      (tx.paymentId || '').toLowerCase().includes(s) ||
      (tx.orderId || '').toLowerCase().includes(s) ||
      (tx.userName || '').toLowerCase().includes(s) ||
      (tx.userEmail || '').toLowerCase().includes(s) ||
      (tx.userPhone || '').toLowerCase().includes(s) ||
      (tx.feeName || '').toLowerCase().includes(s);

    const matchesRole = roleFilter === 'ALL' || tx.userRole === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesFeeType = feeTypeFilter === 'ALL' || tx.feeCode === feeTypeFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesFeeType;
  });

  // Analytics KPI aggregates
  const totalRevenue = allTransactions
    .filter((tx) => tx.status === 'PAID')
    .reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);

  const totalRegFees = allTransactions
    .filter((tx) => tx.status === 'PAID' && tx.feeCode.includes('REGISTRATION'))
    .reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);

  const paidCount = allTransactions.filter((tx) => tx.status === 'PAID').length;
  const pendingCount = allTransactions.filter((tx) => tx.status === 'PENDING' || tx.status === 'INITIATED').length;
  const waivedCount = allTransactions.filter((tx) => tx.status === 'WAIVED').length;

  const handleWaiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waivingTx) return;

    try {
      const adminId = currentAdmin?.id || currentAdmin?.username || 'superadmin';
      const res = await waiveUserFeeInDb(waivingTx.userId, waivingTx.feeCode, waiveReason, adminId);
      if (res.success) {
        setActionNotice(`Fee successfully WAIVED for ${waivingTx.userName} (@${waivingTx.userId}). Audit record created.`);
        setTimeout(() => setActionNotice(null), 5000);
        setWaivingTx(null);
        await loadTransactions();
      } else {
        alert(res.errorMessage || 'Failed to waive fee.');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing fee waiver.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Gross Revenue</span>
          <div className="text-2xl font-black text-white mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Platform verified collections</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Registration Fees Collected</span>
          <div className="text-2xl font-black text-[#fd8a42] mt-1">
            ₹{totalRegFees.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Companion &amp; Customer registration</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Paid Transactions</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {paidCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Settled &amp; confirmed payments</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Pending &amp; Waived</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {pendingCount} <span className="text-xs font-normal text-slate-400">/ {waivedCount} waived</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting review or admin-waived</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by User, Phone, Email, Transaction ID, Payment ID, Order ID..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="ALL">All Roles</option>
            <option value="COMPANION">Companion</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="WAIVED">Waived</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Fee Type Filter */}
          <select
            value={feeTypeFilter}
            onChange={(e) => setFeeTypeFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="ALL">All Fee Types</option>
            <option value="COMPANION_REGISTRATION">Companion Registration</option>
            <option value="CUSTOMER_REGISTRATION">Customer Registration</option>
            <option value="CUSTOMER_PLATFORM_FEE">Platform Fee</option>
            <option value="BOOKING_ESCROW">Booking Escrow</option>
          </select>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#fd8a42]" />
            <span>Payment &amp; Fee Transactions ({filtered.length})</span>
          </span>
          <button
            type="button"
            onClick={loadTransactions}
            className="text-xs text-[#fd8a42] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Reference</th>
                <th className="py-3.5 px-4">Transaction ID / UTR</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-medium">
                    {loading ? 'Loading payment transactions...' : 'No transactions found matching current filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id || tx.transactionId || tx.userId} className="hover:bg-white/[0.02] transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{tx.userName || tx.userId}</div>
                      <div className="text-[10px] text-slate-400">
                        {tx.userPhone || tx.userEmail || `@${tx.userId}`}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          (tx.userRole || '').toUpperCase() === 'COMPANION'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {(tx.userRole || 'CUSTOMER').toUpperCase()}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">₹{tx.totalAmount}</div>
                      {tx.gstAmount > 0 ? (
                        <div className="text-[10px] text-slate-400">
                          Base: ₹{tx.baseAmount} + GST: ₹{tx.gstAmount}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500">No GST</div>
                      )}
                    </td>

                    {/* Payment Reference */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <span className="text-purple-300 bg-[#201033] px-2.5 py-1 rounded-md border border-purple-500/20 text-[11px]">
                        {tx.orderId || tx.paymentReference || '—'}
                      </span>
                    </td>

                    {/* Transaction ID / UTR */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      {tx.transactionId ? (
                        <span className="text-[#fd8a42] bg-[#201033] px-2.5 py-1 rounded-md border border-[#fd8a42]/30 text-[11px] font-bold">
                          {tx.transactionId}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Not Entered</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'PAYMENT_SUBMITTED'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse'
                            : tx.status === 'PAYMENT_REJECTED' || tx.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : tx.status === 'WAIVED'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : tx.status === 'REFUNDED'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(tx.paidAt || tx.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {tx.status !== 'PAID' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(tx)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              title="Verify Payment & Activate Account"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ Verify Payment</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReject(tx)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Reject Payment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>✕ Reject Payment</span>
                            </button>
                          </>
                        )}

                        {tx.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => {
                              setWaivingTx(tx);
                              setWaiveReason('Super Admin promotional waiver');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Waive</span>
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

      {/* PAYMENT DETAILS POPUP MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#1a0c2e] border border-white/20 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#fd8a42]" />
                <h3 className="font-bold text-base text-white">Payment Transaction Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* User details */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">User Details</span>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white text-sm">{selectedTx.userName || selectedTx.userId}</span>
                  <span className="font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded text-[10px] border border-purple-500/30">
                    {(selectedTx.userRole || 'CUSTOMER').toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  User ID: <span className="font-mono text-[#fd8a42]">@{selectedTx.userId}</span>
                  {selectedTx.userEmail && <span> • {selectedTx.userEmail}</span>}
                  {selectedTx.userPhone && <span> • {selectedTx.userPhone}</span>}
                </div>
              </div>

              {/* Payment References & Identifiers */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Reference</span>
                  <span className="font-mono text-purple-300 text-xs font-bold break-all">
                    {selectedTx.orderId || selectedTx.paymentReference || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transaction ID / UTR</span>
                  <span className="font-mono font-bold text-[#fd8a42] text-xs break-all">
                    {selectedTx.transactionId || 'Not Entered'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fee Type</span>
                  <span className="font-semibold text-white">{selectedTx.feeName || selectedTx.feeCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Method</span>
                  <span className="font-bold text-white">{selectedTx.paymentMethod || 'UPI'} ({selectedTx.gateway || 'MANUAL'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                  <span className="font-bold text-emerald-400 uppercase">{selectedTx.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submitted / Paid Date</span>
                  <span className="text-slate-300 text-[11px]">
                    {new Date(selectedTx.paidAt || selectedTx.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Base Amount:</span>
                  <span className="font-semibold text-white">₹{selectedTx.baseAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GST Amount:</span>
                  <span className="font-semibold text-white">₹{selectedTx.gstAmount}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-white/10 font-bold text-sm text-[#fd8a42]">
                  <span>Total Amount:</span>
                  <span>₹{selectedTx.totalAmount} {selectedTx.currency || 'INR'}</span>
                </div>
              </div>

              {selectedTx.rejectionReason && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-rose-300 uppercase">Rejection Reason</div>
                  <div className="text-[11px] text-rose-200">{selectedTx.rejectionReason}</div>
                </div>
              )}

              {selectedTx.waivedBy && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-blue-300 uppercase">Fee Waived by Admin</div>
                  <div className="text-[11px] text-blue-200">
                    Admin: <strong>{selectedTx.waivedBy}</strong> | Reason: {selectedTx.waiveReason}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                {selectedTx.status !== 'PAID' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleVerifyPayment(selectedTx)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ Verify Payment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReject(selectedTx)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>✕ Reject Payment</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL WITH PRESET REASONS */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-[#1a0c2e] border border-rose-500/40 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-white">Reject Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingTx(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting payment for <strong>{rejectingTx.userName || rejectingTx.userId}</strong> (@{rejectingTx.userId}).
              The status will be updated to <span className="text-rose-400 font-bold">PAYMENT_REJECTED</span> and the companion will see the reason so they can re-enter their Transaction ID / UTR.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Select Rejection Reason:
              </label>
              <select
                value={rejectionReasonType}
                onChange={(e) => setRejectionReasonType(e.target.value)}
                className="w-full bg-[#201033] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
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
                <label className="text-xs font-semibold text-slate-300 block">
                  Custom Rejection Reason:
                </label>
                <textarea
                  required
                  rows={3}
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="Explain why this payment reference or transaction is being rejected..."
                  className="w-full bg-[#201033] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400 placeholder:text-slate-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingTx(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                ✕ Reject Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WAIVE FEE CONFIRMATION MODAL */}
      {waivingTx && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleWaiveSubmit}
            className="bg-[#1a0c2e] border border-amber-500/30 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Waive Registration Fee</h3>
              </div>
              <button
                type="button"
                onClick={() => setWaivingTx(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are overriding the pending fee for <strong>{waivingTx.userName}</strong> (@{waivingTx.userId}). This marks the user as registered and creates an audit compliance log.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reason for Waiving Fee (Required for Audit Compliance)
              </label>
              <textarea
                required
                rows={3}
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="e.g. Navratri promotional launch waiver or offline verification..."
                className="w-full bg-[#201033] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWaivingTx(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                Confirm &amp; Waive Fee
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
