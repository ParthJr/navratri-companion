import React, { useState } from 'react';
import {
  Shield,
  Plus,
  CheckCircle2,
  Lock,
  UserCheck,
  Mail,
  Phone,
  Trash2,
  X,
  Sparkles,
  Key,
  Edit2,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { AdminUser, AdminRole, ROLE_PERMISSIONS } from '../types';

export const AdminUsersTab: React.FC = () => {
  const {
    adminUsers,
    addAdminUser,
    updateAdminStatus,
    updateAdminCredentials,
    resetAdminCredentialsToDefault,
  } = useSuperAdmin();

  // Invite Admin modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 9');
  const [role, setRole] = useState<AdminRole>('operations_admin');

  // Edit credentials modal
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editAdminId, setEditAdminId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !adminId || !password.trim()) return;
    const newUser: AdminUser = {
      id: `adm-${Date.now()}`,
      adminId: adminId.trim(),
      password: password.trim(),
      name,
      email,
      phone,
      role,
      status: 'active',
      lastLogin: 'Pending first sign in',
    };
    addAdminUser(newUser);
    setShowInviteModal(false);
    setName('');
    setAdminId('');
    setPassword('');
    setEmail('');
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditAdminId(user.adminId);
    setEditPassword(user.password || '');
    setShowEditPass(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateAdminCredentials(editingUser.id, {
      adminId: editAdminId.trim(),
      password: editPassword.trim(),
    });
    setEditingUser(null);
  };

  const roleBadge = (r: AdminRole) => {
    const config = ROLE_PERMISSIONS[r];
    return config ? config.badgeColor : 'bg-slate-700 text-slate-300';
  };

  const roleDisplayName = (r: AdminRole) => {
    const config = ROLE_PERMISSIONS[r];
    return config ? config.displayName : r.replace('_', ' ');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white">Admin Users & Role-Based Access Control (RBAC)</h2>
          <p className="text-xs text-slate-400">
            Manage unique Admin IDs, passwords, and permissions across Super Admin, Operations, Finance, and Support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetAdminCredentialsToDefault}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Reset default demo Admin IDs and passwords"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Admin User</span>
          </button>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Admin Member</th>
                <th className="py-3.5 px-4">Admin ID (Login)</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#fd8a42]/20 border border-[#fd8a42]/30 flex items-center justify-center text-xs font-bold text-[#fd8a42]">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-emerald-400 font-semibold">
                    @{u.adminId}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleBadge(u.role)}`}>
                      {roleDisplayName(u.role)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                    {u.password ? '••••••••' : 'Default'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {u.lastLogin}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1 transition-colors"
                        title="Configure Admin ID & Password"
                      >
                        <Edit2 className="w-3 h-3 text-[#fd8a42]" />
                        <span>Edit</span>
                      </button>

                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => updateAdminStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 transition-colors"
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="p-5 rounded-2xl bg-[#160b24] border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Role Permissions Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-2.5">Permission Scope</th>
                <th className="py-2.5 text-center">Super Admin</th>
                <th className="py-2.5 text-center">Operations Admin</th>
                <th className="py-2.5 text-center">Finance Admin</th>
                <th className="py-2.5 text-center">Support Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              <tr>
                <td className="py-2">Platform Fees & Commission Config</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
              </tr>
              <tr>
                <td className="py-2">Instant UPI Companion Payout Releases</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
              </tr>
              <tr>
                <td className="py-2">Approve/Reject Host Aadhaar & Selfie KYC</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2">Emergency SOS & Police Safety Dispatch</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-emerald-400 font-bold">✓ Primary</td>
              </tr>
              <tr>
                <td className="py-2">Customer Inquiries & Dispute Resolution</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-emerald-400 font-bold">✓ Primary</td>
              </tr>
              <tr>
                <td className="py-2">Staff & RBAC Credential Management</td>
                <td className="text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
                <td className="text-center text-slate-600">✕</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT CREDENTIALS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Configure Admin Credentials</h3>
                <p className="text-[11px] text-slate-400">
                  {editingUser.name} ({roleDisplayName(editingUser.role)})
                </p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Admin ID</label>
                <input
                  type="text"
                  required
                  value={editAdminId}
                  onChange={(e) => setEditAdminId(e.target.value)}
                  placeholder="Enter unique Admin ID"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showEditPass ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#201033] border border-white/15 rounded-xl pl-3 pr-10 py-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showEditPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white font-semibold shadow-md"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Invite Admin Staff Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pooja Shah"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Admin ID (for Login)</label>
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. pooja_ops"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pooja.ops@navratricompanion.com"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="operations_admin">Operations Admin</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="support_admin">Support Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white font-semibold"
                >
                  Dispatch Staff Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
