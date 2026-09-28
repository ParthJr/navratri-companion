import React, { useState } from 'react';
import { Companion } from '../types';
import { X, CheckCircle, Shield, Clock, MapPin, Star, Calendar } from 'lucide-react';

interface ProfileModalProps {
  companion: Companion | null;
  onClose: () => void;
  onBookNow: (companion: Companion, duration: '2 Hours' | '4 Hours') => void;
  onViewFullProfile: (companion: Companion) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  companion,
  onClose,
  onBookNow,
  onViewFullProfile,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<'2 Hours' | '4 Hours'>('2 Hours');

  if (!companion) return null;

  const currentPrice = selectedDuration === '2 Hours' ? companion.price2h : companion.price4h;

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-[#f8f9ff] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto border border-[#cec3ce]/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-full bg-[#311042] text-white flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold text-xl shadow-sm">
              {companion.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                  {companion.name}, {companion.age}
                </h3>
                {companion.isTopHost && (
                  <span className="bg-[#ffdbca] text-[#682c00] text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Top Host
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#596579] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#9b4500]" />
                {companion.city} • {companion.area} • ID &amp; Phone Verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#e6eeff] flex items-center justify-center text-[#12001f] transition-colors"
            aria-label="Close Profile Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-[#12001f]">
          {/* Trust Banner Inside Modal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#eff4ff] p-4 rounded-xl border border-[#cec3ce]/20">
            <div>
              <span className="text-[11px] text-[#596579] uppercase tracking-wider block font-semibold">
                Verification Status
              </span>
              <span className="font-semibold text-sm text-[#12001f] flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Aadhaar &amp; Police Verified
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#596579] uppercase tracking-wider block font-semibold">
                Response Rate
              </span>
              <span className="font-semibold text-sm text-[#12001f] flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-[#9b4500] shrink-0" />
                {companion.responseRate} ({companion.responseTime})
              </span>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h4 className="text-sm font-bold text-[#12001f] mb-2 flex items-center gap-1.5">
              <span>About {companion.name}</span>
              <div className="flex items-center gap-1 text-xs text-[#9b4500] font-normal ml-auto">
                <Star className="w-3.5 h-3.5 fill-[#9b4500]" />
                <span className="font-bold text-[#12001f]">{companion.rating}</span>
                <span>({companion.reviewCount} reviews)</span>
              </div>
            </h4>
            <p className="text-sm text-[#596579] leading-relaxed bg-white p-3.5 rounded-lg border border-[#cec3ce]/30">
              {companion.fullBio}
            </p>
          </div>

          {/* Included in Experience */}
          <div>
            <h4 className="text-sm font-bold text-[#12001f] mb-2">
              Included in Experience
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-[#596579]">
              {companion.inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#9b4500] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Package Duration Switcher */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#12001f]">Select Experience Duration</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedDuration('2 Hours')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedDuration === '2 Hours'
                    ? 'border-[#9b4500] bg-[#ffdbca]/30 ring-1 ring-[#9b4500]'
                    : 'border-[#cec3ce]/50 bg-white hover:bg-[#eff4ff]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">2 Hours</span>
                  <span className="font-bold text-[#9b4500]">₹{companion.price2h.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-[#596579] mt-1">Standard Garba round &amp; photos</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDuration('4 Hours')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedDuration === '4 Hours'
                    ? 'border-[#9b4500] bg-[#ffdbca]/30 ring-1 ring-[#9b4500]'
                    : 'border-[#cec3ce]/50 bg-white hover:bg-[#eff4ff]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">4 Hours</span>
                  <span className="font-bold text-[#9b4500]">₹{companion.price4h.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-[#596579] mt-1">Full evening celebration &amp; dining</p>
              </button>
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="bg-[#e6eeff] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#cec3ce]/30">
            <div>
              <div className="text-xs text-[#596579]">Total Experience Pass</div>
              <div className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#12001f]">
                ₹{currentPrice.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-[#596579]">for {selectedDuration}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onViewFullProfile(companion)}
                className="flex-1 sm:flex-none border border-[#311042] text-[#311042] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                Full Calendar
              </button>
              <button
                type="button"
                onClick={() => onBookNow(companion, selectedDuration)}
                className="flex-1 sm:flex-none bg-[#311042] text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#9b4500] active:scale-95 transition-all shadow-md"
              >
                Book Experience
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
