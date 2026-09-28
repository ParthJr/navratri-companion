import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Save,
  Building2,
  Clock,
  Coins,
  X,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { PackageTierConfig } from '../types';

export const PricingPackagesTab: React.FC = () => {
  const { packages, updatePackage, createPackage, deletePackage } = useSuperAdmin();

  const [editingPkg, setEditingPkg] = useState<PackageTierConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPkg, setNewPkg] = useState<Partial<PackageTierConfig>>({
    name: '3 Hours Evening Dandiya Special',
    durationHours: 3,
    basePrice: 1999,
    minPrice: 1499,
    maxPrice: 2999,
    active: true,
    description: 'Special mid-duration package for family garba rounds.',
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    updatePackage(editingPkg.id, editingPkg);
    setEditingPkg(null);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkg.name || !newPkg.basePrice) return;
    const pkg: PackageTierConfig = {
      id: `pkg-${Date.now()}`,
      name: newPkg.name,
      durationHours: Number(newPkg.durationHours) || 2,
      basePrice: Number(newPkg.basePrice),
      minPrice: Number(newPkg.minPrice) || Number(newPkg.basePrice) * 0.7,
      maxPrice: Number(newPkg.maxPrice) || Number(newPkg.basePrice) * 1.5,
      active: true,
      description: newPkg.description || 'Navratri festival companion package tier.',
    };
    createPackage(pkg);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white">Festival Pass Packages & Pricing</h2>
          <p className="text-xs text-slate-400">
            Define durations, base rates, minimum/maximum companion caps, and city variations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`p-5 rounded-2xl bg-[#160b24] border transition-all flex flex-col justify-between ${
              pkg.active ? 'border-white/15 shadow-xl' : 'border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#fd8a42] font-semibold mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pkg.durationHours} Hours Session</span>
                  </div>
                </div>
                <button
                  onClick={() => updatePackage(pkg.id, { active: !pkg.active })}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                    pkg.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {pkg.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <p className="text-xs text-slate-300 min-h-[36px]">{pkg.description}</p>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Base Pass Price:</span>
                  <span className="font-extrabold text-white text-base">₹{pkg.basePrice}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>Price Range Cap:</span>
                  <span>₹{pkg.minPrice} – ₹{pkg.maxPrice}</span>
                </div>
                {pkg.cityPricing && (
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Ahmedabad: ₹{pkg.cityPricing.Ahmedabad || pkg.basePrice}</span>
                    <span>Gandhinagar: ₹{pkg.cityPricing.Gandhinagar || pkg.basePrice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setEditingPkg(pkg)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Pricing</span>
              </button>

              <button
                onClick={() => deletePackage(pkg.id)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Delete Tier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Edit Package: {editingPkg.name}</h3>
              <button onClick={() => setEditingPkg(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Package Name</label>
                <input
                  type="text"
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Base Price (₹ INR)</label>
                <input
                  type="number"
                  value={editingPkg.basePrice}
                  onChange={(e) => setEditingPkg({ ...editingPkg, basePrice: Number(e.target.value) })}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Price Cap (₹)</label>
                  <input
                    type="number"
                    value={editingPkg.minPrice}
                    onChange={(e) => setEditingPkg({ ...editingPkg, minPrice: Number(e.target.value) })}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Max Price Cap (₹)</label>
                  <input
                    type="number"
                    value={editingPkg.maxPrice}
                    onChange={(e) => setEditingPkg({ ...editingPkg, maxPrice: Number(e.target.value) })}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#fd8a42] text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create New Festival Package</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={newPkg.name}
                  onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                  placeholder="e.g. 6 Hours VIP Night"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={newPkg.durationHours}
                    onChange={(e) => setNewPkg({ ...newPkg, durationHours: Number(e.target.value) })}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Base Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newPkg.basePrice}
                    onChange={(e) => setNewPkg({ ...newPkg, basePrice: Number(e.target.value) })}
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Package Description</label>
                <textarea
                  rows={2}
                  value={newPkg.description}
                  onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl p-2.5 text-white"
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
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
