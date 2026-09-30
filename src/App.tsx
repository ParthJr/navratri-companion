import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProfileBookingPage } from './pages/ProfileBookingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SafetyPage } from './pages/SafetyPage';
import { BecomeCompanionPage } from './pages/BecomeCompanionPage';
import { HelpPage } from './pages/HelpPage';
import { LegalPolicyPage } from './pages/LegalPolicyPage';
import { ProfileModal } from './components/ProfileModal';
import { LoginSignupModal } from './components/LoginSignupModal';
import { SignUpRequiredModal } from './components/SignUpRequiredModal';
import { CreateProfileModal } from './components/CreateProfileModal';
import { ReportProblemModal } from './components/ReportProblemModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { useSuperAdmin } from './super-admin/context/SuperAdminContext';
import { SuperAdminApp } from './super-admin/SuperAdminApp';
import {
  COMPANIONS_DATA,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
} from './data/companions';
import {
  INITIAL_PAYOUTS,
  INITIAL_HOST_APPLICANTS,
} from './data/adminData';
import {
  Companion,
  Booking,
  UserProfile,
  NotificationItem,
  CompanionPayout,
  HostApplicant,
} from './types';
import { fetchUserProfileFromDb, saveUserProfileToDb } from './services/dbService';

// User profile persistent storage map by userId
export const getUserProfilesMap = (): Record<string, UserProfile> => {
  try {
    const saved = localStorage.getItem('navratri_user_profiles_map');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading user profiles map:', e);
  }
  return {};
};

