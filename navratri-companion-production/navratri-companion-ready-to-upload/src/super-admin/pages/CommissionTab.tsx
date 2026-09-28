import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  Save,
  Calculator,
  Building2,
  Star,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

export const CommissionTab: React.FC = () => {
  const { commissionConfig, updateCommissionConfig } = useSuperAdmin();

  const [defaultRate, setDefaultRate] = useState(commissionConfig.defaultCommissionPercentage);
  const [cityRates, setCityRates] = useState({ ...commissionConfig.cityCommissions });
  const [companionOverrides, setCompanionOverrides] = useState({ ...commissionConfig.companionOverrides });

  const [calcBookingValue, setCalcBookingValue] = useState<number>(1499);
  const [calcSelectedRate, setCalcSelectedRate] = useState<number>(defaultRate);
  const [savedBanner, setSavedBanner] = useState(false);

  // Computed Calculator
  const calcCommissionAmount = (calcBookingValue * calcSelectedRate) / 100;
  const calcCompanionPayout = calcBookingValue - calcCommissionAmount;

  const handleCityChange = (city: string, rate: number) => {
    setCityRates((prev) => ({ ...prev, [city]: rate }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommissionConfig({
      defaultCommissionPercentage: Number(defaultRate),
      cityCommissions: cityRates,
      companionOverrides,
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold text-sm">Companion Commission Settings Saved ✓</p>
              <p className="text-[11px] text-slate-300">
                Applied to future companion pass disbursements and escrow calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider">
            Revenue Share Engine
          </span>
          <h2 className="text-lg font-bold text-white">Companion Commission Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic platform commission percentages globally, per city, or for specific top hosts.
          </p>
        </div>

        <div className="text-right text-xs bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
          <span className="text-slate-400 block text-[10px]">Global Default Commission:</span>
          <span className="font-bold text-[#fd8a42] text-sm">
            {commissionConfig.defaultCommissionPercentage}%
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Commission Rules */}
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Commission Percentage Rates
          </h3>

          {/* Default Rate */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Default Global Platform Commission (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={defaultRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDefaultRate(val);
                  setCalcSelectedRate(val);
                }}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#fd8a42]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Standard platform fee retained from companion payout (Default: 15%).
            </p>
          </div>

          {/* City Specific Commissions */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-slate-300 block">
              City-Specific Commission Overrides
            </span>
            {['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara'].map((city) => (
              <div key={city} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {city}
                </span>
                <div className="flex items-center gap-1.5 w-24">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={cityRates[city] ?? 15}
                    onChange={(e) => handleCityChange(city, Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-bold text-right focus:outline-none focus:border-[#fd8a42]"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Companion Specific Overrides */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-slate-300 block">
              Special Host Incentive Overrides
            </span>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-white font-medium">Riya (Top Dancer • 18 Bookings)</span>
              </div>
              <div className="flex items-center gap-1.5 w-20">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={companionOverrides['riya'] ?? 12}
                  onChange={(e) =>
                    setCompanionOverrides((prev) => ({ ...prev, riya: Number(e.target.value) }))
                  }
                  className="w-full bg-[#201033] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-bold text-right"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Commission Matrix</span>
          </button>
        </div>

        {/* Right Column: Live Payout Simulator */}
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-[#fd8a42]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Interactive Payout Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Preview exactly how companion gross earnings and platform commission split on pass completion.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pass Booking Value (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={calcBookingValue}
                    onChange={(e) => setCalcBookingValue(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl pl-8 pr-4 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Applicable Commission Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcSelectedRate}
                    onChange={(e) => setCalcSelectedRate(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    %
                  </span>
                </div>
              </div>

              {/* Simulation Result Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Settlement Breakdown Preview
                </span>

                <div className="flex justify-between text-xs text-slate-300">
                  <span>Guest Paid Booking Base:</span>
                  <span className="font-semibold text-white">₹{calcBookingValue.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-xs text-purple-400">
                  <span>Platform Commission ({calcSelectedRate}%):</span>
                  <span className="font-bold">₹{calcCommissionAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold text-base pt-2 border-t border-white/10">
                  <span>Companion Net Payout:</span>
                  <span>₹{calcCompanionPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-purple-300 block">Automatic Escrow Safeguard</span>
            <p className="text-[11px] leading-relaxed">
              Companion payout is safely held in escrow until arrival check-in is confirmed at the public venue.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
