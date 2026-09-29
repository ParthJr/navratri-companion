import React, { useState, useEffect } from 'react';
import {
  Coins,
  CheckCircle2,
  Save,
  Check,
  X,
  CreditCard,
  Sparkles,
  Percent,
  ShieldAlert,
  History,
  Info,
  Clock,
  User,
  Users,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
  fetchFeeConfigurations,
  updateFeeConfigurationInDb,
  FeeConfiguration,
} from '../../services/dbService';

export const RegistrationFeeTab: React.FC = () => {
  const { currentAdmin, getRegistrationRevenue } = useSuperAdmin();

  // Active Fee Configurations state
  const [fees, setFees] = useState<FeeConfiguration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingFeeCode, setSavingFeeCode] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for individual fee codes
  const [customerRegAmount, setCustomerRegAmount] = useState<number>(0);
  const [customerRegStatus, setCustomerRegStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [customerRegGstEnabled, setCustomerRegGstEnabled] = useState<boolean>(false);
  const [customerRegGstPercentage, setCustomerRegGstPercentage] = useState<number>(18);

  const [customerPlatAmount, setCustomerPlatAmount] = useState<number>(50);
  const [customerPlatStatus, setCustomerPlatStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [customerPlatGstEnabled, setCustomerPlatGstEnabled] = useState<boolean>(true);
  const [customerPlatGstPercentage, setCustomerPlatGstPercentage] = useState<number>(18);

  const [companionRegAmount, setCompanionRegAmount] = useState<number>(499);
  const [companionRegStatus, setCompanionRegStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [companionRegGstEnabled, setCompanionRegGstEnabled] = useState<boolean>(true);
  const [companionRegGstPercentage, setCompanionRegGstPercentage] = useState<number>(18);

  const [companionPlatAmount, setCompanionPlatAmount] = useState<number>(0);
  const [companionPlatStatus, setCompanionPlatStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [companionPlatGstEnabled, setCompanionPlatGstEnabled] = useState<boolean>(false);
  const [companionPlatGstPercentage, setCompanionPlatGstPercentage] = useState<number>(18);

  // Load fee configurations from central database
  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await fetchFeeConfigurations();
      if (res.success && Array.isArray(res.fees)) {
        setFees(res.fees);
        res.fees.forEach((f) => {
          if (f.feeCode === 'CUSTOMER_REGISTRATION') {
            setCustomerRegAmount(f.amount);
            setCustomerRegStatus(f.status);
            setCustomerRegGstEnabled(f.gstEnabled);
            setCustomerRegGstPercentage(f.gstPercentage || 18);
          } else if (f.feeCode === 'CUSTOMER_PLATFORM_FEE') {
            setCustomerPlatAmount(f.amount);
            setCustomerPlatStatus(f.status);
            setCustomerPlatGstEnabled(f.gstEnabled);
            setCustomerPlatGstPercentage(f.gstPercentage || 18);
          } else if (f.feeCode === 'COMPANION_REGISTRATION') {
            setCompanionRegAmount(f.amount);
            setCompanionRegStatus(f.status);
            setCompanionRegGstEnabled(f.gstEnabled);
            setCompanionRegGstPercentage(f.gstPercentage || 18);
          } else if (f.feeCode === 'COMPANION_PLATFORM_FEE') {
            setCompanionPlatAmount(f.amount);
            setCompanionPlatStatus(f.status);
            setCompanionPlatGstEnabled(f.gstEnabled);
            setCompanionPlatGstPercentage(f.gstPercentage || 18);
          }
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load fee configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleSaveFee = async (
    feeCode: string,
    updates: {
      amount: number;
      status: 'ACTIVE' | 'INACTIVE';
      gstEnabled: boolean;
      gstPercentage: number;
    }
  ) => {
    setSavingFeeCode(feeCode);
    setErrorMessage(null);
    try {
      const adminId = currentAdmin?.id || currentAdmin?.username || 'superadmin';
      const res = await updateFeeConfigurationInDb(feeCode, updates, adminId);
      if (res.success) {
        setSavedBanner(`Fee structure for ${feeCode} updated successfully.`);
        setTimeout(() => setSavedBanner(null), 4000);
        await loadFees();
      } else {
        setErrorMessage(res.errorMessage || `Failed to update ${feeCode}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || `Error saving ${feeCode}`);
    } finally {
      setSavingFeeCode(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingFeeCode('ALL');
    setErrorMessage(null);
    try {
      const adminId = currentAdmin?.id || currentAdmin?.username || 'superadmin';
      await Promise.all([
        updateFeeConfigurationInDb(
          'CUSTOMER_REGISTRATION',
          {
            amount: Number(customerRegAmount),
            status: customerRegStatus,
            gstEnabled: customerRegGstEnabled,
            gstPercentage: Number(customerRegGstPercentage),
          },
          adminId
        ),
        updateFeeConfigurationInDb(
          'CUSTOMER_PLATFORM_FEE',
          {
            amount: Number(customerPlatAmount),
            status: customerPlatStatus,
            gstEnabled: customerPlatGstEnabled,
            gstPercentage: Number(customerPlatGstPercentage),
          },
          adminId
        ),
        updateFeeConfigurationInDb(
          'COMPANION_REGISTRATION',
          {
            amount: Number(companionRegAmount),
            status: companionRegStatus,
            gstEnabled: companionRegGstEnabled,
            gstPercentage: Number(companionRegGstPercentage),
          },
          adminId
        ),
        updateFeeConfigurationInDb(
          'COMPANION_PLATFORM_FEE',
          {
            amount: Number(companionPlatAmount),
            status: companionPlatStatus,
            gstEnabled: companionPlatGstEnabled,
            gstPercentage: Number(companionPlatGstPercentage),
          },
          adminId
        ),
      ]);
      setSavedBanner('All Role Fee Structures & Tax configurations saved successfully.');
      setTimeout(() => setSavedBanner(null), 4000);
      await loadFees();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save all configurations');
    } finally {
      setSavingFeeCode(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#fd8a42]" />
            <span>Fee Structure Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic role-based charges for Customers and Companions. Historical payment records remain strictly immutable (Fee Versioning).
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={savingFeeCode !== null}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{savingFeeCode === 'ALL' ? 'Saving All...' : 'Save All Configurations'}</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{savedBanner}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Customer Registration</span>
          <div className="text-2xl font-black text-white mt-1">₹{customerRegAmount}</div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {customerRegStatus}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Customer Platform Fee</span>
          <div className="text-2xl font-black text-[#fd8a42] mt-1">₹{customerPlatAmount}</div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {customerPlatGstEnabled ? `+ ${customerPlatGstPercentage}% GST` : 'No Tax'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Companion Registration</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{companionRegAmount}</div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {companionRegGstEnabled ? `+ ${companionRegGstPercentage}% GST` : 'No Tax'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b24] border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Companion Platform Fee</span>
          <div className="text-2xl font-black text-white mt-1">₹{companionPlatAmount}</div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400 border border-white/10">
            {companionPlatStatus}
          </span>
        </div>
      </div>

      {/* CUSTOMER FEES CONFIGURATION CARD */}
      <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Customer Fee Structure
            </h3>
            <p className="text-[11px] text-slate-400">
              Charges applicable to user and customer accounts for registration and bookings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Registration Fee */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Customer Registration Fee</span>
              <button
                type="button"
                onClick={() =>
                  setCustomerRegStatus(customerRegStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                }
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                  customerRegStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {customerRegStatus}
              </button>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fee Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={customerRegAmount}
                  onChange={(e) => setCustomerRegAmount(Number(e.target.value))}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default: ₹0. If ₹0, customers bypass payment and activate immediately.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customerRegGstEnabled}
                  onChange={(e) => setCustomerRegGstEnabled(e.target.checked)}
                  className="accent-[#fd8a42] rounded"
                />
                <span>Apply GST ({customerRegGstPercentage}%)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  handleSaveFee('CUSTOMER_REGISTRATION', {
                    amount: customerRegAmount,
                    status: customerRegStatus,
                    gstEnabled: customerRegGstEnabled,
                    gstPercentage: customerRegGstPercentage,
                  })
                }
                disabled={savingFeeCode === 'CUSTOMER_REGISTRATION'}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                {savingFeeCode === 'CUSTOMER_REGISTRATION' ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Customer Platform Fee */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Customer Platform Fee</span>
              <button
                type="button"
                onClick={() =>
                  setCustomerPlatStatus(customerPlatStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                }
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                  customerPlatStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {customerPlatStatus}
              </button>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fee Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={customerPlatAmount}
                  onChange={(e) => setCustomerPlatAmount(Number(e.target.value))}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Platform fee charged per booking to customer.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customerPlatGstEnabled}
                  onChange={(e) => setCustomerPlatGstEnabled(e.target.checked)}
                  className="accent-[#fd8a42] rounded"
                />
                <span>Apply GST ({customerPlatGstPercentage}%)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  handleSaveFee('CUSTOMER_PLATFORM_FEE', {
                    amount: customerPlatAmount,
                    status: customerPlatStatus,
                    gstEnabled: customerPlatGstEnabled,
                    gstPercentage: customerPlatGstPercentage,
                  })
                }
                disabled={savingFeeCode === 'CUSTOMER_PLATFORM_FEE'}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                {savingFeeCode === 'CUSTOMER_PLATFORM_FEE' ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPANION FEES CONFIGURATION CARD */}
      <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Companion Fee Structure
            </h3>
            <p className="text-[11px] text-slate-400">
              Charges applicable to Companion Host profiles for onboarding and platform access.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Companion Registration Fee */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Companion Registration Fee</span>
              <button
                type="button"
                onClick={() =>
                  setCompanionRegStatus(companionRegStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                }
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                  companionRegStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {companionRegStatus}
              </button>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fee Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={companionRegAmount}
                  onChange={(e) => setCompanionRegAmount(Number(e.target.value))}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Mandatory registration & verification charge for prospective companion hosts.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={companionRegGstEnabled}
                  onChange={(e) => setCompanionRegGstEnabled(e.target.checked)}
                  className="accent-[#fd8a42] rounded"
                />
                <span>Apply GST ({companionRegGstPercentage}%)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  handleSaveFee('COMPANION_REGISTRATION', {
                    amount: companionRegAmount,
                    status: companionRegStatus,
                    gstEnabled: companionRegGstEnabled,
                    gstPercentage: companionRegGstPercentage,
                  })
                }
                disabled={savingFeeCode === 'COMPANION_REGISTRATION'}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                {savingFeeCode === 'COMPANION_REGISTRATION' ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Companion Platform Fee */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Companion Platform Fee</span>
              <button
                type="button"
                onClick={() =>
                  setCompanionPlatStatus(companionPlatStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                }
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                  companionPlatStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {companionPlatStatus}
              </button>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fee Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={companionPlatAmount}
                  onChange={(e) => setCompanionPlatAmount(Number(e.target.value))}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#fd8a42]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Optional per-session maintenance fee deducted from companion payout.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={companionPlatGstEnabled}
                  onChange={(e) => setCompanionPlatGstEnabled(e.target.checked)}
                  className="accent-[#fd8a42] rounded"
                />
                <span>Apply GST ({companionPlatGstPercentage}%)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  handleSaveFee('COMPANION_PLATFORM_FEE', {
                    amount: companionPlatAmount,
                    status: companionPlatStatus,
                    gstEnabled: companionPlatGstEnabled,
                    gstPercentage: companionPlatGstPercentage,
                  })
                }
                disabled={savingFeeCode === 'COMPANION_PLATFORM_FEE'}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                {savingFeeCode === 'COMPANION_PLATFORM_FEE' ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAX & GST SETTINGS */}
      <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Percent className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tax &amp; GST Configuration
            </h3>
            <p className="text-[11px] text-slate-400">
              Tax rates applied across registration fees and platform commissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Standard GST Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={companionRegGstPercentage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCompanionRegGstPercentage(val);
                setCustomerPlatGstPercentage(val);
                setCustomerRegGstPercentage(val);
                setCompanionPlatGstPercentage(val);
              }}
              className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#fd8a42]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Standard GST in India for digital services is 18%.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-[11px] text-slate-300">
              <strong className="text-white block font-semibold">Fee Versioning &amp; Audit Trail:</strong>
              When you change any fee, all past transaction records retain their original amounts, order IDs, and tax breakdowns.
            </div>
          </div>
        </div>
      </div>

      {/* Active Fee Structure Overview Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#fd8a42]" />
            <span>Active Fee Configurations &amp; Effective Dates</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {fees.length} configurations active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Fee Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Tax (GST)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Effective From</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    Loading fee configurations...
                  </td>
                </tr>
              ) : (
                fees.map((f) => (
                  <tr key={f.id || f.feeCode} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#fd8a42]">
                      {f.feeCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {f.feeName}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.applicableRole === 'COMPANION'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {f.applicableRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{f.amount}
                    </td>
                    <td className="py-3 px-4">
                      {f.gstEnabled ? (
                        <span className="text-emerald-400 font-semibold">{f.gstPercentage}% GST</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        f.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-mono">
                      {new Date(f.effectiveFrom || f.updatedAt || f.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
