import React, { useState } from 'react';
import { Companion, Booking } from '../types';
import {
  ChevronRight,
  MapPin,
  CheckCircle,
  Star,
  Info,
  Lock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  MessageCircle,
  Check
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

interface ProfileBookingPageProps {
  companion: Companion | null;
  onBackToMarketplace: () => void;
  onBookingComplete: (booking: Booking) => void;
  onNavigateToLegalPolicy?: (policyId: string) => void;
}

export const ProfileBookingPage: React.FC<ProfileBookingPageProps> = ({
  companion,
  onBackToMarketplace,
  onBookingComplete,
  onNavigateToLegalPolicy,
}) => {
  if (!companion) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-[#cec3ce]/30 text-center space-y-4 shadow-sm">
        <h3 className="font-bold text-lg text-[#12001f]">No Companion Selected</h3>
        <p className="text-xs text-[#596579]">Please select a companion profile from the marketplace to continue.</p>
        <button
          onClick={onBackToMarketplace}
          className="px-5 py-2 rounded-xl bg-[#311042] text-white text-xs font-semibold hover:bg-[#9b4500] transition-colors"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }
  const [selectedDuration, setSelectedDuration] = useState<'2 Hours' | '4 Hours'>('2 Hours');
  const [selectedDate, setSelectedDate] = useState('Oct 15');
  const [selectedTime, setSelectedTime] = useState('7:00 PM – 9:00 PM');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeSafety, setAgreeSafety] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);

  const dates = [
    { day: 'Sat', num: '11', raw: 'oct11' },
    { day: 'Sun', num: '12', raw: 'oct12' },
    { day: 'Mon', num: '13', raw: 'oct13' },
    { day: 'Tue', num: '14', raw: 'oct14' },
    { day: 'Wed', num: '15', raw: 'oct15' },
    { day: 'Thu', num: '16', raw: 'oct16' },
    { day: 'Fri', num: '17', raw: 'oct17' },
    { day: 'Sat', num: '18', raw: 'oct18' },
    { day: 'Sun', num: '19', raw: 'oct19' },
  ];

  const basePrice = selectedDuration === '2 Hours' ? companion.price2h : companion.price4h;
  const platformFee = 50;
  const totalPrice = basePrice + platformFee;
  const formattedFullDate = `${selectedDate}, 2026`;

  const handleContinuePayment = () => {
    if (!agreeTerms || !agreeSafety) {
      alert('Please agree to the Terms, Community Guidelines, and Safety confirmation to proceed.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleWhatsAppBooking = () => {
    if (!agreeTerms || !agreeSafety) {
      alert('Please agree to the Terms, Community Guidelines, and Safety confirmation to proceed.');
      return;
    }
    setShowWhatsAppConfirm(true);
  };

  return (
    <div className="w-full bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#596579] mb-6" aria-label="Breadcrumb">
          <button
            onClick={onBackToMarketplace}
            className="hover:text-[#12001f] transition-colors font-medium"
          >
            Find a Companion
          </button>
          <ChevronRight className="w-4 h-4 text-[#cec3ce]" />
          <span>{companion.city}</span>
          <ChevronRight className="w-4 h-4 text-[#cec3ce]" />
          <span className="text-[#12001f] font-semibold">{companion.name}'s Profile</span>
        </nav>

        {/* Main Grid Layout: 7 Cols Left + 5 Cols Right Sticky */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Details & Experience (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Profile Header Card */}
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden shadow-xs border border-[#cec3ce]/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#9b4500]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Photo Box */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={companion.detailedPhotoUrl || companion.avatarUrl}
                  alt={`Portrait of ${companion.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-[#12001f] shadow-xs">
                  <span className="material-symbols-outlined filled text-emerald-600 text-[14px]">
                    verified
                  </span>
                  <span>ID Verified</span>
                </div>
              </div>

              {/* Info Column */}
              <div className="flex flex-col gap-3 text-center md:text-left flex-1">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl sm:text-3xl text-[#12001f] tracking-tight">
                      {companion.name}, {companion.age}
                    </h1>
                    {companion.isTopHost && (
                      <span className="bg-[#ffdbca] text-[#331200] px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">
                        Top Host
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#596579] flex items-center justify-center md:justify-start gap-1">
                    <MapPin className="w-4 h-4 text-[#9b4500]" />
                    <span>
                      {companion.city} • Response rate: {companion.responseRate} • {companion.reviewCount} reviews
                    </span>
                  </p>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                  <span className="bg-[#e6eeff] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#12001f] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Age Verified ({companion.age})
                  </span>
                  <span className="bg-[#e6eeff] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#12001f] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Phone Verified
                  </span>
                  <span className="bg-[#e6eeff] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#12001f] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Background Checked
                  </span>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                      {companion.rating}
                    </span>
                    <span className="text-[11px] text-[#596579]">
                      Rating ({companion.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="w-[1px] h-8 bg-[#cec3ce]/40" />
                  <div className="flex flex-col">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                      {companion.yearsExperience} Years
                    </span>
                    <span className="text-[11px] text-[#596579]">Navratri Companion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section & Skills */}
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs border border-[#cec3ce]/30">
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                About {companion.name}
              </h2>
              <p className="text-sm sm:text-base text-[#596579] leading-relaxed bg-white p-4 rounded-xl border border-[#cec3ce]/30">
                {companion.fullBio}
              </p>

              {/* Experience Highlights & Skills */}
              <div className="pt-3">
                <span className="text-sm font-bold text-[#12001f] block mb-3">
                  Experience Highlights &amp; Skills
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#cec3ce]/30">
                    <span className="material-symbols-outlined text-[#9b4500]">celebration</span>
                    <span className="text-xs sm:text-sm font-medium text-[#12001f]">Garba Expert</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#cec3ce]/30">
                    <span className="material-symbols-outlined text-[#9b4500]">forum</span>
                    <span className="text-xs sm:text-sm font-medium text-[#12001f]">Conversation</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#cec3ce]/30">
                    <span className="material-symbols-outlined text-[#9b4500]">photo_camera</span>
                    <span className="text-xs sm:text-sm font-medium text-[#12001f]">Photography</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#cec3ce]/30">
                    <span className="material-symbols-outlined text-[#9b4500]">restaurant</span>
                    <span className="text-xs sm:text-sm font-medium text-[#12001f]">Dinner Companion</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#cec3ce]/30">
                    <span className="material-symbols-outlined text-[#9b4500]">event_available</span>
                    <span className="text-xs sm:text-sm font-medium text-[#12001f]">Garba Events</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#cec3ce]/30">
                    <span className="material-symbols-outlined text-[#9b4500]">groups</span>
                    <span className="text-xs sm:text-sm font-medium text-[#12001f]">Family Friendly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Select Package */}
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs border border-[#cec3ce]/30">
              <div className="flex flex-col gap-1">
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                  Select Package
                </h2>
                <p className="text-xs sm:text-sm text-[#596579]">
                  Choose your duration for the Navratri celebration experience.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2 Hours Package */}
                <label
                  className={`relative flex flex-col p-5 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all border-2 ${
                    selectedDuration === '2 Hours'
                      ? 'border-[#fd8a42] ring-1 ring-[#fd8a42] bg-[#fffbf9]'
                      : 'border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="package_tier"
                    value="2 Hours"
                    checked={selectedDuration === '2 Hours'}
                    onChange={() => setSelectedDuration('2 Hours')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                      2 Hours
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#9b4500]">
                      ₹{companion.price2h.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#596579] mb-6 leading-relaxed">
                    Perfect for a quick festive evening, garba round, and photos at the party plot.
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-[#596579]">
                    <span className="font-medium">Standard Pass</span>
                    {selectedDuration === '2 Hours' && (
                      <span className="material-symbols-outlined filled text-[#9b4500] text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                </label>

                {/* 4 Hours Package */}
                <label
                  className={`relative flex flex-col p-5 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all border-2 ${
                    selectedDuration === '4 Hours'
                      ? 'border-[#fd8a42] ring-1 ring-[#fd8a42] bg-[#fffbf9]'
                      : 'border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="package_tier"
                    value="4 Hours"
                    checked={selectedDuration === '4 Hours'}
                    onChange={() => setSelectedDuration('4 Hours')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                      4 Hours
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#9b4500]">
                      ₹{companion.price4h.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#596579] mb-6 leading-relaxed">
                    Extended celebration including garba instruction, dinner accompaniment, and photoshoot.
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-[#596579]">
                    <span className="font-medium text-[#9b4500]">Popular Choice</span>
                    {selectedDuration === '4 Hours' && (
                      <span className="material-symbols-outlined filled text-[#9b4500] text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Availability Calendar Widget */}
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs border border-[#cec3ce]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                    Availability Calendar
                  </h2>
                  <p className="text-xs sm:text-sm text-[#596579]">Navratri 2026 • October 11 – 19</p>
                </div>
                <span className="bg-[#311042] text-white px-3 py-1 rounded-full text-xs font-medium">
                  Ahmedabad Time (IST)
                </span>
              </div>

              {/* Date Strip */}
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 overflow-x-auto pb-1">
                {dates.map((d) => {
                  const isSelected = selectedDate === `Oct ${d.num}`;
                  return (
                    <button
                      key={d.raw}
                      type="button"
                      onClick={() => setSelectedDate(`Oct ${d.num}`)}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-[#311042] text-white shadow-sm ring-2 ring-[#311042]'
                          : 'bg-white text-[#12001f] hover:bg-[#dee9fc]'
                      }`}
                    >
                      <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[#596579]'}`}>
                        {d.day}
                      </span>
                      <span className="font-['Plus_Jakarta_Sans'] font-bold text-base mt-0.5">
                        {d.num}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-semibold text-[#12001f]">
                  Available Time Slots for Selected Date
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTime('7:00 PM – 9:00 PM')}
                    className={`p-3 rounded-xl text-xs font-semibold text-center transition-all ${
                      selectedTime === '7:00 PM – 9:00 PM'
                        ? 'bg-[#311042] text-white shadow-sm'
                        : 'bg-white hover:bg-[#dee9fc] text-[#12001f]'
                    }`}
                  >
                    7:00 PM – 9:00 PM
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTime('9:30 PM – 11:30 PM')}
                    className={`p-3 rounded-xl text-xs font-semibold text-center transition-all ${
                      selectedTime === '9:30 PM – 11:30 PM'
                        ? 'bg-[#311042] text-white shadow-sm'
                        : 'bg-white hover:bg-[#dee9fc] text-[#12001f]'
                    }`}
                  >
                    9:30 PM – 11:30 PM
                  </button>

                  <button
                    type="button"
                    disabled
                    className="p-3 rounded-xl bg-slate-200/70 text-slate-400 text-xs font-medium text-center cursor-not-allowed"
                  >
                    12:00 AM – 2:00 AM (Booked)
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Agree on Meeting Place */}
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs border border-[#cec3ce]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#311042] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                      Agree on Meeting Place
                    </h2>
                    <p className="text-xs sm:text-sm text-[#596579]">
                      Mutually finalized between you and your companion. No platform-restricted venue directory.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-700" />
                  Mutual Agreement
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#cec3ce]/30 space-y-4">
                <div>
                  <label htmlFor="meeting-location-input" className="block text-xs font-bold text-[#12001f] mb-1.5">
                    Proposed or Agreed Meeting Location / Landmark
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#9b4500] absolute left-3.5 top-3" />
                    <input
                      id="meeting-location-input"
                      type="text"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      placeholder="e.g. Near Main Festival Entrance Gate, Food Court, SBR, or mutually agreed location"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                  </div>
                  <p className="text-[11px] text-[#596579] mt-1.5">
                    Enter your agreed meeting spot or landmark. You can coordinate further via unlocked phone and WhatsApp after payment.
                  </p>
                </div>

                {/* Quick Selection Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#596579]">Suggested Options:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Main Festival Ground Entrance Gate',
                      'Central Food & Refreshment Court',
                      'Designated Public Ticket Counter',
                      'Will Coordinate Directly via WhatsApp',
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setMeetingLocation(opt)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          meetingLocation === opt
                            ? 'bg-[#311042] text-white border-[#311042]'
                            : 'bg-slate-50 hover:bg-[#dee9fc] text-[#12001f] border-[#cec3ce]/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safety Requirement:</strong> All rendezvous must take place in open, illuminated public festival environments. Private apartments, residences, and secluded spots are strictly banned.
                  </span>
                </div>
              </div>
            </div>

            {/* Safety & Booking Information Section */}
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs border border-[#cec3ce]/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined filled text-[#9b4500] text-[24px]">
                  verified_user
                </span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                  Safety &amp; Booking Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-white p-4 rounded-xl flex flex-col gap-1 border border-[#cec3ce]/30">
                  <span className="text-xs font-bold text-[#12001f]">Public Meetings Only</span>
                  <p className="text-xs text-[#596579] leading-relaxed">
                    All experiences take place exclusively at open public festival grounds and locations mutually agreed by participants.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl flex flex-col gap-1 border border-[#cec3ce]/30">
                  <span className="text-xs font-bold text-[#12001f]">Non-Sexual Policy</span>
                  <p className="text-xs text-[#596579] leading-relaxed">
                    Purely platonic companion bookings for festive enjoyment, dance, photography, and social connection.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl flex flex-col gap-1 border border-[#cec3ce]/30">
                  <span className="text-xs font-bold text-[#12001f]">Contact Unlock</span>
                  <p className="text-xs text-[#596579] leading-relaxed">
                    Direct phone &amp; WhatsApp contact with {companion.name} unlocks instantly upon successful payment escrow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Summary Card & Wizard Flow (5 Cols) */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-[#eff4ff] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-xl border border-[#cec3ce]/40 relative overflow-hidden">
              {/* Wizard Header / Step Indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-[#cec3ce]/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#12001f] text-white flex items-center justify-center font-bold text-sm">
                    4
                  </span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                    Booking Summary
                  </span>
                </div>
                <span className="text-xs text-[#596579] bg-white px-2.5 py-1 rounded-full font-medium border border-[#cec3ce]/40">
                  Step 4 of 4
                </span>
              </div>

              {/* Selected Options Summary */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#cec3ce]/30 text-xs sm:text-sm">
                  <span className="text-[#596579]">Companion</span>
                  <span className="font-semibold text-[#12001f]">{companion.name} ({companion.city})</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#cec3ce]/30 text-xs sm:text-sm">
                  <span className="text-[#596579]">Selected Date</span>
                  <span className="font-semibold text-[#12001f]">{formattedFullDate}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#cec3ce]/30 text-xs sm:text-sm">
                  <span className="text-[#596579]">Time Slot</span>
                  <span className="font-semibold text-[#12001f]">{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#cec3ce]/30 text-xs sm:text-sm">
                  <span className="text-[#596579]">Package Tier</span>
                  <span className="font-semibold text-[#12001f]">{selectedDuration}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#cec3ce]/30 text-xs sm:text-sm">
                  <span className="text-[#596579]">Agreed Meeting Place</span>
                  <span className="font-semibold text-[#12001f] truncate max-w-[190px]">
                    {meetingLocation.trim() || 'Mutually agreed public location'}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#cec3ce]/30 bg-white p-3.5 rounded-xl border border-[#cec3ce]/40">
                <div className="flex justify-between text-xs sm:text-sm text-[#596579]">
                  <span>Companion booking amount</span>
                  <span className="font-semibold text-[#12001f]">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-[#596579]">
                  <span>+ Platform/booking fee</span>
                  <span className="font-semibold text-[#12001f]">₹{platformFee}</span>
                </div>
                <div className="flex justify-between font-['Plus_Jakarta_Sans'] font-bold text-base sm:text-lg text-[#12001f] pt-2 border-t border-[#cec3ce]/30">
                  <span>= Total amount payable</span>
                  <span className="text-[#9b4500]">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 flex items-center justify-between">
                  <span className="font-medium">✓ Customer Booking Only</span>
                  <span className="text-[10px] text-emerald-700 font-normal">₹499 companion registration fee does not apply</span>
                </div>
              </div>

              {/* Transparency Notice */}
              <div className="bg-[#ffdbca]/40 p-3.5 rounded-xl flex gap-2.5 items-start border border-[#fd8a42]/30">
                <Info className="w-4 h-4 text-[#9b4500] shrink-0 mt-0.5" />
                <p className="text-xs text-[#331200] leading-relaxed">
                  You are paying for the listed social experience and duration. This payment does not include or imply physical intimacy or sexual activity.
                </p>
              </div>

              {/* Checkbox Agreements */}
              <div className="flex flex-col gap-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#311042] rounded"
                  />
                  <span className="text-xs text-[#596579] leading-normal">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToLegalPolicy && onNavigateToLegalPolicy('terms')}
                      className="text-[#311042] font-semibold underline hover:text-[#9b4500]"
                    >
                      Terms &amp; Conditions
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToLegalPolicy && onNavigateToLegalPolicy('community')}
                      className="text-[#311042] font-semibold underline hover:text-[#9b4500]"
                    >
                      Community Guidelines
                    </button>
                    , and{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToLegalPolicy && onNavigateToLegalPolicy('cancellation')}
                      className="text-[#311042] font-semibold underline hover:text-[#9b4500]"
                    >
                      Cancellation &amp; Refund Policy
                    </button>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeSafety}
                    onChange={(e) => setAgreeSafety(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#311042] rounded"
                  />
                  <span className="text-xs text-[#596579] leading-normal">
                    I confirm all meetings will occur in public festival areas mutually agreed with my companion in accordance with{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToLegalPolicy && onNavigateToLegalPolicy('safety')}
                      className="text-[#311042] font-semibold underline hover:text-[#9b4500]"
                    >
                      Safety Rules &amp; Disclaimers
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleContinuePayment}
                  className="w-full bg-[#311042] text-white py-3.5 rounded-xl font-['Plus_Jakarta_Sans'] font-bold text-sm hover:bg-[#9b4500] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#ffdbca]" />
                  <span>Pay ₹{totalPrice.toLocaleString('en-IN')} &amp; Unlock Contact</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Contact Details Locked:</strong> Phone &amp; WhatsApp number will be unlocked immediately on your pass after successful booking payment.
                  </span>
                </div>
              </div>

              {/* Encryption Assurance */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#596579] pt-1">
                <Lock className="w-3.5 h-3.5 text-[#9b4500]" />
                <span>Secure 256-Bit Encrypted Escrow Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentModal && (
        <PaymentModal
          companion={companion}
          packageTier={selectedDuration}
          selectedDate={formattedFullDate}
          rawDate={dates.find((d) => selectedDate === `Oct ${d.num}`)?.raw || 'oct15'}
          timeSlot={selectedTime}
          venue={meetingLocation.trim() || 'Mutually agreed public location'}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(newBooking) => {
            setShowPaymentModal(false);
            onBookingComplete(newBooking);
          }}
        />
      )}

      {/* WhatsApp Booking Confirm Simulation Dialog */}
      {showWhatsAppConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                WhatsApp Coordinator Chat
              </h4>
              <p className="text-xs text-[#596579]">
                Initiate rapid WhatsApp reservation with our verified Navratri Concierge for {companion.name} ({selectedDuration}, {formattedFullDate}).
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWhatsAppConfirm(false)}
                className="flex-1 py-2 text-xs border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWhatsAppConfirm(false);
                  setShowPaymentModal(true);
                }}
                className="flex-1 py-2 text-xs bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
              >
                Proceed to Escrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
