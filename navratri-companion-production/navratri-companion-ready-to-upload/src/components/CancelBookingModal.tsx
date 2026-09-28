import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import { Booking } from '../types';

interface CancelBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirmCancel: (bookingId: string, refundAmount: number) => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  onClose,
  onConfirmCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelledSuccess, setCancelledSuccess] = useState(false);

  // Full refund amount paid by customer
  const refundAmount = booking.totalFee;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmCancel(booking.id, refundAmount);
      setIsProcessing(false);
      setCancelledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/40 flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#cec3ce]/30 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                Cancel Booking Request
              </h3>
              <p className="text-xs text-amber-900 font-mono">Pass #{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center text-amber-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-[#12001f] space-y-4">
          {cancelledSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                Booking Cancelled Successfully
              </h4>
              <p className="text-xs text-[#596579] leading-relaxed max-w-xs">
                Full refund of <strong className="text-emerald-700 font-mono">₹{refundAmount.toLocaleString('en-IN')}</strong> has been initiated to your original payment source.
              </p>
            </div>
          ) : (
            <>
              {/* Question */}
              <div className="text-center py-1">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Are you sure you want to cancel this booking?
                </h4>
                <p className="text-xs text-[#596579] mt-1">
                  Please review the cancellation details below before proceeding.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-[#cec3ce]/40 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#cec3ce]/20">
                  <span className="text-[#596579]">Booking ID:</span>
                  <span className="font-mono font-bold text-[#311042]">#{booking.id}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#cec3ce]/20">
                  <span className="text-[#596579]">Companion:</span>
                  <span className="font-bold text-[#12001f]">{booking.companionName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#cec3ce]/20">
                  <span className="text-[#596579]">Date &amp; Time:</span>
                  <span className="font-medium text-[#12001f]">{booking.date} ({booking.timeSlot})</span>
                </div>

                <div className="flex justify-between py-1 font-bold text-sm text-emerald-700 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                  <span>Refund Amount:</span>
                  <span className="font-mono">₹{refundAmount.toLocaleString('en-IN')} (100% Refund)</span>
                </div>
              </div>

              {/* Policy note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Cancellation Policy:</strong> Cancelling releases companion reservation and revokes companion contact access. Refund will reflect in 1–2 hours.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#12001f] font-bold text-xs transition-colors cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
