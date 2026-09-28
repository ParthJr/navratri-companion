import React, { useState } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Phone,
  MessageSquare,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { ComplaintItem } from '../types';

export const ComplaintsTab: React.FC = () => {
  const { complaints, updateComplaintStatus } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.reporterName.toLowerCase().includes(search.toLowerCase()) ||
      c.targetName.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSeverityBadge = (severity: ComplaintItem['severity']) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleResolve = () => {
    if (!selectedComplaint) return;
    updateComplaintStatus(selectedComplaint.id, 'resolved', resolutionInput || 'Resolved by Super Admin with mutual party satisfaction.');
    setSelectedComplaint(null);
    setResolutionInput('');
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
            placeholder="Search complaint ID, reporter, subject, or target..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'open', 'investigating', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#fd8a42] text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Subject & Details</th>
                <th className="py-3.5 px-4">Involved Party</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-medium">
                    {complaints.length === 0 ? 'No complaints' : 'No complaints found matching current filter.'}
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                    {c.id}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-white">{c.reporterName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{c.reporterType} • {c.reporterPhone}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-white font-medium truncate">{c.subject}</div>
                    <div className="text-[10px] text-slate-400 truncate">{c.description}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-200">
                    {c.targetName}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap capitalize text-slate-300">
                    {c.category.replace('_', ' ')}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getSeverityBadge(c.severity)}`}>
                      {c.severity}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        c.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'investigating'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {c.createdAt}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setResolutionInput(c.resolutionNotes || '');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLAINT DETAIL MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#201333] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider">
                  Dispute & Conduct Desk
                </span>
                <h3 className="text-lg font-bold text-white">Ticket #{selectedComplaint.id}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reporter:</span>
                  <span className="font-bold text-white">{selectedComplaint.reporterName} ({selectedComplaint.reporterPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Against Party:</span>
                  <span className="font-bold text-white">{selectedComplaint.targetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Associated:</span>
                  <span className="font-mono text-[#fd8a42]">{selectedComplaint.bookingId || 'General Inquiry'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Subject:</span>
                <p className="font-bold text-white">{selectedComplaint.subject}</p>
                <p className="text-slate-300 mt-2 p-3 rounded-xl bg-white/5 border border-white/5 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Resolution Notes & Admin Action:
                </label>
                <textarea
                  rows={3}
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  placeholder="Enter investigation notes, mutual compromise reached, or policy warning issued..."
                  className="w-full bg-[#201033] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    updateComplaintStatus(selectedComplaint.id, 'investigating');
                    setSelectedComplaint(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold"
                >
                  Mark Under Investigation
                </button>
                <button
                  onClick={handleResolve}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                >
                  Resolve Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
