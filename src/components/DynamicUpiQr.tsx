import React, { useEffect, useState } from 'react';
import { generateUpiUri, renderUpiQrCode, validateUpiParams } from '../utils/upi';
import { Copy, Check, Lock, Smartphone, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

interface DynamicUpiQrProps {
  upiId: string;
  payeeName?: string;
  amount: number;
  paymentReference: string;
  purposeLabel?: string;
  onCopyUpi?: () => void;
}

export const DynamicUpiQr: React.FC<DynamicUpiQrProps> = ({
  upiId,
  payeeName = 'Navratri Companion',
  amount,
  paymentReference,
  purposeLabel = 'Platform Payment',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [loading, setLoading] = useState(true);

  const isValid = validateUpiParams(upiId, amount);

  // Construct standard UPI payment URI scheme
  const upiUri = isValid
    ? generateUpiUri({
        upiId,
        payeeName,
        amount,
        transactionNote: paymentReference,
      })
    : '';

  useEffect(() => {
    let isMounted = true;

    if (!isValid) {
      setLoading(false);
      setQrDataUrl(null);
      return;
    }

    setLoading(true);

    renderUpiQrCode(upiUri)
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code data URL:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri, isValid]);

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(paymentReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 text-[#12001f]">
      {/* Dynamic QR Display Box */}
      <div className="w-full relative bg-white p-3 sm:p-4 rounded-2xl border border-[#311042]/20 shadow-sm flex flex-col items-center justify-center">
        {!isValid ? (
          <div className="w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center justify-center p-3 text-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-900 leading-snug">
              Please configure a valid UPI ID and payment amount in Platform Operations Settings.
            </span>
          </div>
        ) : loading ? (
          <div className="w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl">
            <RefreshCw className="w-6 h-6 text-[#9b4500] animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Generating Dynamic QR...</span>
          </div>
        ) : qrDataUrl ? (
          <div className="relative group max-w-full">
            <img
              src={qrDataUrl}
              alt={`UPI QR Code for ${amount} INR`}
              className="w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] object-contain rounded-lg mx-auto"
            />
            {/* Center Brand Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#311042] text-[#fd8a42] px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-md border border-[#fd8a42]/40">
                ₹{amount}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] flex flex-col items-center justify-center text-rose-600 text-xs text-center p-3">
            <AlertTriangle className="w-6 h-6 text-rose-500 mb-1" />
            <span>Failed to render QR Code. Please use UPI ID below.</span>
          </div>
        )}

        <div className="mt-2 text-center px-1">
          <span className="text-[11px] font-bold text-[#311042] uppercase tracking-wider block">
            Scan with GPay, PhonePe, Paytm, BHIM
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Amount: <strong className="text-emerald-700 font-bold">₹{amount}</strong> • {purposeLabel}
          </span>
        </div>
      </div>

      {/* Official UPI ID & Copy Row */}
      <div className="w-full bg-[#f8f9ff] p-3 rounded-2xl border border-[#cec3ce]/40 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-[11px] font-bold text-[#596579] uppercase tracking-wider">
            Official Platform UPI ID
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200">
          <span className="font-mono font-bold text-[#311042] text-xs sm:text-sm truncate min-w-0">
            {upiId}
          </span>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#311042] hover:bg-[#9b4500] text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs min-h-[36px]"
          >
            {copiedUpi ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Reference Note Row */}
      <div className="w-full bg-[#f8f9ff] p-3 rounded-2xl border border-[#cec3ce]/40 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#596579] uppercase tracking-wider">
            <Lock className="w-3 h-3 text-[#9b4500]" />
            <span>Payment Reference</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">(Txn Note)</span>
        </div>

        <div className="flex items-center justify-between gap-2 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200">
          <span className="font-mono font-extrabold text-[#9b4500] text-xs truncate min-w-0">
            {paymentReference}
          </span>
          <button
            type="button"
            onClick={handleCopyRef}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#12001f] text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer min-h-[36px]"
          >
            {copiedRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
            <span>{copiedRef ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 leading-tight">
          This reference is automatically encoded in the QR. Admins use this to match your payment.
        </p>
      </div>

      {/* Direct UPI App Mobile Trigger */}
      <a
        href={upiUri}
        className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
      >
        <Smartphone className="w-4 h-4" />
        <span>Pay ₹{amount} via Installed UPI App</span>
      </a>
    </div>
  );
};
