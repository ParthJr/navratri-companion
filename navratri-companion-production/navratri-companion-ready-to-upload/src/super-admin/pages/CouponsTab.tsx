import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Percent,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { CouponItem } from '../types';

export const CouponsTab: React.FC = () => {
  const { coupons, createCoupon, toggleCoupon, deleteCoupon } = useSuperAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minBookingAmount, setMinBookingAmount] = useState(1400);
  const [maxDiscount, setMaxDiscount] = useState(250);
  const [maxUsage, setMaxUsage] = useState(500);
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    const newCoupon: CouponItem = {
      id: `cpn-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
      minBookingAmount: Number(minBookingAmount) || 0,
      expiresAt: '2026-10-25',
      usageCount: 0,
      maxUsage: Number(maxUsage) || 100,
      active: true,
      description: description || 'Festival promotional discount voucher.',
    };
    createCoupon(newCoupon);
    setShowCreateModal(false);
    setCode('');
    setDescription('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white">Coupons & Promotional Discounts</h2>
          <p className="text-xs text-slate-400">
            Generate promotional codes for new customers, group bookings, or platform fee waivers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl bg-[#160b24] border transition-all flex flex-col justify-between ${
              c.active ? 'border-white/15' : 'border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#fd8a42]/10 border border-[#fd8a42]/30 flex items-center justify-center text-[#fd8a42]">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-white tracking-wider text-sm block">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Min: ₹{c.minBookingAmount} • Exp: {c.expiresAt}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleCoupon(c.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    c.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {c.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount:</span>
                  <span className="font-bold text-emerald-400">
                    {c.discountValue}
                    {c.discountType === 'percentage' ? '%' : ' Flat ₹'}
                    {c.maxDiscount ? ` (up to ₹${c.maxDiscount})` : ''}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Redemptions:</span>
                  <span>{c.usageCount} / {c.maxUsage}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 min-h-[30px]">{c.description}</p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
              <button
                onClick={() => deleteCoupon(c.id)}
                className="p-1 rounded-lg text-slate-500 hover:text-red-400"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE COUPON MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create Promo Code</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NAVRATRI20"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Booking (₹)</label>
                  <input
                    type="number"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Voucher Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% discount on prime festival slots"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#fd8a42] text-white font-semibold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
