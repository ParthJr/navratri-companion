import React from 'react';
import { Search, Calendar, ShieldCheck, HeartHandshake, CheckCircle, ArrowRight, MapPin, Award } from 'lucide-react';

interface HowItWorksPageProps {
  onFindCompanion: () => void;
  onBecomeCompanion: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onFindCompanion,
  onBecomeCompanion,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Find Verified Local Partners',
      description:
        'Browse background-checked Gujarati hosts. Check their Garba expertise, photo style, verified reviews, and cultural experience.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Choose Date & Custom Package',
      description:
        'Pick your festive night (Oct 11–19, 2026) and select between 2-Hour (Standard Garba & Candids) or 4-Hour (Full evening dance, instructions, & late-night food crawl).',
      icon: Calendar,
    },
    {
      num: '03',
      title: 'Lock Pass with 256-Bit Escrow',
      description:
        'Pay safely via UPI, NetBanking, or Card. Your fee is held in escrow and never released to the companion until you complete mutual arrival check-in at your agreed meeting place.',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: 'Agree on Meeting Place & Celebrate',
      description:
        'Mutually finalize a convenient, well-lit public festival spot with your companion. Enjoy platonic dance camaraderie, step guidance, and festive memories!',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="w-full bg-[#f8f9ff]">
      {/* Hero */}
      <section className="bg-[#12001f] text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <span className="text-[#ffdbca] text-xs font-bold uppercase tracking-wider">
            Festival Guide 2026
          </span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            How Navratri Companion Works
          </h1>
          <p className="text-sm sm:text-base text-[#e6eeff] leading-relaxed max-w-2xl mx-auto">
            A safe, transparent platform connecting solo festival-goers, tourists, and dance enthusiasts with verified local Gujarati cultural companions.
          </p>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl sm:text-3xl text-[#12001f]">
            Four Simple Steps to Authentic Garba
          </h2>
          <p className="text-xs sm:text-sm text-[#596579] mt-2">
            Designed for safety, transparency, and authentic cultural connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#9b4500] flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold text-base">
                      {step.num}
                    </span>
                    <IconComponent className="w-6 h-6 text-[#311042]" />
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#596579] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety Philosophy */}
      <section className="bg-[#eff4ff] py-14 px-4 sm:px-6 lg:px-8 border-t border-[#cec3ce]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#9b4500] uppercase tracking-wider">
              Our Safety Philosophy
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl sm:text-3xl text-[#12001f]">
              Book an Experience, Not a Person
            </h2>
            <p className="text-sm text-[#596579] leading-relaxed">
              Navratri is an ancient, revered Gujarati celebration of music, devotion, and community. We take pride in maintaining 100% non-sexual, safe social companionship.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#12001f]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero tolerance for inappropriate, non-platonic behavior.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Meetings permitted ONLY in open, public festival grounds and mutually agreed spots.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Government ID verification (Aadhaar/Passport) required for all hosts.</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={onFindCompanion}
                className="bg-[#311042] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#9b4500] transition-colors flex items-center gap-2"
              >
                <span>Browse Verified Companions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#cec3ce]/30 shadow-xs space-y-4">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-[#12001f]">Do I need to buy Garba ground passes separately?</h4>
                <p className="text-[#596579] mt-1">
                  Commercial event entry passes (if ticketed) are purchased separately unless mutually arranged with the companion. Free public festival grounds require only standard entry.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-[#12001f]">What if my companion does not arrive?</h4>
                <p className="text-[#596579] mt-1">
                  Because payments are held in escrow, if a companion fails to check in at the scheduled time and agreed meeting place, your full payment is immediately refunded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
