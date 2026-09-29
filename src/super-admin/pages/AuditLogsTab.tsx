import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Terminal,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { AuditLogItem } from '../types';

export const AuditLogsTab: React.FC = () => {
  const { auditLogs } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.adminName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat: AuditLogItem['category']) => {
    switch (cat) {
      case 'fees':
        return 'bg-[#fd8a42]/10 text-[#fd8a42] border-[#fd8a42]/30';
      case 'payouts':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'safety':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'companions':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'bookings':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'auth':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white">Security & Operations Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Immutable log of all administrative actions, fee modifications, and financial disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Categories ({auditLogs.length})</option>
            <option value="fees">Fees & Pricing</option>
            <option value="payouts">Payouts & Escrow</option>
            <option value="companions">Companions & KYC</option>
            <option value="safety">Safety Desk</option>
            <option value="bookings">Bookings & Check-ins</option>
            <option value="auth">Admin Authentication</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-white font-semibold font-sans whitespace-nowrap">
                    {log.adminName}
                    <span className="block text-[10px] text-slate-500 uppercase">{log.adminRole.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4 text-white font-sans font-medium whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryBadge(log.category)}`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans max-w-sm">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
