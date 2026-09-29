import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  Clock,
  Save,
  Check,
  X,
  CreditCard,
  UserCheck,
  FileCheck2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

export const RegistrationFeeTab: React.FC = () => {
  const {
    registrationFeeConfig,
    updateRegistrationFee,
    confirmUserPayment,
    rejectUserPayment,
    customers,
    companions,
    applicants,
    payments,
    getRegistrationRevenue,
  } = useSuperAdmin();

  const [enabled, setEnabled] = useState(registrationFeeConfig.enabled);
  const [feeAmount, setFeeAmount] = useState(registrationFeeConfig.amount);
  const [savedBanner, setSavedBanner] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load pending registration payment accounts from localStorage
  const getPendingPaymentAccounts = () => {
    try {
      const saved = localStorage.getItem('navratri_registered_accounts');
      if (saved) {
        const accounts = JSON.parse(saved);
        if (Array.isArray(accounts)) {
          return accounts.filter(
            (acc: any) =>
              acc.status === 'pending_admin_confirm' ||
              acc.status === 'pending_payment' ||
              acc.feePaid === false
          );
        }
      }
    } catch (e) {}
    return [];
  };

  const pendingAccounts = getPendingPaymentAccounts();

  // Filter real registration transactions from payments context or registered users
  const regPayments = payments.filter(
    (p) => p.id.includes('REG') || p.bookingId.includes('REG')
  );

  const totalCollectedRevenue = getRegistrationRevenue();
  const totalRegisteredCount = customers.length;
  const paidCount = customers.filter(
    (c) => c.registrationFeePaid || c.paymentStatus === 'Approved'
  ).length;
  const pendingCount = pendingAccounts.length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRegistrationFee({
      enabled,
      amount: Number(feeAmount),
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold text-sm">Companion Registration Fee Updated ✓</p>
              <p className="text-[11px] text-slate-300">
                New host signups will be charged ₹{feeAmount} with status {enabled ? 'ACTIVE' : 'DISABLED'}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Registration Fee</span>
          <div className="text-2xl font-black text-white mt-1">₹{registrationFeeConfig.amount}</div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {registrationFeeConfig.enabled ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Registered</span>
          <div className="text-2xl font-black text-white mt-1">
            {totalRegisteredCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Registered platform users</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Paid vs Pending</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {paidCount} <span className="text-sm font-normal text-slate-400">paid</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-2 font-medium">
            {pendingCount} awaiting review
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Collected Revenue</span>
          <div className="text-2xl font-black text-[#fd8a42] mt-1">
            ₹{totalCollectedRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Registration fee revenue</p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Pending Admin Payment Confirmations Section */}
      <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pending Admin Payment Confirmations</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Review user payment submissions. User accounts remain locked until Admin clicks <strong>"Confirm Payment"</strong>.
            </p>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-bold shrink-0">
            {pendingAccounts.length} Pending Admin Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-3">User ID</th>
                <th className="py-3 px-3">Full Name &amp; Phone</th>
                <th className="py-3 px-3">UPI Reference Note</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-3 text-right">Admin Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No pending user registration payments waiting for review.
                  </td>
                </tr>
              ) : (
                pendingAccounts.map((acc: any) => (
                  <tr key={acc.userId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#fd8a42]">
                      @{acc.userId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{acc.name}</div>
                      <div className="text-[10px] text-slate-400">{acc.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-amber-300">
                      {acc.paymentReference || `${acc.userId.toUpperCase()}-REG`}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ₹{registrationFeeConfig.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                        Payment Submitted (Pending Review)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            confirmUserPayment(acc.userId);
                            setActionNotice(`Payment confirmed for @${acc.userId}! Account activated.`);
                            setTimeout(() => setActionNotice(null), 4000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            rejectUserPayment(acc.userId);
                            setActionNotice(`Payment rejected for @${acc.userId}. Account access denied.`);
                            setTimeout(() => setActionNotice(null), 4000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Settings Edit Card */}
      <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Edit Companion Onboarding Fee
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure the mandatory one-time registration and verification fee charged to prospective companion hosts.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          {/* Toggle Enable/Disable */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="text-xs font-semibold text-white block">
                Require Registration Fee on Host Onboarding
              </span>
              <span className="text-[11px] text-slate-400">
                If disabled, companions can submit Aadhaar and register free of charge.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {enabled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enabled</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5 text-slate-500" />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>

          {/* Fee Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Registration Fee Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                max="5000"
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                className="w-full bg-[#201033] border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#fd8a42]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Currently ₹{registrationFeeConfig.amount}. Changing this updates future companion signup requirements.
            </p>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Registration Fee</span>
          </button>
        </form>
      </div>

      {/* Registration Transactions Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider">
            Recent Registration Fee Transactions
          </span>
          <span className="text-xs text-[#fd8a42] font-semibold">
            Total Revenue: ₹{totalCollectedRevenue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Applicant / User</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {regPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No registration fee transactions recorded yet.
                  </td>
                </tr>
              ) : (
                regPayments.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                      {tx.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      Ahmedabad
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      ₹{tx.amount}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {tx.paymentMethod || 'UPI'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          tx.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {tx.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
