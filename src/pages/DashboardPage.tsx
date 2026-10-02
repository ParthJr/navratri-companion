import React, { useState } from 'react';
import { Booking, UserProfile, NotificationItem } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Lock,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Bell,
  User,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
  Radio,
  FileText,
  Mail,
  Send,
  ExternalLink,
  Check,
  X,
  LogOut,
  Sparkles
} from 'lucide-react';
import { CheckInModal } from '../components/CheckInModal';
import { CompletionOtpModal } from '../components/CompletionOtpModal';
import { ReportProblemModal } from '../components/ReportProblemModal';
import { CancelBookingModal } from '../components/CancelBookingModal';
import { EmergencySosModal } from '../components/EmergencySosModal';
import { useSuperAdmin } from '../super-admin/context/SuperAdminContext';
import { generatePaymentSupportWhatsAppUrl } from '../utils/whatsapp';

interface DashboardPageProps {
  bookings: Booking[];
  profile: UserProfile;
  notifications: NotificationItem[];
  onNavigateToMarketplace: () => void;
  onUpdateBooking: (updated: Booking) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onMarkNotificationRead: (id: string) => void;
  onOpenCreateProfile?: () => void;
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  bookings,
  profile,
  notifications,
  onNavigateToMarketplace,
  onUpdateBooking,
  onUpdateProfile,
  onMarkNotificationRead,
  onOpenCreateProfile,
  onLogout,
}) => {
  const { cancelBooking, refundBooking } = useSuperAdmin();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'notifications' | 'profile' | 'support'>('overview');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState<Booking | null>(null);
  const [selectedBookingForReport, setSelectedBookingForReport] = useState<Booking | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Profile edit local state
  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [phoneInput, setPhoneInput] = useState(profile.phone);
  const [cityInput, setCityInput] = useState(profile.city);
  const [emergencyName, setEmergencyName] = useState(profile.emergencyContact);
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyPhone);
  const [showVerificationEmailModal, setShowVerificationEmailModal] = useState(false);
  const [emailResentToast, setEmailResentToast] = useState(false);

  const handleVerifyEmailClick = () => {
    onUpdateProfile({
      ...profile,
      emailVerified: true,
    });
    setShowVerificationEmailModal(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const handleResendVerificationEmail = () => {
    setEmailResentToast(true);
    setShowVerificationEmailModal(true);
    setTimeout(() => setEmailResentToast(false), 4000);
  };

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const activeUpcomingBooking = confirmedBookings[0] || bookings[0];
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleConfirmCancel = (bookingId: string, refundAmount: number) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const updated: Booking = {
      ...target,
      status: 'cancelled',
      escrowStatus: 'Refunded',
      payoutStatus: 'rejected',
    };

    onUpdateBooking(updated);
    cancelBooking(bookingId, 'Customer cancelled booking via dashboard');
    refundBooking(bookingId);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      city: cityInput,
      emergencyContact: emergencyName,
      emergencyPhone: emergencyPhone
    });
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    if (bookingFilter === 'upcoming') return b.status === 'confirmed';
    if (bookingFilter === 'completed') return b.status === 'completed';
    if (bookingFilter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="w-full bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Greeting & Quick Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#311042]/10 text-[#121c2a] text-xs font-semibold rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                {profile.role === 'companion' ? 'Verified Festival Companion' : 'Customer Account • Verified'}
              </span>
              <span className="text-[#596579] text-xs sm:text-sm">• Ahmedabad &amp; Gandhinagar 2026</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl sm:text-3xl text-[#12001f] tracking-tight flex items-baseline gap-2">
              <span>Welcome back, {profile.name.split(' ')[0]}</span>
              {profile.userId && (
                <span className="text-xs sm:text-sm font-mono font-normal text-[#596579] bg-white px-2 py-0.5 rounded-lg border border-[#cec3ce]/40">
                  @{profile.userId}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#596579]">
              {profile.role === 'companion'
                ? 'Companion Dashboard: Manage your festive bookings, client sessions, and verified earnings.'
                : 'Customer Dashboard: Manage your Garba night passes, companion schedules, and secure bookings.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-[#eff4ff] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2.5 sm:gap-3 border border-[#cec3ce]/30 shadow-xs min-h-[44px]">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#9b4500] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">local_activity</span>
              </div>
              <div>
                <div className="font-['Plus_Jakarta_Sans'] font-bold text-base sm:text-lg text-[#12001f] leading-none">
                  {confirmedBookings.length}
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#596579] mt-0.5">Confirmed</div>
              </div>
            </div>

            {onOpenCreateProfile && (
              <button
                onClick={onOpenCreateProfile}
                className="bg-[#eff4ff] hover:bg-[#dee9fc] text-[#311042] border border-[#cec3ce]/50 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer min-h-[44px]"
                title={profile.hasCompletedProfile ? 'Edit Profile Settings' : 'Create Profile'}
              >
                <User className="w-4 h-4 text-[#9b4500]" />
                <span>{profile.hasCompletedProfile ? 'Profile' : 'Create Profile'}</span>
              </button>
            )}

            <button
              onClick={onNavigateToMarketplace}
              className="bg-[#311042] text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 hover:bg-[#9b4500] transition-colors shadow-sm active:scale-95 min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              <span>Find Companion</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer min-h-[44px]"
                title="Sign Out / Log Out of Your Account"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#311042] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-[#311042] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            <span>My Bookings</span>
            <span className="bg-[#9b4500] text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-[#311042] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#311042] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'support'
                ? 'bg-[#311042] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Support &amp; Safety</span>
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left / Main Column (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                {/* Complete Profile Prompt Banner if not completed */}
                {!profile.hasCompletedProfile && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-amber-950">Complete Your Profile</h4>
                        <p className="text-xs text-amber-800 mt-0.5">Please create and complete your profile details to unlock full platform features.</p>
                      </div>
                    </div>
                    {onOpenCreateProfile && (
                      <button
                        onClick={onOpenCreateProfile}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        Create Profile
                      </button>
                    )}
                  </div>
                )}
                {/* Upcoming Booking Highlight Card */}
                {activeUpcomingBooking ? (
                  <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#cec3ce]/30 relative overflow-hidden">
                    {/* Status Ribbon */}
                    {activeUpcomingBooking.paymentStatus === 'REJECTED' || activeUpcomingBooking.status === 'cancelled' ? (
                      <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 rounded-bl-xl text-xs font-semibold flex items-center gap-1 shadow-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Payment Rejected / Cancelled</span>
                      </div>
                    ) : (activeUpcomingBooking.paymentStatus === 'PENDING_CONFIRMATION' || activeUpcomingBooking.status === 'pending' || activeUpcomingBooking.status === 'PENDING_PAYMENT_VERIFICATION') ? (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-xl text-xs font-semibold flex items-center gap-1 shadow-xs animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Payment Submitted — Verification Pending</span>
                      </div>
                    ) : (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white px-4 py-1 rounded-bl-xl text-xs font-semibold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed &amp; Secured ✓</span>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Photo */}
                      <div
                        className="w-full md:w-36 h-48 rounded-xl bg-cover bg-center shrink-0 shadow-sm"
                        style={{ backgroundImage: `url('${activeUpcomingBooking.companionAvatar}')` }}
                        role="img"
                        aria-label={`Companion ${activeUpcomingBooking.companionName}`}
                      />

                      {/* Content */}
                      <div className="flex flex-col flex-grow gap-3 w-full">
                        <div>
                          <span className="text-[11px] text-[#596579] uppercase tracking-wider font-semibold block">
                            Upcoming Experience
                          </span>
                          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg sm:text-xl text-[#12001f]">
                            Garba + Photos ({activeUpcomingBooking.duration}) with {activeUpcomingBooking.companionName} ({activeUpcomingBooking.companionAge})
                          </h3>
                        </div>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 py-1 text-xs text-[#596579]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#9b4500]" />
                            <span>{activeUpcomingBooking.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#9b4500]" />
                            <span>{activeUpcomingBooking.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#9b4500]" />
                            <span>{activeUpcomingBooking.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#9b4500]" />
                            {activeUpcomingBooking.paymentStatus === 'REJECTED' ? (
                              <span className="text-rose-600 font-semibold">Payment Rejected</span>
                            ) : (activeUpcomingBooking.paymentStatus === 'PENDING_CONFIRMATION' || activeUpcomingBooking.status === 'pending' || activeUpcomingBooking.status === 'PENDING_PAYMENT_VERIFICATION') ? (
                              <span className="text-amber-600 font-semibold">Verification Pending</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">₹{activeUpcomingBooking.totalFee.toLocaleString('en-IN')} locked in escrow</span>
                            )}
                          </div>
                        </div>

                        {/* Escrow & Contact status handling */}
                        {(activeUpcomingBooking.paymentStatus === 'PENDING_CONFIRMATION' || activeUpcomingBooking.status === 'pending' || activeUpcomingBooking.status === 'PENDING_PAYMENT_VERIFICATION') ? (
                          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                              <div>
                                <strong className="block text-amber-950 font-bold">Payment submitted — waiting for platform confirmation.</strong>
                                <span className="text-amber-800 text-[11px]">Super Admin is reviewing your ₹{activeUpcomingBooking.totalFee.toLocaleString('en-IN')} UPI transaction. Companion contact will unlock immediately upon verification.</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full font-black uppercase self-start sm:self-auto shrink-0">
                              PENDING CONFIRMATION
                            </span>
                          </div>
                        ) : activeUpcomingBooking.paymentStatus === 'REJECTED' || activeUpcomingBooking.status === 'cancelled' ? (
                          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                              <div>
                                <strong className="block text-rose-950 font-bold">Payment could not be confirmed. Please contact support.</strong>
                                <span className="text-rose-800 text-[11px] font-normal">If you were debited, click WhatsApp support with your payment reference.</span>
                              </div>
                            </div>
                            <a
                              href={generatePaymentSupportWhatsAppUrl(undefined, profile.name, activeUpcomingBooking.id, activeUpcomingBooking.rejectionReason)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-colors shrink-0"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Contact WhatsApp Support</span>
                            </a>
                          </div>
                        ) : (
                          <div className="bg-[#eff4ff] p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#cec3ce]/30">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-[#12001f]">
                                <Lock className="w-4 h-4 text-[#9b4500]" />
                                <span>Unlocked Companion Contacts (₹{activeUpcomingBooking.totalFee.toLocaleString('en-IN')} locked in escrow)</span>
                              </div>
                              <span className="text-[11px] text-[#596579]">Direct coordinates unlocked for festival coordination.</span>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <a
                                href={`tel:${activeUpcomingBooking.companionPhone}`}
                                className="flex-1 sm:flex-none bg-[#311042] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#9b4500] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{activeUpcomingBooking.companionPhone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${activeUpcomingBooking.companionPhone.replace(/\D/g, '') || '918200564182'}?text=Hello%20${encodeURIComponent(activeUpcomingBooking.companionName)},%20I%20have%20booked%20our%20Navratri%20Garba%20companion%20session%20for%20${encodeURIComponent(activeUpcomingBooking.date)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-none bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Meeting Completion OTP Box for Active Sessions */}
                        {(activeUpcomingBooking.status === 'active' || activeUpcomingBooking.sessionStarted) &&
                          activeUpcomingBooking.status !== 'completed' &&
                          activeUpcomingBooking.status !== 'cancelled' && (
                            <div className="bg-gradient-to-r from-[#311042] to-[#4c1d68] p-4 rounded-2xl text-white border border-[#fd8a42]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffdbca]">
                                  <Sparkles className="w-4 h-4 text-[#fd8a42]" />
                                  <span>Session Active (In Progress)</span>
                                </div>
                                <p className="text-xs text-slate-200 mt-0.5">
                                  Provide Completion OTP <strong className="font-mono text-amber-300 font-black text-sm">{activeUpcomingBooking.completionOtp || '8492'}</strong> to companion after session finishes.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedBookingForOtp(activeUpcomingBooking)}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#ffdbca]" />
                                <span>Complete Session &amp; Enter OTP</span>
                              </button>
                            </div>
                          )}

                        {/* Completed Status Box */}
                        {activeUpcomingBooking.status === 'completed' && (
                          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div>
                                <span className="font-bold block text-sm">Meeting Completed ✓</span>
                                <span className="text-[11px] text-emerald-800">
                                  Completion OTP Verified. Thank you for celebrating safely with Navratri Companion!
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Cancelled Status Box */}
                        {activeUpcomingBooking.status === 'cancelled' && (
                          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-300 text-rose-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                              <div>
                                <span className="font-bold block text-sm">Booking Cancelled</span>
                                <span className="text-[11px] text-rose-800">
                                  Full refund of ₹{activeUpcomingBooking.totalFee.toLocaleString('en-IN')} initiated to your source payment account.
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          {activeUpcomingBooking.status !== 'cancelled' && activeUpcomingBooking.status !== 'completed' ? (
                            !activeUpcomingBooking.checkedIn ? (
                              <button
                                onClick={() => setSelectedBookingForCheckIn(activeUpcomingBooking)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#9b4500] text-white hover:bg-[#763300] flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Did you meet your companion? Check-In</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedBookingForOtp(activeUpcomingBooking)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#311042] text-white hover:bg-[#9b4500] flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#fd8a42]" />
                                <span>Finish Meeting &amp; Verify OTP</span>
                              </button>
                            )
                          ) : (
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Status: {activeUpcomingBooking.status.toUpperCase()}
                            </span>
                          )}

                          <div className="flex items-center gap-4 text-xs">
                            <button
                              onClick={() => setSelectedBookingForReport(activeUpcomingBooking)}
                              className="text-rose-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Report Problem</span>
                            </button>
                            {activeUpcomingBooking.status !== 'completed' && activeUpcomingBooking.status !== 'cancelled' && (
                              <button
                                onClick={() => setSelectedBookingForCancel(activeUpcomingBooking)}
                                className="text-[#596579] hover:text-rose-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel Booking</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center border border-[#cec3ce]/30 space-y-3">
                    <p className="text-sm text-[#596579]">No upcoming active bookings found.</p>
                    <button
                      onClick={onNavigateToMarketplace}
                      className="bg-[#311042] text-white px-5 py-2 rounded-lg text-xs font-bold"
                    >
                      Book a Companion Now
                    </button>
                  </div>
                )}

                {/* Section: Quick Stats / Festival Countdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 border border-[#cec3ce]/30 shadow-xs">
                    <span className="text-[11px] text-[#596579] uppercase font-bold tracking-wider">
                      Festival Starts In
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#12001f]">
                      3 Days
                    </span>
                    <span className="text-xs text-[#596579]">Oct 11 – Oct 19, 2026</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 border border-[#cec3ce]/30 shadow-xs">
                    <span className="text-[11px] text-[#596579] uppercase font-bold tracking-wider">
                      Total Bookings
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#12001f]">
                      {bookings.length} Session{bookings.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[#596579]">Festival Sessions</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 border border-[#cec3ce]/30 shadow-xs">
                    <span className="text-[11px] text-[#596579] uppercase font-bold tracking-wider">
                      Safety Status
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#9b4500] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[24px]">shield</span>
                      Secure
                    </span>
                    <span className="text-xs text-[#596579]">ID verified &amp; Escrow active</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-[#cec3ce]/30 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                    Booking History
                  </h2>
                  <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#cec3ce]/30 text-xs">
                    {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setBookingFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                          bookingFilter === filter
                            ? 'bg-[#311042] text-white shadow-xs font-semibold'
                            : 'text-[#596579] hover:text-[#12001f]'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBookings.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-[#eff4ff] p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-[#cec3ce]/30"
                      >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <img
                            src={b.companionAvatar}
                            alt={b.companionName}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  (b.paymentStatus === 'CONFIRMED' || b.paymentStatus === 'PAID' || b.status === 'confirmed')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : (b.paymentStatus === 'REJECTED' || b.status === 'cancelled')
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}
                              >
                                {(b.paymentStatus === 'CONFIRMED' || b.paymentStatus === 'PAID' || b.status === 'confirmed')
                                  ? '₹' + b.totalFee + ' Locked in Escrow ✓'
                                  : (b.paymentStatus === 'REJECTED' || b.status === 'cancelled')
                                  ? 'Payment Rejected'
                                  : 'Waiting Platform Confirmation'}
                              </span>
                              <span className="text-xs text-[#596579]">Pass #{b.id}</span>
                            </div>
                            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f] mt-1">
                              Garba + Photos with {b.companionName}
                            </h4>
                            <p className="text-xs text-[#596579]">
                              {b.date} • {b.timeSlot} • {b.venue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#cec3ce]/30">
                          <span className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                            ₹{b.totalFee.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => {
                              alert(`Digital Pass #${b.id}\nCompanion: ${b.companionName}\nVenue: ${b.venue}\nDate: ${b.date}\nEscrow Status: ${b.escrowStatus}\nSafety Support: Verified`);
                            }}
                            className="bg-[#311042] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#9b4500] transition-colors"
                          >
                            Pass Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#596579] space-y-2">
                    <p className="text-sm">No bookings in this filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-[#cec3ce]/30 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                    Notifications
                  </h2>
                  <button
                    onClick={() => notifications.forEach((n) => onMarkNotificationRead(n.id))}
                    className="text-xs text-[#9b4500] font-semibold hover:underline"
                  >
                    Mark All as Read
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-4 rounded-xl flex items-start gap-3 transition-colors cursor-pointer border ${
                        notif.read
                          ? 'bg-slate-50 border-[#cec3ce]/20'
                          : 'bg-[#eff4ff] border-l-4 border-l-[#9b4500] border-[#cec3ce]/30 shadow-xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[#9b4500] text-[22px] mt-0.5">
                        {notif.type === 'booking'
                          ? 'celebration'
                          : notif.type === 'safety'
                          ? 'verified_user'
                          : 'local_activity'}
                      </span>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-[#12001f]">
                            {notif.title}
                          </span>
                          <span className="text-[11px] text-[#596579]">{notif.timeAgo}</span>
                        </div>
                        <p className="text-xs text-[#596579] leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PROFILE SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-[#cec3ce]/30 flex flex-col gap-6">
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f]">
                  Profile &amp; Emergency Settings
                </h2>

                {profileSuccessMsg && (
                  <div className="bg-emerald-50 text-emerald-900 text-xs p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your profile and emergency contacts have been saved successfully.</span>
                  </div>
                )}

                {/* Avatar / Verification Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#cec3ce]/30">
                  <div className="flex items-center gap-4">
                    {profile.selfieImage ? (
                      <div className="relative">
                        <img
                          src={profile.selfieImage}
                          alt="Current Selfie"
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5" title="Live Selfie Verified">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#311042] text-white flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold text-2xl shadow-sm">
                        {nameInput.charAt(0) || 'R'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-[#12001f] flex items-center gap-2">
                        <span>{nameInput}</span>
                        {profile.userId && (
                          <span className="text-xs font-mono font-medium text-[#596579] bg-slate-100 px-2 py-0.5 rounded-md">
                            @{profile.userId}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#596579]">{emailInput} • {phoneInput}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Aadhaar Verified
                        </span>

                        {/* Email Verified / Not Verified Badge */}
                        {profile.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Email
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Not Verified Email
                          </span>
                        )}

                        {profile.registrationFeePaid && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-[#ffdbca] text-[#9b4500] px-2.5 py-0.5 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9b4500]" /> Registration Fee Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verification Docs Preview */}
                  {profile.aadhaarImage && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-[#cec3ce]/40 p-2 rounded-xl text-xs">
                      <img
                        src={profile.aadhaarImage}
                        alt="Aadhaar Card"
                        className="w-12 h-8 rounded object-cover border border-[#cec3ce]/60"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-[#12001f] block">Aadhaar Card</span>
                        <span className="text-emerald-700 font-medium">✓ Uploaded &amp; Matched</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Verification Box */}
                <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  profile.emailVerified
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <Mail className={`w-5 h-5 mt-0.5 shrink-0 ${profile.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <span>Email Verification:</span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          profile.emailVerified ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {profile.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 text-slate-600">
                        {profile.emailVerified
                          ? `Official receipts, pass barcodes, and companion contact details are sent to ${profile.email}.`
                          : `A secure verification email was dispatched to ${profile.email}. Click the link to mark as verified.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    {!profile.emailVerified ? (
                      <>
                        <button
                          type="button"
                          onClick={handleVerifyEmailClick}
                          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify Email</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResendVerificationEmail}
                          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-[#cec3ce] hover:bg-slate-50 text-[#12001f] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5 text-[#9b4500]" />
                          <span>Resend Email</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateProfile({ ...profile, emailVerified: false });
                          alert('Email marked as Not Verified (for demo testing). You can now test the verification flow.');
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        title="Reset verification state to test UI"
                      >
                        (Test Unverified Flow)
                      </button>
                    )}
                  </div>
                </div>

                {/* Resent Notification Banner */}
                {emailResentToast && (
                  <div className="bg-blue-50 text-blue-900 text-xs p-3 rounded-xl border border-blue-200 flex items-center gap-2 animate-in fade-in">
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>Verification email has been resent to <strong>{profile.email}</strong>. Check your inbox and click "Verify Email".</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/50 p-2.5 rounded-lg focus:ring-1 focus:ring-[#311042] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/50 p-2.5 rounded-lg focus:ring-1 focus:ring-[#311042] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/50 p-2.5 rounded-lg focus:ring-1 focus:ring-[#311042] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">City / Region</label>
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/50 p-2.5 rounded-lg focus:ring-1 focus:ring-[#311042] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Emergency Contact Person</label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/50 p-2.5 rounded-lg focus:ring-1 focus:ring-[#311042] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Emergency Phone Number</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/50 p-2.5 rounded-lg focus:ring-1 focus:ring-[#311042] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#cec3ce]/30">
                    {onLogout ? (
                      <button
                        type="button"
                        onClick={onLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out Account</span>
                      </button>
                    ) : <div />}
                    <button
                      type="submit"
                      className="bg-[#311042] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#9b4500] transition-colors"
                    >
                      Save Profile Details
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 5. SUPPORT & SAFETY TAB */}
            {activeTab === 'support' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Festival helpline */}
                  <div className="bg-white p-6 rounded-2xl flex flex-col gap-3 border border-[#cec3ce]/30 shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdbca] text-[#9b4500] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">support_agent</span>
                    </div>
                    <div>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                        24/7 Festival Helpline
                      </h3>
                      <p className="text-xs text-[#596579] leading-relaxed mt-1">
                        Our dedicated support coordinators are stationed on-ground in Ahmedabad &amp; Gandhinagar during all Navratri nights.
                      </p>
                    </div>
                    <a
                      href="tel:+917926850000"
                      className="mt-auto bg-[#311042] text-white text-xs font-bold py-2.5 rounded-lg text-center hover:bg-[#9b4500] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call +91 79 2685 0000</span>
                    </a>
                  </div>

                  {/* SOS protocol */}
                  <div className="bg-white p-6 rounded-2xl flex flex-col gap-3 border border-rose-200 shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-rose-950">
                        Emergency SOS Protocol
                      </h3>
                      <p className="text-xs text-[#596579] leading-relaxed mt-1">
                        Immediate law enforcement coordination and local Ahmedabad Women Safety unit dispatch.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEmergencyModal(true)}
                      className="mt-auto bg-rose-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Open Emergency SOS</span>
                    </button>
                  </div>
                </div>

                {/* FAQ Accordion */}
                <div className="bg-white p-6 rounded-2xl border border-[#cec3ce]/30 space-y-3">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-2 text-xs">
                    <details className="p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-[#12001f]">
                        What is the policy on public meetings?
                      </summary>
                      <p className="text-[#596579] mt-2 leading-relaxed">
                        All companion experiences must strictly take place in open, public festival grounds and mutually agreed festive locations. Private residences or non-public meetups are strictly prohibited and result in immediate ban.
                      </p>
                    </details>
                    <details className="p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-[#12001f]">
                        How does escrow payment work?
                      </summary>
                      <p className="text-[#596579] mt-2 leading-relaxed">
                        Your payment is held safely in escrow. It is only released to the companion after arrival check-in is confirmed at your agreed meeting place. If a companion fails to show up, a 100% refund is instantly credited.
                      </p>
                    </details>
                    <details className="p-3 bg-slate-50 rounded-xl cursor-pointer">
                      <summary className="font-semibold text-[#12001f]">
                        What is included in the Companion Pass?
                      </summary>
                      <p className="text-[#596579] mt-2 leading-relaxed">
                        The pass includes Garba dance accompaniment, festival choreography coordination, festive smartphone photography/candids, and dining companionship at the venue food stalls. Entry tickets to private ticketed venues must be arranged by the guest or as agreed.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Trust & Safety Shield (Always visible) */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl flex flex-col gap-5 shadow-xs border border-[#cec3ce]/30 sticky top-28">
              <div className="flex items-center gap-2 text-[#9b4500]">
                <span className="material-symbols-outlined filled text-[26px]">verified_user</span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                  Trust &amp; Safety Shield
                </h3>
              </div>
              <p className="text-xs text-[#596579] leading-relaxed">
                We ensure your Garba celebration is secure, transparent, and joyful across Ahmedabad and Gandhinagar.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#9b4500] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#12001f]">Book an Experience, Not a Person</h4>
                    <p className="text-[11px] text-[#596579] leading-relaxed">
                      All passes are strictly for cultural dance accompaniment and festive photography.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#9b4500] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#12001f]">Non-Sexual Interactions Only</h4>
                    <p className="text-[11px] text-[#596579] leading-relaxed">
                      Zero-tolerance policy for inappropriate behavior with instant permanent ban.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#9b4500] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#12001f]">Public Meeting Places</h4>
                    <p className="text-[11px] text-[#596579] leading-relaxed">
                      Meet only at verified public grounds and festival venues.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#cec3ce]/30 flex flex-col gap-2">
                <span className="text-[11px] text-[#596579] uppercase font-bold tracking-wider">
                  Need Immediate Assistance?
                </span>
                <button
                  onClick={() => setActiveTab('support')}
                  className="w-full bg-[#eff4ff] text-[#12001f] py-2 rounded-xl text-xs font-semibold hover:bg-[#dee9fc] transition-colors"
                >
                  Visit Safety Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {selectedBookingForCheckIn && (
        <CheckInModal
          booking={selectedBookingForCheckIn}
          onClose={() => setSelectedBookingForCheckIn(null)}
          onConfirmCheckIn={(bookingId) => {
            const updated: Booking = {
              ...selectedBookingForCheckIn,
              checkedIn: true,
              escrowStatus: 'Released upon Check-in'
            };
            onUpdateBooking(updated);
            setSelectedBookingForCheckIn(null);
            alert('Check-in confirmed! GPS coordinates verified at GMDC Ground. Have a joyful Garba night!');
          }}
        />
      )}

      {selectedBookingForOtp && (
        <CompletionOtpModal
          booking={selectedBookingForOtp}
          onClose={() => setSelectedBookingForOtp(null)}
          onVerifiedSuccess={() => {
            const updated: Booking = {
              ...selectedBookingForOtp,
              status: 'completed',
              completionOtpVerified: true,
              payoutStatus: 'ready_to_pay',
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            onUpdateBooking(updated);
          }}
        />
      )}

      {selectedBookingForReport && (
        <ReportProblemModal
          booking={selectedBookingForReport}
          profile={profile}
          onClose={() => setSelectedBookingForReport(null)}
        />
      )}

      {selectedBookingForCancel && (
        <CancelBookingModal
          booking={selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          onConfirmCancel={(bookingId, refundAmount) => {
            handleConfirmCancel(bookingId, refundAmount);
          }}
        />
      )}

      {showEmergencyModal && (
        <EmergencySosModal onClose={() => setShowEmergencyModal(false)} />
      )}

      {/* Simulated Email Verification Modal */}
      {showVerificationEmailModal && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/40 flex flex-col animate-in zoom-in-95">
            {/* Email Header */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#9b4500]" />
                <span className="font-semibold text-slate-800">Inbox Preview: Official Verification Email</span>
              </div>
              <button
                onClick={() => setShowVerificationEmailModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="border-b pb-3 space-y-1">
                <p><strong>From:</strong> Navratri Companion &lt;verify@navratricompanion.com&gt;</p>
                <p><strong>To:</strong> {profile.email}</p>
                <p><strong>Subject:</strong> Verify your email address for Navratri Companion</p>
              </div>

              <div className="space-y-3 pt-1">
                <p className="font-semibold text-sm text-[#12001f]">
                  Hello {profile.name},
                </p>
                <p className="leading-relaxed">
                  Thank you for registering on Gujarat's verified festival companion network. Please click the button below to verify your email address and activate your booking pass receipts.
                </p>

                <div className="py-2 text-center">
                  <button
                    type="button"
                    onClick={handleVerifyEmailClick}
                    className="w-full py-3 px-6 rounded-xl bg-[#9b4500] hover:bg-[#763300] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Email Address</span>
                  </button>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                  ✓ Secure email link verification. No booking start OTP or SMS code required.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
