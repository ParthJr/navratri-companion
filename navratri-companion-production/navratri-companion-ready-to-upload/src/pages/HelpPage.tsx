import React from 'react';
import { PhoneCall, MapPin, Shield, HelpCircle, FileText, AlertCircle, Users, Navigation, CheckCircle2 } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="w-full bg-[#f8f9ff]">
      <section className="bg-[#12001f] text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-[#ffdbca] text-xs font-bold uppercase tracking-wider">
            Festival Help &amp; Support Guide
          </span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl sm:text-4xl text-white">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-[#e6eeff]">
            Booking assistance, mutual meeting coordination, dress codes, and emergency numbers for Navratri 2026.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Support Hotline Banner */}
        <div className="bg-[#eff4ff] p-6 sm:p-8 rounded-2xl border border-[#cec3ce]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
              24/7 Navratri Central Helpline
            </h3>
            <p className="text-xs sm:text-sm text-[#596579]">
              Live phone and WhatsApp coordination across all 9 nights of the festival in Gujarat.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+917926850000"
              className="bg-[#311042] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#9b4500] transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>+91 79 2685 0000</span>
            </a>
            <a
              href="tel:112"
              className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Emergency 112</span>
            </a>
          </div>
        </div>

        {/* Meeting Place Coordination Guide */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#12001f]">
                Meeting Place Coordination
              </h2>
              <p className="text-xs text-[#596579] mt-1">
                You and your companion mutually finalize your preferred meeting location without admin restrictions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#311042] flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-[#9b4500]" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Mutually Agreed Meeting Place
                </h3>
                <p className="text-xs text-[#596579] leading-relaxed">
                  During booking or directly after unlocking contact, you and your companion decide on a convenient, easily recognizable public spot (such as a festival entrance, food street, or prominent landmark).
                </p>
              </div>
              <div className="pt-3 border-t border-[#cec3ce]/30 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Flexible &amp; Participant-Directed</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#311042] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#9b4500]" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Public &amp; Well-Lit Venues Only
                </h3>
                <p className="text-xs text-[#596579] leading-relaxed">
                  For everyone’s safety, all sessions take place in active, open public spaces with festival crowds. Private home visits, secluded apartments, or private hotel rooms are strictly prohibited.
                </p>
              </div>
              <div className="pt-3 border-t border-[#cec3ce]/30 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Compromise on Safety</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#311042] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#9b4500]" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Instant Contact Unlock
                </h3>
                <p className="text-xs text-[#596579] leading-relaxed">
                  Once your pass is secured with escrow payment, verified phone and WhatsApp details unlock immediately so you can message each other directly and share live location pings on festival nights.
                </p>
              </div>
              <div className="pt-3 border-t border-[#cec3ce]/30 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Seamless Direct Coordination</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 shadow-xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#311042] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-[#9b4500]" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Escrow Payment Guarantee
                </h3>
                <p className="text-xs text-[#596579] leading-relaxed">
                  Your payment is safely held by the platform and released to the companion only after arrival is recorded at the agreed spot. If a companion fails to appear, your payment is 100% refunded.
                </p>
              </div>
              <div className="pt-3 border-t border-[#cec3ce]/30 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Escrow Protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Traditional Navratri Etiquette */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#cec3ce]/30 shadow-xs space-y-4">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
            Festive Attire &amp; Ground Etiquette
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#596579]">
            <div className="p-3 bg-slate-50 rounded-xl">
              <strong className="block text-[#12001f] mb-1">Dress Code</strong>
              <span>
                Traditional Chaniya Choli, Kediyu, or Kurta Pajama is customary for entering central Garba circles at major clubs.
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <strong className="block text-[#12001f] mb-1">Footwear Protocol</strong>
              <span>
                Many premier venues have designated safe shoe-keeping stalls, as dancers perform barefoot or in soft flat juttis on grass.
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <strong className="block text-[#12001f] mb-1">Circle Rotation</strong>
              <span>
                Circles always move counter-clockwise. Your companion will guide you smoothly into intermediate or beginner rings!
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
