import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { X, CheckCircle2, ShieldCheck, Key, Copy, Check, RefreshCw, AlertCircle, Sparkles, Award } from 'lucide-react';
import { useSuperAdmin } from '../super-admin/context/SuperAdminContext';
import { verifyCompletionOtpInDb } from '../services/dbService';

interface CompletionOtpModalProps {
  booking: Booking;
  onClose: () => void;
  onVerifiedSuccess?: () => void;
  role?: string;
  companionId?: string;
}

export const CompletionOtpModal: React.FC<CompletionOtpModalProps> = ({
  booking,
  onClose,
  onVerifiedSuccess,
  role,
  companionId,
}) => {
  const { verifyCompletionOtp, resendCompletionOtp } = useSuperAdmin();

  // Determine user role (customer vs companion)
  const effectiveRole = (
    role ||
    localStorage.getItem('navratri_user_role') ||
    localStorage.getItem('activeRole') ||
    'customer'
  ).toLowerCase().trim();
  const isCompanion = effectiveRole === 'companion';

  // Current OTP value from booking or fallback
  const [currentOtp, setCurrentOtp] = useState<string>(
    booking.completionOtp || '8492'
  );
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  // Resend OTP Cooldown timer (30 seconds)
  const [cooldown, setCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(currentOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleResend = () => {
    if (!canResend) return;
    const newOtp = resendCompletionOtp(booking.id);
    setCurrentOtp(newOtp);
    setCooldown(30);
    setCanResend(false);
    setError(null);
    setEnteredOtp('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!enteredOtp.trim() || enteredOtp.trim().length < 4) {
      setError('Please enter the full 4-digit Completion OTP.');
      return;
    }

    setIsVerifying(true);

    try {
      // 1. Try real server-side API verification first
      const dbRes = await verifyCompletionOtpInDb(booking.id, enteredOtp, companionId);
      if (dbRes.success) {
        verifyCompletionOtp(booking.id, enteredOtp);
        setIsVerifying(false);
        setSuccess(true);
        setTimeout(() => {
          if (onVerifiedSuccess) onVerifiedSuccess();
          onClose();
        }, 1800);
        return;
      }

      // 2. If server reported an error, check if local context accepts it
      const localOk = verifyCompletionOtp(booking.id, enteredOtp);
      setIsVerifying(false);

      if (localOk) {
        setSuccess(true);
        setTimeout(() => {
          if (onVerifiedSuccess) onVerifiedSuccess();
          onClose();
        }, 1800);
      } else {
        setError(dbRes.errorMessage || 'Invalid Completion OTP. Please enter the correct 4-digit code provided by the customer.');
      }
    } catch (err: any) {
      const localOk = verifyCompletionOtp(booking.id, enteredOtp);
      setIsVerifying(false);
      if (localOk) {
        setSuccess(true);
        setTimeout(() => {
          if (onVerifiedSuccess) onVerifiedSuccess();
          onClose();
        }, 1800);
      } else {
        setError(err?.message || 'Error verifying completion OTP. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/40 flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#311042] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Key className="w-5 h-5 text-[#fd8a42]" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                {isCompanion ? 'Completion OTP Verification' : 'Customer Completion OTP'}
              </h3>
              <p className="text-[11px] text-[#596579]">
                {isCompanion
                  ? 'Verify 4-digit OTP provided by customer to complete session'
                  : 'Share this OTP with your companion after Garba concludes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#dee9fc] flex items-center justify-center text-[#12001f] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4 text-[#12001f]">
          {success ? (
            <div className="py-6 text-center space-y-3 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Meeting Completed Successfully!
                </h4>
                <p className="text-xs text-[#596579]">
                  Completion OTP verified for Pass #{booking.id}.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-950">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Payout Queued for Admin Confirmation</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Companion earnings of <strong>₹{booking.baseFee.toLocaleString('en-IN')}</strong> are marked as <em>"Ready for Admin Payout"</em>. Platform Operations Admin will confirm payout transfer.
                </p>
              </div>
            </div>
          ) : isCompanion ? (
            /* COMPANION SIDE: ONLY OTP input & verify form. NEVER shows Customer OTP value. */
            <>
              <div className="p-3 bg-[#f5f8ff] rounded-2xl border border-[#cec3ce]/40 text-xs text-[#596579] leading-relaxed">
                Ask <strong>{booking.customerName || 'the customer'}</strong> for their 4-digit Completion OTP once the Garba event is completed.
              </div>

              <form onSubmit={handleVerify} className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-[#12001f]">
                      Completion OTP
                    </label>
                  </div>

                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    placeholder="Enter 4-digit OTP"
                    className="w-full text-center font-mono text-xl tracking-widest bg-slate-50 border border-[#cec3ce]/60 rounded-xl py-3 px-4 text-[#12001f] focus:outline-none focus:border-[#311042] focus:ring-1 focus:ring-[#311042] transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length < 4}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#311042] to-[#9b4500] hover:from-[#12001f] hover:to-[#763300] active:scale-[0.99] text-white font-['Plus_Jakarta_Sans'] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <span>Verifying Completion OTP...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#ffdbca]" />
                      <span>Verify OTP &amp; Complete Session</span>
                    </>
                  )}
                </button>
              </form>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Important:</strong> Verifying Completion OTP confirms that your Navratri meeting has ended safely and queues your earnings payout.
              </div>
            </>
          ) : (
            /* CUSTOMER SIDE: ONLY shows Customer Completion OTP card. NEVER shows companion OTP verification form. */
            <>
              <div className="bg-[#f5f8ff] p-4 rounded-2xl border border-[#cec3ce]/40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#596579] tracking-wider">
                    Customer Completion OTP
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Linked to Pass #{booking.id}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="font-mono text-2xl font-black text-[#311042] tracking-widest">
                    {currentOtp}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-3 py-1.5 rounded-lg bg-[#311042] hover:bg-[#9b4500] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy OTP</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#596579] leading-relaxed">
                  Provide this 4-digit Completion OTP to companion <strong>{booking.companionName}</strong> after finishing your Garba session.
                </p>
              </div>

              {/* Customer Resend OTP Option */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[#596579]">Need a new OTP code?</span>
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResend}
                  className="text-xs text-[#9b4500] font-bold hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${!canResend ? 'animate-spin' : ''}`} />
                  <span>
                    {canResend ? 'Regenerate OTP' : `Regenerate in ${cooldown}s`}
                  </span>
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Safety Notice:</strong> Only share this code with companion <strong>{booking.companionName}</strong> once you have safely concluded your festival time. Never share this code beforehand.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
