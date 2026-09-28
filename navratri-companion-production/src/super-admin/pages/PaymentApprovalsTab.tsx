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
  Radio
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
  fetchPaymentApprovalsFromDb,
  approvePaymentInDb,
  rejectPaymentInDb,
  DbPaymentApprovalRequest,
} from '../../services/dbService';

export const PaymentApprovalsTab: React.FC = () => {
  const {
    customers,
    confirmUserPayment,
    rejectUserPayment,
    currentAdmin,
    registrationFeeConfig,
  } = useSuperAdmin();

  const [dbRequests, setDbRequests] = useState<DbPaymentApprovalRequest[]>([]);
  const [dbConnected, setDbConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load from Central Database
  const loadApprovals = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const res = await fetchPaymentApprovalsFromDb();
      if (res.success && Array.isArray(res.requests)) {
        setDbRequests(res.requests);
        setDbConnected(true);
      } else {
        setDbConnected(false);
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
      req.paymentReference.toLowerCase().includes(search.toLowerCase());

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
    setRejectionReason('Invalid payment reference / Transaction not found in bank statement');
  };

  const handleConfirmReject = async () => {
    if (!rejectingUserId) return;
    try {
      const adminName = currentAdmin?.name || currentAdmin?.adminId || 'Master Admin';
      const res = await rejectPaymentInDb(rejectingUserId, rejectionReason, adminName);
      
      // Update local context
      rejectUserPayment(rejectingUserId, rejectionReason);

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
      setRejectionReason('');
      await loadApprovals(true);
      setTimeout(() => setActionToast(null), 5000);
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error rejecting payment', type: 'error' });
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

      {/* Header Banner */}
      <div className="bg-[#160b24] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#fd8a42]/10 border border-[#fd8a42]/30 text-[#fd8a42]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Payment Approvals Queue</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review user registration payments from central database, verify UPI references, approve accounts, and authorize website login access.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced with Central Database
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
              <span>Pending: <strong className="text-white font-bold">{pendingCount}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approved: <strong className="text-white font-bold">{approvedCount}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Rejected: <strong className="text-white font-bold">{rejectedCount}</strong></span>
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
            placeholder="Search by User ID, Name, Email, Mobile, or Payment Ref..."
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
            <option value="all">All Payment Statuses ({allApprovalRequests.length})</option>
            <option value="pending">Pending Verification ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-[#160b24] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1030] text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">User ID & Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Payment Reference</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && allApprovalRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#fd8a42]" />
                      <span>Loading registration payments from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-xs font-medium">
                    {allApprovalRequests.length === 0
                      ? 'No registration payments found in database. Once a user signs up and submits payment on their device, it will appear here instantly.'
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
                            {req.role === 'companion' ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#fd8a42]/10 text-[#fd8a42] border border-[#fd8a42]/30">
                                Host
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30">
                                Booker
                              </span>
                            )}
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
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      {req.status === 'Pending Verification' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req.userId, req.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                            title="Approve payment & activate account"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Payment</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(req.userId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                            title="Reject payment reference"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : req.status === 'Approved' ? (
                        <span className="text-[11px] text-emerald-400/80 font-medium italic">
                          Activated by Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApprove(req.userId, req.name)}
                          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10 transition-colors cursor-pointer"
                        >
                          Re-Approve
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

      {/* Reject Payment Reason Modal */}
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
              Rejecting payment for User ID <strong className="text-white">@{rejectingUserId}</strong> will keep their account inactive and prevent them from logging in.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">Rejection Reason for User & Audit Log:</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full bg-[#201033] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-500"
                placeholder="Specify reason (e.g. Invalid UTR reference number or payment not received)..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingUserId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg"
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
