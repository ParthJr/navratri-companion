import React from 'react';
import { ShieldCheck, Lock, MapPin, PhoneCall, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  return (
    <div className="w-full bg-[#f8f9ff]">
      {/* Header */}
      <section className="bg-[#12001f] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[#ffdbca] text-xs font-bold uppercase tracking-wider">
            Trust &amp; Community Security
          </span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl sm:text-4xl text-white">
            Safety First, Always
          </h1>
          <p className="text-xs sm:text-sm text-[#e6eeff] max-w-xl mx-auto">
            Our non-negotiable guidelines ensuring dignified, safe, and family-friendly Navratri celebrations across Ahmedabad and Gandhinagar.
          </p>
        </div>
      </section>

      {/* Safety Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
              100% ID &amp; Criminal Check
            </h3>
            <p className="text-xs text-[#596579] leading-relaxed">
              Every prospective companion submits government-issued identification (Aadhaar or Passport), telephone records, and completes local police background screening.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#ffdbca] text-[#9b4500] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
              Mutually Agreed Public Venues
            </h3>
            <p className="text-xs text-[#596579] leading-relaxed">
              All bookings take place at open, public Garba grounds and community festival spaces mutually finalized by guest and companion. Private residence visits or secluded venues are permanently banned.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#311042] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
              Escrow Protection
            </h3>
            <p className="text-xs text-[#596579] leading-relaxed">
              No cash transactions at the venue. Your funds are secured in 256-bit encrypted escrow until the public meetup is validated through mutual check-in.
            </p>
          </div>
        </div>

        {/* Code of Conduct */}
        <div className="bg-[#eff4ff] p-6 sm:p-8 rounded-2xl border border-[#cec3ce]/30 space-y-6">
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
            Community Code of Conduct
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#12001f]">
            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#cec3ce]/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#12001f]">Strict Platonic Relationship</strong>
                <span className="text-[#596579] text-xs">
                  Physical intimacy, inappropriate remarks, or harassment results in immediate permanent ban and handover to Ahmedabad Cyber/Police Cell.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#cec3ce]/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#12001f]">Mutual Consent &amp; Respect</strong>
                <span className="text-[#596579] text-xs">
                  Both guests and companions have the absolute right to terminate a session at any moment if they feel uncomfortable.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#cec3ce]/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#12001f]">Alcohol &amp; Substance Prohibition</strong>
                <span className="text-[#596579] text-xs">
                  Gujarat is a dry state; any consumption of prohibited substances is strictly forbidden at festival grounds.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#cec3ce]/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#12001f]">24/7 On-Ground Support Patrol</strong>
                <span className="text-[#596579] text-xs">
                  We deploy dedicated emergency safety coordinators and rapid helpline support across the festival each evening.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
