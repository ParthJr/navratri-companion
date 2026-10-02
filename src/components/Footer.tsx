import React from 'react';
import { ShieldCheck, Scale, Lock, Shield, RotateCcw, Users, HelpCircle, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#eff4ff] border-t border-[#cec3ce]/30 py-12 lg:py-16 text-[#121c2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Column 1: Brand Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-['Plus_Jakarta_Sans'] font-semibold text-xl text-[#12001f]">
              Navratri Companion
            </span>
          </div>
          <p className="text-sm text-[#596579]">Ahmedabad &amp; Gandhinagar</p>
          <p className="text-sm text-[#596579]">October 11–19, 2026</p>
          <div className="mt-2 text-xs text-[#9b4500] font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Verified Platonic Cultural Network
          </div>
        </div>

        {/* Column 2: Legal & Statutory Framework */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-bold tracking-tight text-[#12001f]">Legal &amp; Policies</span>
          <button
            onClick={() => onNavigate('legal-terms')}
            className="text-left text-xs text-[#596579] hover:text-[#12001f] transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#9b4500]" />
            <span>Terms &amp; Conditions</span>
          </button>
          <button
            onClick={() => onNavigate('legal-privacy')}
            className="text-left text-xs text-[#596579] hover:text-[#12001f] transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#9b4500]" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => onNavigate('legal-safety')}
            className="text-left text-xs text-[#596579] hover:text-[#12001f] transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-[#9b4500]" />
            <span>Safety &amp; Disclaimer</span>
          </button>
          <button
            onClick={() => onNavigate('legal-cancellation')}
            className="text-left text-xs text-[#596579] hover:text-[#12001f] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#9b4500]" />
            <span>Cancellation &amp; Refunds</span>
          </button>
          <button
            onClick={() => onNavigate('legal-community')}
            className="text-left text-xs text-[#596579] hover:text-[#12001f] transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#9b4500]" />
            <span>Community Guidelines</span>
          </button>
          <button
            onClick={() => onNavigate('legal-grievance')}
            className="text-left text-xs text-[#596579] hover:text-[#12001f] transition-colors flex items-center gap-1.5 font-semibold text-[#311042]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#9b4500]" />
            <span>Contact / Grievance Support</span>
          </button>
        </div>

        {/* Column 3: Quick Links */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-bold tracking-tight text-[#12001f]">Quick Links</span>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-left text-sm text-[#596579] hover:text-[#12001f] transition-colors"
          >
            Find a Companion
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="text-left text-sm text-[#596579] hover:text-[#12001f] transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('safety')}
            className="text-left text-sm text-[#596579] hover:text-[#12001f] transition-colors"
          >
            Safety Protocols
          </button>
          <button
            onClick={() => onNavigate('help')}
            className="text-left text-sm text-[#596579] hover:text-[#12001f] transition-colors"
          >
            Support &amp; Helpline
          </button>
        </div>

        {/* Column 4: Trust & Statutory Notice */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-bold tracking-tight text-[#12001f]">Trust &amp; Statutory Notice</span>
          <p className="text-xs text-[#596579] leading-relaxed">
            Navratri Companion operates as a technology intermediary under Indian IT Act 2000. All sessions are strictly platonic and public.
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#596579]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit Escrow Security</span>
          </div>
          <div className="text-[11px] text-[#596579]">
            Grievance Officer: <strong className="text-[#12001f]">Mr. Bhavesh Trivedi</strong>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-[#cec3ce]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[#596579] text-xs">
        <p>© 2026 Navratri Companion Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="text-xs text-[#596579]">
          Platonic festival accompaniment network compliant under Indian IT Act 2000.
        </p>
      </div>
    </footer>
  );
};
