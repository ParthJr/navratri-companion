import React, { useState } from 'react';
import {
  Percent,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

export const PlatformFeesTab: React.FC = () => {
  const { platformFeeConfig, updatePlatformFee } = useSuperAdmin();

  // Local editing form
  const [feeType, setFeeType] = useState<'fixed' | 'percentage'>(platformFeeConfig.feeType);
  const [fixedFee, setFixedFee] = useState<number>(platformFeeConfig.fixedFee);
  const [percentageRate, setPercentageRate] = useState<number>(platformFeeConfig.percentageRate);
  const [applyTo2h, setApplyTo2h] = useState<boolean>(platformFeeConfig.applyTo2h);
  const [applyTo4h, setApplyTo4h] = useState<boolean>(platformFeeConfig.applyTo4h);

  const [savedBanner, setSavedBanner] = useState(false);

  // Live Simulation Values
  const samplePrice2h = 1499;
  const samplePrice4h = 2799;

  const simFee2h = !applyTo2h
    ? 0
    : feeType === 'fixed'
    ? fixedFee
    : Math.round((samplePrice2h * percentageRate) / 100);

  const simTotal2h = samplePrice2h + simFee2h;

  const simFee4h = !applyTo4h
    ? 0
    : feeType === 'fixed'
    ? fixedFee
    : Math.round((samplePrice4h * percentageRate) / 100);

  const simTotal4h = samplePrice4h + simFee4h;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformFee({
      feeType,
      fixedFee: Number(fixedFee),
      percentageRate: Number(percentageRate),
      applyTo2h,
      applyTo4h,
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold text-sm">Platform Fee Configuration Saved ✓</p>
              <p className="text-[11px] text-slate-300">
                Immediately updated across customer booking flow, payment gateway totals, and admin ledgers without rebuild.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Intro info box */}
      <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider">
            Operational Revenue Setting
          </span>
          <h2 className="text-lg font-bold text-white">Booking Platform Fee Control</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure whether guests pay a flat service fee (e.g. ₹50) or a dynamic percentage on each pass.
          </p>
        </div>

        <div className="text-right text-xs bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
          <span className="text-slate-400 block text-[10px]">Active in Production:</span>
          <span className="font-bold text-[#fd8a42] text-sm">
            {platformFeeConfig.feeType === 'percentage'
              ? `${platformFeeConfig.percentageRate}% Dynamic`
              : `₹${platformFeeConfig.fixedFee} Fixed`}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Updated: {platformFeeConfig.lastUpdated}
          </span>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form Controls */}
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Fee Structure Configuration
          </h3>

          {/* Fee Type Radio Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Fee Calculation Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  feeType === 'fixed'
                    ? 'bg-[#fd8a42]/15 border-[#fd8a42] text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="feeType"
                  checked={feeType === 'fixed'}
                  onChange={() => setFeeType('fixed')}
                  className="hidden"
                />
                <Coins className="w-4 h-4 text-[#fd8a42]" />
                <div>
                  <span className="font-bold text-xs block">Fixed Fee</span>
                  <span className="text-[10px] text-slate-400">Flat ₹ amount per pass</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  feeType === 'percentage'
                    ? 'bg-[#fd8a42]/15 border-[#fd8a42] text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="feeType"
                  checked={feeType === 'percentage'}
                  onChange={() => setFeeType('percentage')}
                  className="hidden"
                />
                <Percent className="w-4 h-4 text-[#fd8a42]" />
                <div>
                  <span className="font-bold text-xs block">Percentage</span>
                  <span className="text-[10px] text-slate-400">% of pass price</span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Input based on Fee Type */}
          {feeType === 'fixed' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Fixed Platform Fee (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={fixedFee}
                  onChange={(e) => setFixedFee(Number(e.target.value))}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default: ₹50. Directly added to guest checkout total.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Percentage Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={percentageRate}
                  onChange={(e) => setPercentageRate(Number(e.target.value))}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Example: 5.0% on ₹1,499 adds ₹74.95 platform fee.
              </p>
            </div>
          )}

          {/* Apply Fee Checkboxes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Apply Fee To Booking Packages:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTo2h}
                  onChange={(e) => setApplyTo2h(e.target.checked)}
                  className="rounded border-white/20 bg-[#201330] text-[#fd8a42] focus:ring-[#fd8a42]/30 w-4 h-4"
                />
                <span className="text-xs text-white font-medium">2 Hour Express Package</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTo4h}
                  onChange={(e) => setApplyTo4h(e.target.checked)}
                  className="rounded border-white/20 bg-[#201330] text-[#fd8a42] focus:ring-[#fd8a42]/30 w-4 h-4"
                />
                <span className="text-xs text-white font-medium">4 Hour Full Night Prime Package</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Fee Configuration</span>
          </button>
        </div>

        {/* Right Column: Live Checkout Preview Simulation */}
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-[#fd8a42]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Customer Checkout Preview
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time calculation seen by customers on checkout with currently configured settings.
            </p>

            <div className="space-y-4">
              {/* 2 Hour Preview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-white">
                  <span>2 Hour Garba Pass</span>
                  <span className="text-slate-400">Sample Price: ₹{samplePrice2h}</span>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-slate-300">
                    <span>Companion Base Price:</span>
                    <span>₹{samplePrice2h}</span>
                  </div>
                  <div className="flex justify-between text-[#fd8a42] font-medium">
                    <span>Platform Fee ({feeType === 'percentage' ? `${percentageRate}%` : 'Fixed'}):</span>
                    <span>+₹{simFee2h}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-white/10">
                    <span>Customer Pays:</span>
                    <span>₹{simTotal2h}</span>
                  </div>
                </div>
              </div>

              {/* 4 Hour Preview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-white">
                  <span>4 Hour Prime Pass</span>
                  <span className="text-slate-400">Sample Price: ₹{samplePrice4h}</span>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-slate-300">
                    <span>Companion Base Price:</span>
                    <span>₹{samplePrice4h}</span>
                  </div>
                  <div className="flex justify-between text-[#fd8a42] font-medium">
                    <span>Platform Fee ({feeType === 'percentage' ? `${percentageRate}%` : 'Fixed'}):</span>
                    <span>+₹{simFee4h}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-white/10">
                    <span>Customer Pays:</span>
                    <span>₹{simTotal4h}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fd8a42]/10 border border-[#fd8a42]/20 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-[#fd8a42] block">Zero Code Deployments Needed</span>
            <p className="text-[11px] leading-relaxed">
              When you hit Save, this fee is automatically persisted in the state engine and affects all forthcoming pass checkouts instantaneously.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
