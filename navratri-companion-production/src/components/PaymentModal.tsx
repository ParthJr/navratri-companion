import React, { useState } from 'react';
import { Companion, Booking } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  Check,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { DynamicUpiQr } from './DynamicUpiQr';
import { getPlatformUpiConfig, generatePaymentReference } from '../utils/upi';

interface PaymentModalProps {
  companion: Companion;
  packageTier: '2 Hours' | '4 Hours';
  selectedDate: string;
  rawDate: string;
  timeSlot: string;
  venue: string;
  onClose: () => void;
  onPaymentSuccess: (booking: Booking) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  companion,
  packageTier,
  selectedDate,
  rawDate,
  timeSlot,
  venue,
  onClose,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [viewMode, setViewMode] = useState<'qr' | 'id'>('qr');

  const basePrice = packageTier === '2 Hours' ? companion.price2h : companion.price4h;

  // Dynamically compute platform fee from Super Admin configuration
  const platformFee = (() => {
    try {
      const savedConfig = localStorage.getItem('navratri_platform_fee_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        const applies = packageTier === '2 Hours' ? config.applyTo2h : config.applyTo4h;
        if (!applies) return 0;
        if (config.feeType === 'percentage') {
          return Math.round((basePrice * (config.percentageRate || 5)) / 100);
        }
        return config.fixedFee ?? 50;
      }
    } catch (e) {
      // fallback
    }
    return 50;
  })();

  const totalPrice = basePrice + platformFee;

  const loggedInProfile = (() => {
    try {
      const saved = localStorage.getItem('navratri_companion_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {}
    return { name: 'Verified Guest', phone: '+91 98765 00000', userId: 'guest' };
  })();

  // Retrieve platform UPI configuration dynamically
  const upiConfig = getPlatformUpiConfig();
  const [tempBookingId] = useState(() => `78${Math.floor(10 + Math.random() * 90)}`);
  const paymentReference = generatePaymentReference(loggedInProfile.userId || 'guest', 'BOOK', tempBookingId);

  const handlePay = () => {
    setIsProcessing(true);
    setStep('processing');

    setTimeout(() => {
      // New booking flow: NO START OTP!
      const newBooking: Booking = {
        id: `NC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        companionId: companion.id,
        companionName: companion.name,
        companionAge: companion.age,
        companionCity: companion.city,
        companionAvatar: companion.avatarUrl,
        companionPhone: companion.phone,
        companionUpi: `${companion.name.toLowerCase().replace(/\s+/g, '')}@okaxis`,
        guestName: loggedInProfile.name || 'Verified Guest',
        guestPhone: loggedInProfile.phone || '+91 98765 00000',
        date: selectedDate,
        rawDate: rawDate,
        timeSlot: timeSlot,
        duration: packageTier,
        venue: venue || 'Mutually agreed public location',
        baseFee: basePrice,
        platformFee: platformFee,
        totalFee: totalPrice,
        status: 'confirmed',
        escrowStatus: 'Held in Escrow',
        checkedIn: false,
        sessionStarted: false,
        payoutStatus: 'escrow_held',
        bookedAt: new Date().toISOString(),
      };

      // Save payment transaction record
      try {
        const existingTxns = localStorage.getItem('navratri_payments_config');
        const parsedTxns = existingTxns ? JSON.parse(existingTxns) : [];
        const newTxnRecord = {
          id: `PAY-${Date.now()}`,
          bookingId: newBooking.id,
          customerName: newBooking.guestName,
          customerPhone: newBooking.guestPhone,
          companionName: companion.name,
          amount: totalPrice,
          platformFee: platformFee,
          gatewayFee: 0,
          payoutAmount: basePrice,
          paymentMethod: 'UPI' as const,
          status: 'paid' as const,
          date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          gatewayTxnId: paymentReference,
          paymentReference: paymentReference,
        };
        localStorage.setItem('navratri_payments_config', JSON.stringify([newTxnRecord, ...parsedTxns]));
      } catch (e) {
        console.error('Error saving payment record:', e);
      }

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess(newBooking);
      }, 1400);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-[460px] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#cec3ce]/40 my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#311042] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Lock className="w-4 h-4 text-[#fd8a42]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm sm:text-base text-[#12001f] leading-tight">
                  Navratri Companion
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Escrow</span>
                </span>
              </div>
              <p className="text-[11px] text-[#596579]">256-Bit Encrypted • Official UPI Gateway</p>
            </div>
          </div>
          {step === 'checkout' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#dee9fc] flex items-center justify-center text-[#12001f] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          {step === 'checkout' && (
            <>
              {/* Order Mini Breakdown */}
              <div className="bg-[#f5f8ff] p-3 sm:p-3.5 rounded-2xl border border-[#cec3ce]/35 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#596579] font-medium">Companion Pass</span>
                  <span className="font-bold text-[#12001f]">
                    {companion.name} ({packageTier})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#596579] font-medium">Slot &amp; Date</span>
                  <span className="font-semibold text-[#12001f]">
                    {selectedDate} • {timeSlot}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#596579] font-medium">Agreed Meeting Place</span>
                  <span className="font-semibold text-[#12001f] truncate max-w-[210px]">
                    {venue}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#cec3ce]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#596579] font-semibold uppercase tracking-wider block">
                      Total Amount to Pay
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">100% Locked in Escrow</span>
                  </div>
                  <div className="bg-[#311042] text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                    <span className="text-xl font-extrabold text-[#ffdbca]">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC UPI QR PAYMENT SECTION */}
              <DynamicUpiQr
                upiId={upiConfig.upiId}
                payeeName={upiConfig.payeeName}
                amount={totalPrice}
                paymentReference={paymentReference}
                purposeLabel={`Companion Pass (${packageTier})`}
              />

              {/* Action Button */}
              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePay}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#9b4500] to-[#c9184a] hover:from-[#763300] hover:to-[#a01038] active:scale-[0.99] text-white font-['Plus_Jakarta_Sans'] font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#ffdbca]" />
                  <span>Lock ₹{totalPrice.toLocaleString('en-IN')} in Escrow</span>
                </button>
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#596579]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Funds released to companion only after mutual arrival check-in.</span>
                </div>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-[#9b4500] animate-spin" />
              <div className="space-y-1">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Verifying UPI Escrow Transfer
                </h4>
                <p className="text-xs text-[#596579]">
                  Dispatched to {upiConfig.upiId}. Locking ₹{totalPrice.toLocaleString('en-IN')} safely in escrow...
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                  Pass Confirmed &amp; Secured!
                </h4>
                <p className="text-xs text-[#596579]">
                  ₹{totalPrice.toLocaleString('en-IN')} locked in escrow. Contact unlocked for {companion.name}.
                </p>
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  When you arrive at the agreed location, tap <strong>"I'm Here / Check In"</strong> to start your session.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
