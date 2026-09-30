import React from 'react';
import { X, Lock, Sparkles, UserPlus, ShieldCheck } from 'lucide-react';

interface SignUpRequiredModalProps {
  onClose: () => void;
  onSignUp: () => void;
}

export const SignUpRequiredModal: React.FC<SignUpRequiredModalProps> = ({
  onClose,
  onSignUp,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/40 flex flex-col my-auto text-[#12001f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#311042] text-white flex items-center justify-center font-bold shadow-md">
              <Lock className="w-4 h-4 text-[#fd8a42]" />
            </div>
            <span className="font-bold text-sm text-[#12001f] uppercase tracking-wider">
              Verification &amp; Privacy Protocol
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#dee9fc] flex items-center justify-center text-[#12001f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 text-center items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9b4500]/10 to-[#311042]/10 border border-[#9b4500]/30 flex items-center justify-center text-[#9b4500] shadow-inner">
            <Sparkles className="w-8 h-8 text-[#9b4500]" />
          </div>

          <div className="space-y-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#12001f] leading-snug">
              Sign Up to View Companion Profiles
            </h3>
            <p className="text-sm text-[#596579] leading-relaxed">
              Create your account to explore verified companion profiles and continue.
            </p>
          </div>

          <div className="w-full bg-[#eff4ff] p-3.5 rounded-2xl border border-[#cec3ce]/30 text-xs text-[#596579] space-y-1.5 text-left">
            <div className="flex items-center gap-2 font-bold text-[#12001f]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safety &amp; Verification Flow</span>
            </div>
            <p className="text-[11px] leading-normal">
              Free Sign Up → Instant Activation → Explore Verified Profiles &amp; Book Companions Safely
            </p>
          </div>

          <div className="w-full pt-1 flex flex-col gap-2.5">
            <button
              onClick={onSignUp}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#311042] hover:bg-[#9b4500] text-white font-['Plus_Jakarta_Sans'] font-bold text-sm shadow-lg shadow-[#311042]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#fd8a42]" />
              <span>Sign Up Now</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs text-[#596579] hover:text-[#12001f] font-semibold underline"
            >
              Continue Browsing Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
