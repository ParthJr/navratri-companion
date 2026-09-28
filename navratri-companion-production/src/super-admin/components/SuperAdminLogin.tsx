import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { authenticateCredentials, createSessionForAccount } from '../../services/unifiedAuth';

interface SuperAdminLoginProps {
  onExitToCustomerApp?: () => void;
}

export const SuperAdminLogin: React.FC<SuperAdminLoginProps> = ({ onExitToCustomerApp }) => {
  const { login, adminUsers, updateAdminCredentials } = useSuperAdmin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotId, setForgotId] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authenticateCredentials(identifier, password);
      setIsLoading(false);

      if (!result.success || !result.account) {
        setError(result.errorMessage || 'Invalid User ID or Password.');
        return;
      }

      // Role-based Access Control and Session Routing
      if (result.account.role === 'owner' || result.account.role === 'admin') {
        // Platform Owner / Admin: Create Admin Session -> Platform Operations Dashboard
        createSessionForAccount(result.account, result.token);
        login(identifier, password);
      } else if (result.account.role === 'user') {
        // Customer / User: Create User Session -> Customer Dashboard
        createSessionForAccount(result.account);
        if (onExitToCustomerApp) {
          onExitToCustomerApp();
        } else {
          window.location.href = '/';
        }
      } else if (result.account.role === 'companion') {
        // Companion: Create Companion Session -> Companion/User Dashboard
        createSessionForAccount(result.account);
        if (onExitToCustomerApp) {
          onExitToCustomerApp();
        } else {
          window.location.href = '/';
        }
      } else {
        setError('Invalid User ID or Password.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Invalid User ID or Password.');
    }
  };

  const handleForgotLookupAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const user = adminUsers.find(
      (u) =>
        u.adminId.toLowerCase() === forgotId.trim().toLowerCase() ||
        u.email.toLowerCase() === forgotId.trim().toLowerCase()
    );

    if (!user) {
      setForgotError('Invalid User ID or Password.');
      return;
    }

    if (!forgotNewPassword.trim() || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    updateAdminCredentials(user.id, {
      password: forgotNewPassword.trim(),
    });

    setIdentifier(user.adminId);
    setPassword(forgotNewPassword.trim());
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#0d0714] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#fd8a42]/30">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#c9184a]/20 via-[#7209b7]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-[#fd8a42]/20 via-[#4361ee]/15 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header with Brand and Marketplace Link */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fd8a42] to-[#c9184a] flex items-center justify-center shadow-lg shadow-[#fd8a42]/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide text-white">NAVRATRI COMPANION</span>
            <span className="block text-[10px] uppercase font-semibold text-[#fd8a42] tracking-widest">
              OFFICIAL PLATFORM
            </span>
          </div>
        </div>

        {onExitToCustomerApp && (
          <button
            onClick={onExitToCustomerApp}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
          >
            <span>Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Single Unified Login Card */}
      <div className="w-full max-w-md bg-[#160d22]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 z-10 relative">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Login</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Enter your User ID or Email and Password
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Unified Login Form - Handles all authorized account types automatically */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: User ID / Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              User ID / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your User ID or Email"
                className="w-full bg-[#201330] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42] focus:ring-1 focus:ring-[#fd8a42] transition-colors"
              />
            </div>
          </div>

          {/* Field 2: Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotId(identifier);
                  setForgotNewPassword('');
                  setForgotSuccess(false);
                  setForgotError(null);
                  setShowForgotPassword(true);
                }}
                className="text-[11px] text-[#fd8a42] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your password"
                className="w-full bg-[#201330] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42] focus:ring-1 focus:ring-[#fd8a42] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field 3: Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-sm font-bold shadow-lg shadow-[#fd8a42]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1a0f2b] border border-white/15 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#fd8a42]/20 border border-[#fd8a42]/30 flex items-center justify-center text-[#fd8a42]">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Password Reset Successfully!</span>
                </div>
                <p>
                  The password for account <strong>{forgotId}</strong> has been updated. You can now log in with your new password.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotLookupAndReset} className="space-y-3 text-xs">
                <p className="text-slate-400">
                  Enter your registered ID or Email to reset your password.
                </p>

                {forgotError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    User ID / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    placeholder="Enter your User ID or Email"
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full bg-[#201033] border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#fd8a42] hover:bg-[#fd8a42]/90 text-white font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
