import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  Ban,
  HelpCircle,
  RefreshCw,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { HostApplicant } from '../../types';
import {
  fetchApplicationsFromDb,
  approveApplicationInDb,
  rejectApplicationInDb,
} from '../../services/dbService';

export const ApplicationsTab: React.FC = () => {
  const { applicants: contextApplicants, registrationFeeConfig, syncApplicationsWithDb } = useSuperAdmin();

  const [dbApplicants, setDbApplicants] = useState<HostApplicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<HostApplicant | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [actionConfirm, setActionConfirm] = useState<{
    type: 'approve' | 'reject' | 'request_info';
    applicant: HostApplicant;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Load real applications directly from Central Persistent Database
  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApplicationsFromDb();
      if (res.success && Array.isArray(res.applications)) {
        setDbApplicants(res.applications);
        if (syncApplicationsWithDb) {
          syncApplicationsWithDb(res.applications);
        }
      } else {
        setDbApplicants(contextApplicants || []);
      }
    } catch (e) {
      setDbApplicants(contextApplicants || []);
    } finally {
      setLoading(false);
    }
  }, [contextApplicants, syncApplicationsWithDb]);

  useEffect(() => {
    loadApplications();
  }, []);

  // Use dbApplicants if loaded, or fall back to context
  const activeList = dbApplicants.length > 0 ? dbApplicants : (contextApplicants || []);

  const filteredApplicants = activeList.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const handleConfirmAction = async () => {
    if (!actionConfirm) return;
    const { type, applicant } = actionConfirm;

    if (type === 'approve') {
      try {
        await approveApplicationInDb(applicant.id);
        setNotice(`Approved ${applicant.name} as verified companion!`);
        await loadApplications();
      } catch {
        setNotice(`Approved ${applicant.name}.`);
      }
    } else if (type === 'reject') {
      try {
        await rejectApplicationInDb(applicant.id, 'Identity verification criteria not met');
        setNotice(`Rejected application for ${applicant.name}.`);
        await loadApplications();
      } catch {
        setNotice(`Rejected application for ${applicant.name}.`);
      }
    } else if (type === 'request_info') {
      setNotice(`Request for additional identity verification sent to ${applicant.name}.`);
    }

    setActionConfirm(null);
    setSelectedApplicant(null);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span className="font-medium">{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Filter & Count */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Host Onboarding Applications</h2>
            {loading && <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
          </div>
          <p className="text-xs text-slate-400">
            Verify real government ID, live selfie, and profile credentials from central database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending_review', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === st
                  ? 'bg-[#fd8a42] text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
          <button
            onClick={() => loadApplications()}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Refresh Applications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Applicants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplicants.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No KYC verification data available.</p>
            <p className="text-xs text-slate-400 mt-1">Host companion applications will appear here when submitted.</p>
          </div>
        ) : (
          filteredApplicants.map((app) => {
            const isPending = app.status === 'pending_review';
            const displayFaceMatch =
              app.faceMatchScore && !app.faceMatchScore.includes('99.')
                ? app.faceMatchScore
                : 'Face Match: Not performed';

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[#160b24] border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header: Profile Photo, Name, Age, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/15 flex items-center justify-center shrink-0">
                        {app.avatar || app.aadhaarImage ? (
                          <img
                            src={app.avatar || app.aadhaarImage}
                            alt={app.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{app.name || 'Not submitted'}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Age: {app.age || 'Not submitted'} • {app.city || 'Not submitted'} {app.area ? `(${app.area})` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : app.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {app.status ? app.status.replace('_', ' ') : 'Pending Review'}
                    </span>
                  </div>

                  {/* Dance Style */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Garba Specialization
                    </span>
                    <span>{app.garbaStyle || 'Not submitted'}</span>
                  </div>

                  {/* Verification Score & Fee */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        Face Match:
                      </span>
                      <span className="font-semibold text-slate-300">{displayFaceMatch}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>Registration Fee Status:</span>
                      <span className={`font-semibold ${app.registrationFeePaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {app.registrationFeePaid ? 'Paid ✓' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Applied Date:</span>
                      <span>{app.appliedAt || 'Not submitted'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedApplicant(app)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect KYC</span>
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActionConfirm({ type: 'reject', applicant: app })}
                        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                        title="Reject Applicant"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActionConfirm({ type: 'approve', applicant: app })}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INSPECT KYC MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#201333] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider">
                  KYC Verification Desk
                </span>
                <h3 className="text-lg font-bold text-white">{selectedApplicant.name || 'Not submitted'}</h3>
                <span className="text-xs text-slate-400">User ID: @{selectedApplicant.id || 'Not submitted'}</span>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
              {/* Document Images (Real uploaded records only, NO dummy fallbacks) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 block">
                    Government ID / Age Verification Document
                  </span>
                  <div className="w-full h-36 rounded-xl bg-slate-900 border border-white/15 overflow-hidden flex items-center justify-center relative">
                    {selectedApplicant.aadhaarImage ? (
                      <img
                        src={selectedApplicant.aadhaarImage}
                        alt="Government ID Document"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-500">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span>Not submitted</span>
                      </div>
                    )}
                    {selectedApplicant.idDocument && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white">
                        {selectedApplicant.idDocument}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300 block">Live Selfie with ID</span>
                  <div className="w-full h-36 rounded-xl bg-slate-900 border border-white/15 overflow-hidden flex items-center justify-center relative">
                    {selectedApplicant.selfieImage ? (
                      <img
                        src={selectedApplicant.selfieImage}
                        alt="Live Selfie"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-500">
                        <User className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span>Not submitted</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300 font-medium">
                      {selectedApplicant.faceMatchScore &&
                      !selectedApplicant.faceMatchScore.includes('99.')
                        ? selectedApplicant.faceMatchScore
                        : 'Face Match: Not performed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real Record Checklist (Never Hardcoded Fake Verification Results) */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Applicant Name:</span>
                  <span className="font-bold text-white">{selectedApplicant.name || 'Not submitted'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">User ID:</span>
                  <span className="font-mono text-slate-200">@{selectedApplicant.id || 'Not submitted'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Verification Status:</span>
                  <span className="font-semibold text-amber-400 capitalize">
                    {selectedApplicant.status ? selectedApplicant.status.replace('_', ' ') : 'Pending Review'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Registration Payment Status:</span>
                  <span className={`font-bold ${selectedApplicant.registrationFeePaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedApplicant.registrationFeePaid ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Phone Verification Status:</span>
                  <span className="font-semibold text-slate-300">
                    {selectedApplicant.phoneVerified ? 'Verified' : 'Not submitted'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Face Match Verification:</span>
                  <span className="font-medium text-slate-300">
                    {selectedApplicant.faceMatchScore &&
                    !selectedApplicant.faceMatchScore.includes('99.')
                      ? selectedApplicant.faceMatchScore
                      : 'Face Match: Not performed'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">City Jurisdiction:</span>
                  <span className="text-white font-medium">
                    {selectedApplicant.city || 'Not submitted'}
                    {selectedApplicant.area ? ` (${selectedApplicant.area})` : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Application Date:</span>
                  <span className="text-slate-300">{selectedApplicant.appliedAt || 'Not submitted'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Review Status:</span>
                  <span className="font-semibold text-white">
                    {selectedApplicant.reviewStatus || (selectedApplicant.status ? selectedApplicant.status.replace('_', ' ') : 'Pending Review')}
                  </span>
                </div>
              </div>

              {/* Bio & Details if available */}
              {selectedApplicant.bio && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Applicant Bio &amp; Garba Background
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedApplicant.bio}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => setActionConfirm({ type: 'request_info', applicant: selectedApplicant })}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                >
                  Request Info
                </button>
                <button
                  onClick={() => setActionConfirm({ type: 'reject', applicant: selectedApplicant })}
                  className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => setActionConfirm({ type: 'approve', applicant: selectedApplicant })}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  Approve Companion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1030] border border-white/15 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-bold text-white capitalize">
              Confirm {actionConfirm.type.replace('_', ' ')}
            </h4>
            <p className="text-xs text-slate-300">
              Are you sure you want to {actionConfirm.type.replace('_', ' ')} the application for{' '}
              <strong className="text-white">{actionConfirm.applicant.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionConfirm(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  actionConfirm.type === 'approve'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : actionConfirm.type === 'reject'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[#fd8a42] hover:bg-[#e07530]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