export const saveUserProfileForUser = (userId: string, updatedProfile: UserProfile) => {
  try {
    const map = getUserProfilesMap();
    map[userId] = {
      ...updatedProfile,
      userId,
      hasCompletedProfile: true,
    };
    localStorage.setItem('navratri_user_profiles_map', JSON.stringify(map));
    localStorage.setItem('navratri_companion_profile', JSON.stringify(map[userId]));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (
        path.startsWith('/super-admin') ||
        path.startsWith('/admin') ||
        hash.startsWith('#/super-admin') ||
        hash.startsWith('#super-admin') ||
        hash.startsWith('#/admin') ||
        hash.startsWith('#admin')
      ) {
        return 'super-admin';
      }
    }
    return 'marketplace';
  });
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [quickModalCompanion, setQuickModalCompanion] = useState<Companion | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('navratri_is_logged_in') === 'true';
    }
    return false;
  });
  const [showSignUpRequired, setShowSignUpRequired] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [activeLegalPolicyTab, setActiveLegalPolicyTab] = useState<
    'terms' | 'privacy' | 'safety' | 'cancellation' | 'community' | 'grievance'
  >('terms');
  const [reportModalConfig, setReportModalConfig] = useState<{
    isOpen: boolean;
    category?: string;
    targetName?: string;
    booking?: Booking | null;
  }>({ isOpen: false });

  // One-time purge of legacy mock data from previous sessions
  if (typeof window !== 'undefined') {
    const PURGE_KEY = 'navratri_purged_mock_data_v4';
    if (localStorage.getItem(PURGE_KEY) !== 'true') {
      localStorage.removeItem('navratri_companion_bookings');
      localStorage.removeItem('navratri_customers_config');
      localStorage.removeItem('navratri_companion_applications');
      localStorage.removeItem('navratri_complaints_config');
      localStorage.removeItem('navratri_safety_incidents_config');
      localStorage.removeItem('navratri_companion_payouts');
      localStorage.removeItem('navratri_payments_config');
      localStorage.removeItem('navratri_registered_users');
      localStorage.removeItem('navratri_registered_accounts');
      localStorage.removeItem('navratri_companions_database');
      localStorage.removeItem('navratri_reg_fee_config');
      localStorage.removeItem('navratri_audit_logs_config');
      localStorage.setItem(PURGE_KEY, 'true');
    }
  }

  // Stored state with localStorage fallbacks
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('navratri_companion_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BOOKINGS;
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [payouts, setPayouts] = useState<CompanionPayout[]>(() => {
    const saved = localStorage.getItem('navratri_companion_payouts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PAYOUTS;
      }
    }
    return INITIAL_PAYOUTS;
  });

  const [applicants, setApplicants] = useState<HostApplicant[]>(INITIAL_HOST_APPLICANTS);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('navratri_companion_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.userId) {
          const map = getUserProfilesMap();
          if (map[parsed.userId]) {
            return map[parsed.userId];
          }
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_USER_PROFILE;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('navratri_companion_notifs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('navratri_companion_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('navratri_companion_payouts', JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem('navratri_companion_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('navratri_companion_notifs', JSON.stringify(notifications));
  }, [notifications]);

  // Scroll to top upon view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Sync with browser URL navigation and Back/Forward
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (
        path.startsWith('/super-admin') ||
        path.startsWith('/admin') ||
        hash.includes('super-admin') ||
        hash.includes('admin')
      ) {
        setCurrentView('super-admin');
      } else if (currentView === 'super-admin') {
        setCurrentView('marketplace');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [currentView]);

  // Sync isLoggedIn state to localStorage & protect dashboard view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('navratri_is_logged_in', isLoggedIn ? 'true' : 'false');
    }
    if (!isLoggedIn && currentView === 'dashboard') {
      setCurrentView('marketplace');
    }
  }, [isLoggedIn, currentView]);

  const handleNavigate = (view: string, companionId?: string) => {
    // Protected route check
    if (view === 'dashboard' && !isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      setCurrentView('marketplace');
      return;
    }

    if (companionId) {
      const found = liveCompanions.find((c) => c.id === companionId);
      if (found) setSelectedCompanion(found);
    }

    if (view === 'super-admin' || view === 'admin') {
      window.history.pushState({}, '', '/super-admin');
      setCurrentView('super-admin');
      return;
    } else {
      if (window.location.pathname === '/super-admin' || window.location.hash.includes('super-admin')) {
        window.history.pushState({}, '', '/');
      }
    }

    // Legal Policy Routes
    if (view.startsWith('legal-')) {
      const policyId = view.replace('legal-', '') as
        | 'terms'
        | 'privacy'
        | 'safety'
        | 'cancellation'
        | 'community'
        | 'grievance';
      setActiveLegalPolicyTab(policyId);
      setCurrentView('legal');
      return;
    } else if (view === 'legal') {
      setActiveLegalPolicyTab('terms');
      setCurrentView('legal');
      return;
    }

    setCurrentView(view);
  };

  const handleSelectCompanion = (comp: Companion) => {
    if (!isLoggedIn) {
      setShowSignUpRequired(true);
      return;
    }
    setSelectedCompanion(comp);
    setCurrentView('profile-booking');
  };

  const handleOpenQuickModal = (comp: Companion) => {
    if (!isLoggedIn) {
      setShowSignUpRequired(true);
      return;
    }
    setQuickModalCompanion(comp);
  };

  const {
    companions: liveCompanions,
    isLoadingCompanions,
    companionsError,
    refreshCompanions,
    impersonatedCustomer,
    exitCustomerImpersonation,
    addBooking,
  } = useSuperAdmin();

  const handleBookingComplete = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    addBooking(newBooking);

    // Also update host payouts record in real time!
    setPayouts((prev) =>
      prev.map((p) => {
        if (p.companionId === newBooking.companionId) {
          const addedGross = newBooking.baseFee;
          const addedCommission = Math.round(addedGross * 0.15);
          const addedNet = addedGross - addedCommission;
          return {
            ...p,
            totalBookings: p.totalBookings + 1,
            completedHours: p.completedHours + (newBooking.duration === '2 Hours' ? 2 : 4),
            grossEarned: p.grossEarned + addedGross,
            platformCommission: p.platformCommission + addedCommission,
            netPayoutDue: p.netPayoutDue + addedNet,
            status: 'pending' as const,
          };
        }
        return p;
      })
    );

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Booking Confirmed with ${newBooking.companionName}!`,
      message: `Your pass for ${newBooking.date} (${newBooking.timeSlot}) at ${newBooking.venue} is secured. Contact unlocked.`,
      timeAgo: 'Just now',
      read: false,
      type: 'booking'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Navigate to dashboard
    setCurrentView('dashboard');
  };

  const handleReleasePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'paid' as const,
              lastPayoutDate: `Oct ${new Date().getDate() || '15'}, 2026`,
            }
          : p
      )
    );
  };

  const handleApproveApplicant = (applicantId: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: 'approved' as const } : a))
    );
  };

  const handleRejectApplicant = (applicantId: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: 'rejected' as const } : a))
    );
  };

  const handleCheckInSession = (bookingId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            checkedIn: true,
            checkInTime: nowTime,
            checkedInBy: 'Super Admin / Direct Check-In',
            escrowStatus: 'Released upon Check-in' as const,
          };
        }
        return b;
      })
    );
    const target = bookings.find((b) => b.id === bookingId);
    alert(`Venue Check-In Confirmed ✓\nArrival recorded for guest "${target?.guestName}" and companion "${target?.companionName}".`);
  };

  const handleStartSession = (bookingId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            checkedIn: true,
            checkInTime: b.checkInTime || nowTime,
            sessionStarted: true,
            sessionStartTime: nowTime,
            status: 'active' as const,
            payoutStatus: 'ready_to_pay' as const,
            escrowStatus: 'Released upon Check-in' as const,
          };
        }
        return b;
      })
    );
    const target = bookings.find((b) => b.id === bookingId);
    alert(`Session Started ✓\nFestival session is now active between "${target?.guestName}" and "${target?.companionName}". Companion payout of ₹${target?.baseFee} unlocked.`);
  };

  const handleCompleteSession = (bookingId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'completed' as const,
            completedAt: nowTime,
            payoutStatus: 'ready_to_pay' as const,
          };
        }
        return b;
      })
    );
    const target = bookings.find((b) => b.id === bookingId);
    alert(`Session Completed ✓\nMeetup marked completed for pass #${target?.id}.`);
  };

  const handleCancelSession = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'cancelled' as const,
            escrowStatus: 'Refunded' as const,
          };
        }
        return b;
      })
    );
    alert(`Session cancelled. Escrow refund initiated.`);
  };

  const handlePayCompanion = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            payoutStatus: 'paid' as const,
            status: 'completed' as const,
          };
        }
        return b;
      })
    );
    const target = bookings.find((b) => b.id === bookingId);
    alert(`Instant UPI Payout of ₹${target?.baseFee} successfully sent to ${target?.companionName} (${target?.companionUpi || target?.companionPhone})!`);
  };

  const handleUpdateBooking = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleAuthSuccess = async (
    name: string,
    phone: string,
    email: string,
    aadhaarImg?: string,
    selfieImg?: string,
    feePaid?: boolean,
    userId?: string,
    role?: 'user' | 'companion' | 'admin' | 'owner'
  ) => {
    // If Owner or Admin account: route to Platform Operations Dashboard
    if (role === 'owner' || role === 'admin') {
      setShowAuthModal(false);
      setCurrentView('super-admin');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/super-admin');
      }
      return;
    }

    const effectiveUserId = (userId || profile.userId || email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '')).trim();
    
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('navratri_is_logged_in', 'true');
      localStorage.setItem('navratri_user_role', role || 'user');
    }
    setShowAuthModal(false);

    // 1. Fetch real Profile from Central Persistent Database
    try {
      const dbProfile = await fetchUserProfileFromDb(effectiveUserId);
      if (dbProfile && (dbProfile.age || dbProfile.hasCompletedProfile || dbProfile.bio)) {
        const loadedProfile: UserProfile = {
          ...INITIAL_USER_PROFILE,
          name: dbProfile.name || name || 'User',
          userId: effectiveUserId,
          role: role || 'user',
          phone: dbProfile.phone || phone || '',
          email: dbProfile.email || email || '',
          city: dbProfile.city || 'Ahmedabad',
          age: dbProfile.age ? String(dbProfile.age) : '23',
          bio: dbProfile.bio || '',
          garbaStyle: dbProfile.preferredGarbaStyle || 'Traditional Dodhiyo & Teen Taal',
          selfieImage: dbProfile.avatarUrl || selfieImg,
          aadhaarImage: aadhaarImg,
          registrationFeePaid: feePaid ?? true,
          hasCompletedProfile: true,
          verificationStatus: 'Verified',
        };

        setProfile(loadedProfile);
        localStorage.setItem('navratri_companion_profile', JSON.stringify(loadedProfile));
        saveUserProfileForUser(effectiveUserId, loadedProfile);
        setShowCreateProfileModal(false);
        setCurrentView('dashboard');
        return;
      }
    } catch (e) {}

    // 2. Check local profile map
    const map = getUserProfilesMap();
    const existingUserProfile = map[effectiveUserId];

    if (existingUserProfile && existingUserProfile.hasCompletedProfile) {
      const updatedProfile = {
        ...existingUserProfile,
        role: role || existingUserProfile.role || 'user',
      };
      setProfile(updatedProfile);
      localStorage.setItem('navratri_companion_profile', JSON.stringify(updatedProfile));
      setShowCreateProfileModal(false);
    } else {
      const isCust = role === 'customer' || role === 'user';
      const newSkeletonProfile: UserProfile = {
        ...(existingUserProfile || INITIAL_USER_PROFILE),
        name: name || 'User',
        userId: effectiveUserId,
        role: role || 'user',
        phone: phone || '',
        email: email || '',
        aadhaarImage: aadhaarImg,
        selfieImage: selfieImg,
        registrationFeePaid: feePaid ?? true,
        idVerified: Boolean(aadhaarImg && selfieImg),
        hasCompletedProfile: isCust ? true : false,
      };
      setProfile(newSkeletonProfile);
      localStorage.setItem('navratri_companion_profile', JSON.stringify(newSkeletonProfile));
      setShowCreateProfileModal(!isCust);
    }

    // Route to Customer or Companion Dashboard (or resume booking if companion was selected)
    if (selectedCompanion && (role === 'customer' || role === 'user')) {
      setCurrentView('profile-booking');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    const effectiveUserId = (updated.userId || profile.userId || 'user').trim();
    const profileWithCompleted: UserProfile = {
      ...updated,
      userId: effectiveUserId,
      hasCompletedProfile: true,
    };
    setProfile(profileWithCompleted);
    localStorage.setItem('navratri_companion_profile', JSON.stringify(profileWithCompleted));
    saveUserProfileForUser(effectiveUserId, profileWithCompleted);

    // Save to Central Database
    saveUserProfileToDb({
      userId: effectiveUserId,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      city: updated.city,
      age: updated.age ? parseInt(String(updated.age), 10) : undefined,
      bio: updated.bio,
      preferredGarbaStyle: updated.garbaStyle,
      avatarUrl: updated.selfieImage,
    }).catch((err) => console.warn('Database profile save note:', err));

    setShowCreateProfileModal(false);
  };

  const handleLogoutUser = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('navratri_is_logged_in');
      localStorage.removeItem('navratri_companion_profile');
      localStorage.removeItem('navratri_user_role');
    }
    setProfile(INITIAL_USER_PROFILE);
    setShowCreateProfileModal(false);
    setShowAuthModal(false);
    setShowSignUpRequired(false);
    setCurrentView('marketplace');
  };

  return (
    <>
      {currentView === 'super-admin' ? (
        <SuperAdminApp onExitToCustomerApp={() => handleNavigate('marketplace')} />
      ) : (
        <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#121c2a]">
          {/* Admin Customer Impersonation Sticky Banner (Section 7) */}
          {impersonatedCustomer && (
            <aside
              role="alert"
              aria-label="Super Admin Impersonation Mode"
              className="fixed top-0 left-0 right-0 z-50 h-9 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-3 sm:px-6 text-xs font-semibold flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="bg-black/30 text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
                  Admin View Mode
                </span>
                <span className="truncate">
                  Viewing as customer: <strong>{impersonatedCustomer.name}</strong> ({impersonatedCustomer.email || impersonatedCustomer.phone})
                </span>
              </div>
              <button
                onClick={() => {
                  exitCustomerImpersonation();
                  handleNavigate('super-admin');
                }}
                className="bg-white text-amber-950 px-2.5 py-0.5 rounded text-xs font-bold hover:bg-amber-50 active:scale-95 transition shadow-xs shrink-0 cursor-pointer"
              >
                Exit Customer View
              </button>
            </aside>
          )}

          {/* Universal Fixed Header */}
          <Header
            currentView={currentView}
            onNavigate={handleNavigate}
            userName={impersonatedCustomer ? impersonatedCustomer.name : profile.name}
            isLoggedIn={Boolean(impersonatedCustomer || isLoggedIn)}
            isImpersonating={Boolean(impersonatedCustomer)}
            hasCompletedProfile={Boolean(impersonatedCustomer ? true : profile.hasCompletedProfile)}
            onOpenCreateProfile={() => setShowCreateProfileModal(true)}
            onLogout={handleLogoutUser}
            onOpenLogin={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            onOpenSignUp={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            bookingCount={bookings.filter((b) => b.status === 'confirmed').length}
          />

          {/* Main Content Area (padding-top accounts for header + impersonation banner) */}
          <main className={`flex-grow ${impersonatedCustomer ? 'pt-28' : 'pt-20'}`}>
            {currentView === 'marketplace' && (
              <MarketplacePage
                companions={liveCompanions}
                isLoading={isLoadingCompanions}
                error={companionsError}
                onRetry={refreshCompanions}
                onSelectCompanion={handleSelectCompanion}
                onOpenQuickModal={handleOpenQuickModal}
              />
            )}

            {currentView === 'profile-booking' && (
              <ProfileBookingPage
                companion={selectedCompanion}
                onBackToMarketplace={() => setCurrentView('marketplace')}
                onBookingComplete={handleBookingComplete}
                onNavigateToLegalPolicy={(policyId) => handleNavigate(`legal-${policyId}`)}
              />
            )}

            {currentView === 'dashboard' && (
              <DashboardPage
                bookings={bookings}
                profile={profile}
                notifications={notifications}
                onNavigateToMarketplace={() => setCurrentView('marketplace')}
                onUpdateBooking={handleUpdateBooking}
                onUpdateProfile={handleSaveProfile}
                onMarkNotificationRead={handleMarkNotificationRead}
                onOpenCreateProfile={() => setShowCreateProfileModal(true)}
                onLogout={handleLogoutUser}
              />
            )}

            {currentView === 'how-it-works' && (
              <HowItWorksPage
                onFindCompanion={() => setCurrentView('marketplace')}
                onBecomeCompanion={() => setCurrentView('become-companion')}
              />
            )}

            {currentView === 'safety' && <SafetyPage />}

            {currentView === 'legal' && (
              <LegalPolicyPage
                initialPolicy={activeLegalPolicyTab}
                onOpenReportModal={(cat, target) => {
                  setReportModalConfig({
                    isOpen: true,
                    category: cat || 'safety_concern',
                    targetName: target || '',
                    booking: null,
                  });
                }}
                onNavigateToBooking={() => setCurrentView('marketplace')}
              />
            )}

            {currentView === 'become-companion' && (
              <BecomeCompanionPage
                onApplicationSubmitted={() => {
                  setCurrentView('marketplace');
                }}
              />
            )}

            {currentView === 'help' && <HelpPage />}
          </main>

          {/* Universal Footer */}
          <Footer onNavigate={handleNavigate} />

          {/* Quick Profile Modal */}
          {quickModalCompanion && (
            <ProfileModal
              companion={quickModalCompanion}
              onClose={() => setQuickModalCompanion(null)}
              onBookNow={(comp, duration) => {
                setSelectedCompanion(comp);
                setQuickModalCompanion(null);
                setCurrentView('profile-booking');
              }}
              onViewFullProfile={(comp) => {
                setSelectedCompanion(comp);
                setQuickModalCompanion(null);
                setCurrentView('profile-booking');
              }}
            />
          )}

          {/* Login / Sign Up Authentication Modal */}
          {showAuthModal && (
            <LoginSignupModal
              mode={authMode}
              onClose={() => setShowAuthModal(false)}
              onSuccess={handleAuthSuccess}
              onAdminLoginSuccess={() => {
                setShowAuthModal(false);
                setCurrentView('super-admin');
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/super-admin');
                }
              }}
              onOpenLegalPolicy={(policyId) => {
                setShowAuthModal(false);
                handleNavigate(`legal-${policyId}`);
              }}
            />
          )}

          {/* Global / Standalone Report Problem & Report User Modal */}
          {reportModalConfig.isOpen && (
            <ReportProblemModal
              booking={reportModalConfig.booking}
              profile={profile}
              initialCategory={reportModalConfig.category}
              initialTargetName={reportModalConfig.targetName}
              onClose={() => setReportModalConfig({ isOpen: false })}
            />
          )}

          {/* Visitor Sign Up Required Modal */}
          {showSignUpRequired && (
            <SignUpRequiredModal
              onClose={() => setShowSignUpRequired(false)}
              onSignUp={() => {
                setShowSignUpRequired(false);
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
            />
          )}

          {/* User Profile Creation / Editing Modal */}
          {showCreateProfileModal && (
            <CreateProfileModal
              currentProfile={profile}
              onClose={() => setShowCreateProfileModal(false)}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {/* Customer-Facing Floating WhatsApp Contact Button */}
          <FloatingWhatsAppButton currentView={currentView} />
        </div>
      )}
    </>
  );
}

