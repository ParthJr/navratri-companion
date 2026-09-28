import React, { useState } from 'react';
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
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { PaymentTransaction } from '../types';

export const PaymentsTab: React.FC = () => {
  const { payments } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.gatewayTxnId.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalGross = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalPlatformFees = payments.reduce((acc, p) => acc + p.platformFee, 0);
  const totalGatewayFees = payments.reduce((acc, p) => acc + p.gatewayFee, 0);
  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((acc, p) => acc + (p.refundAmount || p.amount), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Processed Payments</span>
          <div className="text-2xl font-black text-white mt-1">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% via Razorpay Escrow</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Platform Booking Fee Earned</span>
          <div className="text-2xl font-black text-[#fd8a42] mt-1">
            ₹{totalPlatformFees.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Platform retained revenue</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Payment Gateway Fee (2%)</span>
          <div className="text-2xl font-black text-slate-300 mt-1">
            ₹{totalGatewayFees.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct aggregator cost</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Refunds Settled</span>
          <div className="text-2xl font-black text-purple-400 mt-1">
            ₹{totalRefunded.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero-deduction dispute refunds</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction ID, booking ID, or gateway ref..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit/Debit Card">Credit/Debit Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">UPI Reference Note</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Companion</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4">Platform Fee</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Gateway ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-500 font-medium">
                    {payments.length === 0 ? 'No revenue recorded yet' : 'No payments found matching current filter.'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                    {p.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#fd8a42] font-bold whitespace-nowrap">
                    {p.paymentReference || `${p.customerName.slice(0, 3).toUpperCase()}-UPI-PAY`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                    {p.bookingId}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-white">{p.customerName}</div>
                    <div className="text-[10px] text-slate-500">{p.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                    {p.companionName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-white">
                    ₹{p.amount}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-[#fd8a42]">
                    ₹{p.platformFee}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                    {p.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        p.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'refunded'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {p.date}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {p.gatewayTxnId}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
