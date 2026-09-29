import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, HelpCircle, FileText, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, companionId?: string) => void;
  userName?: string;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  bookingCount?: number;
  isLoggedIn?: boolean;
  hasCompletedProfile?: boolean;
  onOpenCreateProfile?: () => void;
  onLogout?: () => void;
  isImpersonating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  userName = 'Guest',
  onOpenLogin,
  onOpenSignUp,
  bookingCount = 0,
  isLoggedIn = false,
  hasCompletedProfile = false,
  onOpenCreateProfile,
  onLogout,
  isImpersonating = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Public customer navigation items
  const navItems = [
    { id: 'marketplace', label: 'Find a Companion' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'safety', label: 'Safety' },
    { id: 'become-companion', label: 'Become a Companion' },
    { id: 'help', label: 'Help' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header className={`fixed ${isImpersonating ? 'top-9' : 'top-0'} left-0 right-0 w-full z-40 bg-[#f8f9ff]/95 backdrop-blur-xl border-b border-[#cec3ce]/30 shadow-xs transition-all`}>
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <button
            onClick={() => handleNavClick('marketplace')}
            className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none cursor-pointer min-w-0 max-w-[65%] sm:max-w-none"
            aria-label="Navratri Companion Home"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpdy6hpOkim7adCpFbRqKuQD8QZYciVzSjXHrfR46_b5trhhAE8_JTsMRm-VerlgHEYWq_21krAxX1PTndQCDE1PQZTvvIsZqLx5z61Od-C0tM77ZGfsyqrqkp4jX20MQBu9mwHp2UH8Kl-BS5GA1bGK-ezd5HTqZjwxsU-6X1jkhS15aZuWlDXWJ1k0fruR7IiexUuj7XCT-87g7JjWfqyCZ9fDOJk1Ngmei7gjh3sdYzTuIANmWI"
                alt="Navratri Companion Logo"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-base sm:text-xl lg:text-2xl text-[#12001f] tracking-tight truncate">
              Navratri Companion
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive =
                (item.id === 'marketplace' && currentView === 'marketplace') ||
                currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#311042] text-white shadow-xs'
                      : 'text-[#596579] hover:text-[#12001f] hover:bg-[#eff4ff]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Zone User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {!isLoggedIn ? (
              /* Logged-out Public Controls */
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={onOpenLogin}
                  className="text-xs sm:text-sm font-bold text-[#596579] hover:text-[#12001f] px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl hover:bg-[#eff4ff] transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={onOpenSignUp}
                  className="text-xs sm:text-sm font-bold bg-[#311042] text-white hover:bg-[#9b4500] px-3 sm:px-4 py-2 min-h-[40px] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              /* Logged-in Authenticated Controls */
              <div className="flex items-center gap-1 sm:gap-2">
                {/* My Dashboard Button */}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    currentView === 'dashboard'
                      ? 'bg-[#311042] text-white'
                      : 'bg-[#e6eeff] text-[#12001f] hover:bg-[#d0e0ff]'
                  }`}
                  title="Open My Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                  {bookingCount > 0 && (
                    <span className="bg-[#fd8a42] text-[#331200] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {bookingCount}
                    </span>
                  )}
                </button>

                {/* My Profile / Create Profile (Desktop) */}
                {onOpenCreateProfile && (
                  <button
                    onClick={onOpenCreateProfile}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-[#eff4ff] hover:bg-[#dee9fc] text-[#311042] border border-[#cec3ce]/50 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title={hasCompletedProfile ? 'View or Edit Profile' : 'Create Profile'}
                  >
                    <User className="w-3.5 h-3.5 text-[#9b4500]" />
                    <span>{hasCompletedProfile ? 'Profile' : 'Create Profile'}</span>
                  </button>
                )}

                {/* Logout (Desktop) */}
                <button
                  onClick={() => onLogout && onLogout()}
                  className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                  title="Log Out of Your Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger toggle (Always accessible on < 1024px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#12001f] hover:bg-[#eff4ff] rounded-xl cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Drawer Content */}
          <div className="bg-[#f8f9ff] w-full max-h-[88vh] overflow-y-auto border-b border-[#cec3ce]/40 shadow-2xl rounded-b-3xl p-5 space-y-4">
            {/* Header of Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-[#cec3ce]/30">
              <div className="flex items-center gap-2">
                <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-[#12001f]">
                  Menu &amp; Services
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 text-[#12001f] hover:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const isActive =
                  (item.id === 'marketplace' && currentView === 'marketplace') ||
                  currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full min-h-[44px] text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#311042] text-white shadow-xs'
                        : 'text-[#12001f] hover:bg-[#eff4ff] bg-white border border-[#cec3ce]/30'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="text-xs text-[#ffdbca] font-mono">Active</span>}
                  </button>
                );
              })}
            </nav>

            {/* User Session Quick Actions */}
            <div className="pt-2 border-t border-[#cec3ce]/30 space-y-2">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full min-h-[44px] py-2.5 text-sm border-2 border-[#311042] rounded-xl text-[#311042] hover:bg-[#eff4ff] font-bold text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSignUp();
                    }}
                    className="w-full min-h-[44px] py-2.5 text-sm bg-[#311042] text-white rounded-xl hover:bg-[#9b4500] font-bold text-center shadow-xs"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full min-h-[44px] text-left px-4 py-3 text-sm text-[#12001f] flex items-center justify-between bg-[#e6eeff] rounded-xl font-bold border border-[#cec3ce]/40"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-[#311042]" />
                      <span>My Dashboard ({userName})</span>
                    </span>
                    {bookingCount > 0 && (
                      <span className="bg-[#fd8a42] text-[#331200] text-xs px-2 py-0.5 rounded-full font-bold">
                        {bookingCount} Booking{bookingCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>

                  {onOpenCreateProfile && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCreateProfile();
                      }}
                      className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-white text-[#311042] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#dee9fc] transition-colors border border-[#cec3ce]/50 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#9b4500]" />
                      <span>{hasCompletedProfile ? 'View & Edit Profile' : 'Complete KYC Profile'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Session</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Links Footer in Drawer */}
            <div className="pt-3 border-t border-[#cec3ce]/30 grid grid-cols-2 gap-2 text-xs text-[#596579]">
              <button
                onClick={() => handleNavClick('legal-terms')}
                className="text-left p-2 rounded-lg hover:bg-[#eff4ff] flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#9b4500]" />
                <span>Legal Terms</span>
              </button>
              <button
                onClick={() => handleNavClick('legal-privacy')}
                className="text-left p-2 rounded-lg hover:bg-[#eff4ff] flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#9b4500]" />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => handleNavClick('legal-safety')}
                className="text-left p-2 rounded-lg hover:bg-[#eff4ff] flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#9b4500]" />
                <span>Safety Rules</span>
              </button>
              <button
                onClick={() => handleNavClick('legal-grievance')}
                className="text-left p-2 rounded-lg hover:bg-[#eff4ff] flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#9b4500]" />
                <span>Grievance Desk</span>
              </button>
            </div>
          </div>
          {/* Backdrop Click to Dismiss */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
