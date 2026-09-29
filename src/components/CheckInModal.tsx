import React, { useState } from 'react';
import { Booking } from '../types';
import { X, MapPin, Calendar, Clock, CheckCircle2, ShieldCheck, HeartHandshake, Loader2, Sparkles, Navigation } from 'lucide-react';

interface CheckInModalProps {
  booking: Booking;
  userName?: string;
  onClose: () => void;
  onConfirmCheckIn: (bookingId: string, checkedInBy: string, checkInTime: string) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  booking,
  userName = 'Rahul Sharma',
  onClose,
  onConfirmCheckIn,
}) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleArrivalCheckIn = () => {
    setIsCheckingIn(true);

    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsCheckingIn(false);
      setSuccess(true);

      setTimeout(() => {
        onConfirmCheckIn(booking.id, `Customer: ${userName}`, nowStr);
      }, 1200);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/30 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9b4500]/10 flex items-center justify-center text-[#9b4500]">
              <Navigation className="w-5 h-5 text-[#9b4500]" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                Arrival &amp; Meeting Check-In
              </h3>
              <p className="text-[11px] text-[#596579]">Confirm meetup to initiate active festival session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#dee9fc] flex items-center justify-center text-[#12001f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 text-[#12001f]">
          {/* Companion Card */}
          <div className="flex items-center gap-3.5 bg-[#eff4ff] p-3.5 rounded-2xl border border-[#cec3ce]/40">
            <img
              src={booking.companionAvatar}
              alt={booking.companionName}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-[#9b4500] tracking-wider block">
                Your Festival Companion
              </span>
              <div className="font-bold text-base text-[#12001f] truncate">
                {booking.companionName} ({booking.companionAge} yrs)
              </div>
              <div className="text-xs text-[#596579] flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#9b4500] shrink-0" />
                <span className="truncate">{booking.venue}</span>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-[#596579]">
            <div className="p-3 bg-slate-50 rounded-xl border border-[#cec3ce]/30">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Booking Date</span>
              <span className="font-bold text-[#12001f]">{booking.date}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-[#cec3ce]/30">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Time Slot</span>
              <span className="font-bold text-[#12001f]">{booking.timeSlot}</span>
            </div>
          </div>

          {/* Flow Indicator (New flow without OTP) */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Arrival Check-In</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Clicking <strong>"I'm Here / Check In"</strong> notifies {booking.companionName} and officially marks your session as active. Escrow funds unlock automatically upon arrival.
            </p>
          </div>

          {/* Check-In Button */}
          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-center space-y-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-600" />
              <p className="font-bold text-sm">Checked In Successfully ✓</p>
              <p className="text-xs text-emerald-800">Session Started! Have an energetic Garba night.</p>
            </div>
          ) : (
            <button
              onClick={handleArrivalCheckIn}
              disabled={isCheckingIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#9b4500] hover:bg-[#763300] active:scale-[0.99] text-white font-['Plus_Jakarta_Sans'] font-bold text-sm shadow-lg shadow-[#9b4500]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming Arrival...</span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-5 h-5" />
                  <span>I'm Here / Check In</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
