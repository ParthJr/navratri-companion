import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { LegalPolicyItem } from '../../data/legalPoliciesData';
import {
  FileText,
  Shield,
  Lock,
  RotateCcw,
  Users,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  History,
  Edit3,
  Eye,
  Save,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const LegalPoliciesTab: React.FC = () => {
  const { legalPolicies, policyAuditHistory, updateLegalPolicy, currentAdmin } = useSuperAdmin();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('terms');
  const [isEditing, setIsEditing] = useState(false);
  const [editVersion, setEditVersion] = useState('');
  const [editEffectiveDate, setEditEffectiveDate] = useState('');
  const [editStatus, setEditStatus] = useState<'published' | 'draft'>('published');
  const [editMandatory, setEditMandatory] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);

  const selectedPolicy = legalPolicies.find((p) => p.id === selectedPolicyId) || legalPolicies[0];

  const getPolicyIcon = (id: string) => {
    switch (id) {
      case 'terms':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'privacy':
        return <Lock className="w-5 h-5 text-purple-400" />;
      case 'safety':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'cancellation':
        return <RotateCcw className="w-5 h-5 text-amber-400" />;
      case 'community':
        return <Users className="w-5 h-5 text-pink-400" />;
      case 'grievance':
        return <HelpCircle className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleStartEdit = (policy: LegalPolicyItem) => {
    setEditVersion(policy.version);
    setEditEffectiveDate(policy.effectiveDate);
    setEditStatus(policy.status);
    setEditMandatory(policy.mandatoryConsentOnSignup);
    setEditSummary(policy.summary);
    setChangeSummary('');
    setIsEditing(true);
  };

  const handleSavePolicy = () => {
    if (!selectedPolicy) return;
    updateLegalPolicy(
      selectedPolicy.id,
      {
        version: editVersion.trim() || selectedPolicy.version,
        effectiveDate: editEffectiveDate.trim() || selectedPolicy.effectiveDate,
        status: editStatus,
        mandatoryConsentOnSignup: editMandatory,
        summary: editSummary.trim() || selectedPolicy.summary,
      },
      changeSummary.trim() || `Updated ${selectedPolicy.shortTitle} metadata and publication parameters.`
    );
    setIsEditing(false);
  };

  const canEdit = currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'operations_admin' || currentAdmin?.role === 'operations_manager';

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#1e1329] to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Legal &amp; Policy Governance Desk
              </h2>
              <p className="text-xs text-slate-400">
                Manage statutory policies, version control, consent enforcement, and audit history compliant with Indian IT Act 2000 &amp; DPDPA 2023.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-purple-300" />
            <span>Policy Audit History ({policyAuditHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Grid: Policy Tabs on Left, Active Policy Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Policy List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Platform Legal Documents ({legalPolicies.length})
          </div>

          <div className="space-y-2">
            {legalPolicies.map((p) => {
              const isSelected = p.id === selectedPolicyId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPolicyId(p.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-900/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5">
                    {getPolicyIcon(p.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-sm text-white truncate">
                        {p.shortTitle}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          p.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-mono text-purple-300">{p.version}</span>
                      <span>•</span>
                      <span>Effective: {p.effectiveDate}</span>
                    </div>

                    {p.mandatoryConsentOnSignup && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 inline-flex">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        <span>Mandatory Consent on Sign Up</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legal Compliance Notice Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Legal Advisory Notice</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              All legal clauses follow statutory guidelines under the <strong>Information Technology Act, 2000</strong>, <strong>DPDPA 2023</strong>, and <strong>Consumer Protection (E-Commerce) Rules 2020</strong>. Only Super Admins and Operations Admins may publish version updates.
            </p>
          </div>
        </div>

        {/* Right Side Policy Detailed View & Editor */}
        <div className="lg:col-span-8 space-y-5">
          {selectedPolicy && (
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    {getPolicyIcon(selectedPolicy.id)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedPolicy.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-purple-300 font-semibold bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                        {selectedPolicy.version}
                      </span>
                      <span>Effective: <strong className="text-slate-200">{selectedPolicy.effectiveDate}</strong></span>
                      <span>Last Updated: <strong className="text-slate-200">{selectedPolicy.lastUpdated}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    canEdit && (
                      <button
                        onClick={() => handleStartEdit(selectedPolicy)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Policy Metadata</span>
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePolicy}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save &amp; Log Audit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Editing Form when isEditing is True */}
              {isEditing && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-4">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" />
                    <span>Editing Policy Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Policy Version
                      </label>
                      <input
                        type="text"
                        value={editVersion}
                        onChange={(e) => setEditVersion(e.target.value)}
                        placeholder="e.g. v1.3.0"
                        className="w-full bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Effective Date
                      </label>
                      <input
                        type="text"
                        value={editEffectiveDate}
                        onChange={(e) => setEditEffectiveDate(e.target.value)}
                        placeholder="e.g. October 1, 2026"
                        className="w-full bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Publication Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as 'published' | 'draft')}
                        className="w-full bg-slate-950/80 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="published">Published (Live to Public &amp; Sign Up)</option>
                        <option value="draft">Draft (Under Internal Legal Review)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={editMandatory}
                          onChange={(e) => setEditMandatory(e.target.checked)}
                          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                        <span>Require Mandatory Checkbox on Sign Up</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Policy Executive Summary
                    </label>
                    <textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950/80 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      Audit Reason / Change Summary (Recorded in Audit Ledger)
                    </label>
                    <input
                      type="text"
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      placeholder="e.g. Clarified refund timelines and updated statutory Grievance Officer desk."
                      className="w-full bg-slate-950/80 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Policy Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Summary &amp; Scope
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPolicy.summary}
                </p>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Document Sections ({selectedPolicy.sections.length})
                </div>

                <div className="space-y-3">
                  {selectedPolicy.sections.map((section, idx) => (
                    <div
                      key={section.id || idx}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                    >
                      <h4 className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{section.heading}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Sec {idx + 1}</span>
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {section.content}
                      </p>

                      {section.subsections && section.subsections.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
                          {section.subsections.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1 text-xs"
                            >
                              <span className="font-semibold text-purple-300 text-[11px] block">
                                • {sub.title}
                              </span>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {sub.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit History Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">
                  Legal Policy Revision &amp; Audit Ledger
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-slate-400">
                Immutable audit history tracking changes to statutory terms, privacy disclosures, and refund parameters.
              </p>

              <div className="space-y-3">
                {policyAuditHistory.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.policyTitle}</span>
                        <span className="font-mono text-[11px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                          {log.previousVersion} → {log.newVersion}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{log.changedAt}</span>
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {log.changeSummary}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-white/5">
                      Authorized by: <strong className="text-slate-300">{log.changedBy}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Close Audit History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
