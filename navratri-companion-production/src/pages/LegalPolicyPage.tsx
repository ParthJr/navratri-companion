import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Shield,
  RotateCcw,
  Users,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Printer,
  Share2,
} from 'lucide-react';
import { INITIAL_LEGAL_POLICIES, LegalPolicyItem } from '../data/legalPoliciesData';

interface LegalPolicyPageProps {
  initialPolicy?: 'terms' | 'privacy' | 'safety' | 'cancellation' | 'community' | 'grievance';
  onOpenReportModal?: (category?: string, targetName?: string) => void;
  onNavigateToBooking?: () => void;
}

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({
  initialPolicy = 'terms',
  onOpenReportModal,
  onNavigateToBooking,
}) => {
  const [activePolicyId, setActivePolicyId] = useState<string>(initialPolicy);
  const [policies, setPolicies] = useState<LegalPolicyItem[]>(() => {
    const saved = localStorage.getItem('navratri_legal_policies_config');
    return saved ? JSON.parse(saved) : INITIAL_LEGAL_POLICIES;
  });

  useEffect(() => {
    if (initialPolicy) {
      setActivePolicyId(initialPolicy);
    }
  }, [initialPolicy]);

  // Scroll to top on policy change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePolicyId]);

  const activePolicy = policies.find((p) => p.id === activePolicyId) || policies[0];

  const getPolicyIcon = (id: string, className = 'w-5 h-5') => {
    switch (id) {
      case 'terms':
        return <FileText className={className} />;
      case 'privacy':
        return <Lock className={className} />;
      case 'safety':
        return <Shield className={className} />;
      case 'cancellation':
        return <RotateCcw className={className} />;
      case 'community':
        return <Users className={className} />;
      case 'grievance':
        return <HelpCircle className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  const policyNavigationItems = [
    { id: 'terms', label: 'Terms & Conditions', badge: 'Binding' },
    { id: 'privacy', label: 'Privacy Policy', badge: 'DPDPA 2023' },
    { id: 'safety', label: 'Safety & Disclaimer', badge: 'Critical' },
    { id: 'cancellation', label: 'Cancellation & Refunds', badge: 'Escrow' },
    { id: 'community', label: 'Community Guidelines', badge: 'Conduct' },
    { id: 'grievance', label: 'Contact & Grievance Support', badge: 'Statutory' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      {/* Header Banner */}
      <section className="bg-[#12001f] text-white py-14 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden border-b border-purple-900/40">
        <div className="absolute inset-0 bg-radial-at-t from-purple-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-[#ffdbca] text-xs font-bold uppercase tracking-wider border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-[#fd8a42]" />
            <span>Official Platform Legal &amp; Policy Center</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl sm:text-4xl text-white tracking-tight">
            Trust, Safety &amp; Legal Framework
          </h1>
          <p className="text-xs sm:text-sm text-[#e6eeff]/90 max-w-2xl mx-auto leading-relaxed">
            Our binding policies govern platonic cultural bookings, 256-bit escrow protection, data privacy under Indian Law, and statutory grievance mechanisms for Navratri 2026.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              IT Act 2000 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              DPDPA 2023 Enforced
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              E-Commerce Rules 2020
            </span>
          </div>
        </div>
      </section>

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky Left Navigation Menu */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#cec3ce]/40 shadow-sm sticky top-24 space-y-3">
              <div className="px-3 pt-2 pb-1 text-xs font-bold text-[#596579] uppercase tracking-wider">
                Legal &amp; Policy Directory
              </div>

              <nav className="space-y-1.5" aria-label="Legal Policies Directory">
                {policyNavigationItems.map((item) => {
                  const isCurrent = activePolicyId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePolicyId(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all text-xs font-medium cursor-pointer ${
                        isCurrent
                          ? 'bg-[#311042] text-white shadow-md shadow-purple-950/20 font-semibold'
                          : 'bg-slate-50 hover:bg-[#eff4ff] text-[#12001f] border border-transparent hover:border-[#cec3ce]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isCurrent ? 'bg-white/10 text-white' : 'bg-white text-[#9b4500] border border-[#cec3ce]/30'
                          }`}
                        >
                          {getPolicyIcon(item.id, 'w-4 h-4')}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isCurrent
                            ? 'bg-[#ffdbca] text-[#12001f]'
                            : 'bg-slate-200/70 text-[#596579]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Action Assistance Box */}
              <div className="pt-4 border-t border-[#cec3ce]/30 space-y-2.5">
                <div className="text-xs font-bold text-[#12001f]">
                  Need Immediate Help?
                </div>
                <button
                  onClick={() => onOpenReportModal && onOpenReportModal()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Report Concern / Problem</span>
                </button>

                <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#cec3ce]/30 text-[11px] text-[#596579] space-y-1">
                  <div className="font-bold text-[#12001f] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#9b4500]" />
                    <span>24/7 Safety Helpline</span>
                  </div>
                  <div>Toll-Free: <strong className="text-[#12001f]">1800 200 9090</strong></div>
                  <div>Emergency SOS: <strong className="text-rose-700">112 / 181</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Document Content */}
          <div className="lg:col-span-8 space-y-6">
            <article className="bg-white rounded-3xl p-6 sm:p-10 border border-[#cec3ce]/40 shadow-sm space-y-8">
              {/* Document Header Meta */}
              <div className="border-b border-[#cec3ce]/30 pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#9b4500]">
                    {getPolicyIcon(activePolicy.id, 'w-4 h-4 text-[#9b4500]')}
                    <span>Navratri Companion Legal Framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold bg-[#eff4ff] text-[#311042] px-2.5 py-1 rounded-lg border border-[#cec3ce]/40">
                      Version: {activePolicy.version}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#596579] transition-colors text-xs flex items-center gap-1"
                      title="Print this policy document"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px] font-semibold">Print</span>
                    </button>
                  </div>
                </div>

                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-[#12001f] tracking-tight">
                  {activePolicy.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#596579]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#9b4500]" />
                    <span>Effective Date: <strong className="text-[#12001f]">{activePolicy.effectiveDate}</strong></span>
                  </div>
                  <div>•</div>
                  <div>Last Updated: <strong className="text-[#12001f]">{activePolicy.lastUpdated}</strong></div>
                </div>

                {/* Summary Highlight Box */}
                <div className="p-4 rounded-2xl bg-[#eff4ff]/80 border border-[#cec3ce]/30 text-xs text-[#12001f] leading-relaxed">
                  <strong className="text-[#311042] block mb-1">Executive Summary:</strong>
                  {activePolicy.summary}
                </div>
              </div>

              {/* Document Sections */}
              <div className="space-y-8">
                {activePolicy.sections.map((section, idx) => (
                  <section key={section.id || idx} className="space-y-3.5 scroll-mt-28">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f] flex items-center gap-2 border-l-4 border-[#311042] pl-3">
                      {section.heading}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#404c5e] leading-relaxed text-justify">
                      {section.content}
                    </p>

                    {section.subsections && section.subsections.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 pt-2">
                        {section.subsections.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-50/80 p-4 rounded-xl border border-[#cec3ce]/30 space-y-1.5"
                          >
                            <h4 className="font-bold text-xs sm:text-sm text-[#12001f] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9b4500] shrink-0" />
                              {sub.title}
                            </h4>
                            <p className="text-xs text-[#596579] leading-relaxed pl-3">
                              {sub.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Grievance & Support Fast-Access Footer for Every Policy */}
              <div className="pt-8 border-t border-[#cec3ce]/40 space-y-4">
                <div className="bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] p-5 rounded-2xl border border-[#cec3ce]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#12001f] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#9b4500]" />
                      <span>Questions about our legal terms or privacy handling?</span>
                    </div>
                    <p className="text-xs text-[#596579]">
                      Contact our Grievance Desk at <span className="font-semibold text-[#12001f]">grievance@navratricompanion.com</span> or file a formal complaint ticket.
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePolicyId('grievance')}
                    className="px-4 py-2 rounded-xl bg-[#311042] hover:bg-[#481861] text-white text-xs font-semibold shrink-0 transition-colors"
                  >
                    View Grievance Officer Desk
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
