export interface Companion {
  id: string;
  name: string;
  age: number;
  city: 'Ahmedabad' | 'Gandhinagar';
  area: string;
  rating: number;
  reviewCount: number;
  isTopHost?: boolean;
  idVerified: boolean;
  phoneVerified: boolean;
  backgroundChecked: boolean;
  avatarUrl: string;
  detailedPhotoUrl?: string;
  availableTonight?: boolean;
  availableDates: string[]; // e.g. ['oct11', 'oct12', 'oct15']
  experiences: string[]; // ['Garba', 'Photos', 'Conversation', 'Dinner', 'Garba Event']
  durations: number[]; // [2, 4]
  price2h: number; // e.g. 1499
  price4h: number; // e.g. 2799
  bioSnippet: string;
  fullBio: string;
  yearsExperience: number;
  responseRate: string; // e.g. '99%'
  responseTime: string; // e.g. 'Within 10 mins'
  skills: string[];
  inclusions: string[];
  preferredVenues: string[];
  phone: string;
}

export interface Booking {
  id: string;
  companionId: string;
  companionName: string;
  companionAge: number;
  companionCity: string;
  companionAvatar: string;
  companionPhone: string;
  companionUpi?: string;
  guestName: string;
  guestPhone: string;
  date: string; // e.g. 'October 12, 2026'
  rawDate: string; // 'oct12'
  timeSlot: string; // '7:00 PM – 9:00 PM'
  duration: '2 Hours' | '4 Hours';
  venue: string; // 'GMDC Ground, Ahmedabad'
  baseFee: number; // Companion gets 100% of this!
  platformFee: number; // Platform fee
  totalFee: number; // baseFee + platformFee
  status: 'pending' | 'PENDING_PAYMENT_VERIFICATION' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  escrowStatus: 'Held in Escrow' | 'LOCKED' | 'Released upon Check-in' | 'Refunded';
  paymentStatus?: 'PENDING' | 'PENDING_CONFIRMATION' | 'PAID' | 'CONFIRMED' | 'REJECTED';
  paymentReference?: string;
  rejectionReason?: string;
  
  // Clean Check-in & Session Flow (NO START OTP)
  checkedIn: boolean;
  checkInTime?: string;
  checkedInBy?: string; // 'Customer: Rahul Sharma' | 'Companion: Riya' | 'Super Admin'
  sessionStarted: boolean;
  sessionStartTime?: string;
  // Completion OTP & Payout Control
  completionOtp?: string; // 4-digit Completion OTP e.g. "8492"
  completionOtpSent?: boolean;
  completionOtpVerified?: boolean; // true once correct Completion OTP is entered
  completedAt?: string;
  payoutStatus: 'escrow_held' | 'ready_to_pay' | 'approved' | 'paid' | 'rejected';
  bookedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  userId?: string;
  role?: 'user' | 'companion' | 'admin' | 'owner';
  city: string;
  idVerified: boolean;
  emailVerified: boolean; // Email verification status
  emailVerificationSent?: boolean;
  emergencyContact: string;
  emergencyPhone: string;
  savedPassesCount: number;
  aadhaarNumber?: string;
  aadhaarImage?: string;
  selfieImage?: string;
  registrationFeePaid: boolean;
  registrationFeeTxn?: string;
  hasCompletedProfile?: boolean;
  age?: string | number;
  area?: string;
  bio?: string;
  interests?: string;
  garbaStyle?: string;
  languages?: string;
  availability?: string;
  price2h?: string | number;
  price4h?: string | number;
  preferredVenues?: string;
  verificationStatus?: 'Pending Verification' | 'Verified' | 'Approved';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  type: 'booking' | 'safety' | 'event';
}

export interface CompanionPayout {
  id: string;
  companionId: string;
  companionName: string;
  companionAvatar: string;
  city: string;
  totalBookings: number;
  completedHours: number;
  grossEarned: number;
  platformCommission: number; // 15%
  netPayoutDue: number;
  payoutUpi: string;
  bankAccount: string;
  status: 'paid' | 'pending' | 'processing';
  lastPayoutDate?: string;
}

export interface VenueLiveStatus {
  id: string;
  name: string;
  city: string;
  activeSessionsNow: number;
  scheduledTonight: number;
  safetyPatrolOfficer: string;
  status: 'optimal' | 'busy' | 'alert';
}

export interface HostApplicant {
  id: string;
  name: string;
  age: number;
  city: string;
  area: string;
  garbaStyle: string;
  appliedAt: string;
  idDocument: string;
  aadhaarImage?: string;
  selfieImage?: string;
  registrationFeePaid: boolean;
  faceMatchScore?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  phone?: string;
  avatar?: string;
  experienceYears?: string;
  localityArea?: string;
  phoneVerified?: boolean;
  reviewStatus?: string;
  bio?: string;
}
