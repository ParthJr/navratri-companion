import React, { useState } from 'react';
import {
  QrCode,
  Save,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Coins,
  DollarSign,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { DynamicUpiQr } from '../../components/DynamicUpiQr';

export const UpiSettingsTab: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    registrationFeeConfig,
    updateRegistrationFee,
    platformFeeConfig,
    updatePlatformFee,
    addAuditLog,
  } = useSuperAdmin();

  const [platformUpiId, setPlatformUpiId] = useState(systemSettings.platformUpiId || 'navratri.official@okicici');
  const [platformPayeeName, setPlatformPayeeName] = useState(
    systemSettings.platformPayeeName || 'Navratri Companion'
  );
  const [regFee, setRegFee] = useState(registrationFeeConfig.amount || 499);
  const [bookingFee, setBookingFee] = useState(platformFeeConfig.fixedFee || 50);

  const [copiedPreview, setCopiedPreview] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformUpiId.trim()) {
      setValidationError('Please enter a valid official UPI ID.');
      return;
    }
    setValidationError(null);

    updateSystemSettings({
      platformUpiId: platformUpiId.trim(),
      platformPayeeName: platformPayeeName.trim(),
    });

    updateRegistrationFee({
      amount: Number(regFee),
    });

    updatePlatformFee({
      fixedFee: Number(bookingFee),
    });

    addAuditLog(
      'Official Dynamic UPI Settings Updated',
      'fees',
      `Configured official UPI ID: ${platformUpiId.trim()} (${platformPayeeName}), Reg Fee: ₹${regFee}, Booking Pass Fee: ₹${bookingFee}`
    );

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  const handleCopyPreview = () => {
    navigator.clipboard?.writeText(platformUpiId);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#fd8a42]" />
            <span>Platform Official UPI Gateway Settings</span>
          </h2>
          <p className="text-xs text-slate-400">
            UPI is the sole payment rail across all guest passes, companion registrations, and instant payouts.
          </p>
        </div>
        <span className="text-[10px] uppercase font-bold bg-[#fd8a42]/10 text-[#fd8a42] border border-[#fd8a42]/30 px-3 py-1.5 rounded-full w-fit">
          Direct NPCI / UPI Rail
        </span>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">UPI Settings saved and applied across platform checkout modals!</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Configuration Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Official Platform UPI ID (e.g. business@upi)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={platformUpiId}
                    onChange={(e) => {
                      setPlatformUpiId(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="business@upi or navratri.official@okicici"
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPreview}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedPreview ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPreview ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  All customer payments will be generated against this UPI ID.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Merchant Payee Name
                </label>
                <input
                  type="text"
                  required
                  value={platformPayeeName}
                  onChange={(e) => setPlatformPayeeName(e.target.value)}
                  placeholder="Navratri Companion"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Legal name displayed in Google Pay, PhonePe, Paytm, and BHIM apps.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#fd8a42]" />
                    <span>Registration Fee (₹)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={regFee}
                    onChange={(e) => setRegFee(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Charged during companion sign-up.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Booking Pass Fee (₹)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={bookingFee}
                    onChange={(e) => setBookingFee(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Platform fee added to booking total.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Live Dynamic QR Preview Box */}
            <div className="p-5 rounded-2xl bg-[#201033] border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs uppercase font-extrabold text-[#fd8a42] tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Dynamic UPI QR Preview</span>
              </span>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Dynamically generated from <code className="text-emerald-300 font-mono">upi://pay?pa=...</code> string with exact amount and transaction reference note.
              </p>

              <div className="bg-white p-3 rounded-2xl shadow-xl w-full max-w-[280px]">
                <DynamicUpiQr
                  upiId={platformUpiId || 'navratri.official@okicici'}
                  payeeName={platformPayeeName || 'Navratri Companion'}
                  amount={regFee || 499}
                  paymentReference="NC10245-REG"
                  purposeLabel="Registration Fee Preview"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Apply Dynamic UPI Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
