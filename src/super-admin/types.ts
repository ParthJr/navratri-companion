import { Booking, Companion, CompanionPayout, HostApplicant, UserProfile, VenueLiveStatus } from '../types';

export type SuperAdminTab =
  | 'overview'
  // Operations
  | 'bookings'
  | 'completion'
  | 'users'
  | 'payment-approvals'
  | 'companions'
  | 'applications'
  | 'payouts'
  | 'payments'
  | 'complaints'
  | 'safety'
  // Business & Finance
  | 'upi-settings'
  | 'platform-fees'
  | 'registration-fee'
  | 'commissions'
  | 'pricing-packages'
  | 'pricing'
  | 'coupons'
  // Communication
  | 'notifications'
  | 'announcements'
  // Analytics
  | 'analytics'
  // System
  | 'admin-users'
  | 'roles-permissions'
  | 'audit-logs'
  | 'legal-policies'
  | 'settings';

export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'operations_manager'
  | 'safety_lead'
  | 'financial_auditor';

export interface AdminUser {
  id: string;
  adminId: string; // Dedicated Admin ID used for authentication
  password: string; // Configurable admin password for demo and secure access
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  lastLogin: string;
  avatarUrl?: string;
  phone: string;
}

export interface RolePermissionConfig {
  displayName: string;
  description: string;
  badgeColor: string;
  allowedTabs: SuperAdminTab[];
  canManageFees: boolean;
  canReleasePayouts: boolean;
  canApproveKyc: boolean;
  canResolveSafety: boolean;
  canManageAdmins: boolean;
  canEditSettings: boolean;
  canResolveComplaints: boolean;
  canManagePolicies: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissionConfig> = {
  super_admin: {
    displayName: 'Super Admin',
    description: 'Full unrestricted governance over platform, finance, security, and staff.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    allowedTabs: [
      'overview', 'bookings', 'completion', 'users', 'payment-approvals', 'companions', 'applications', 'payouts', 'payments',
      'complaints', 'safety', 'upi-settings', 'platform-fees', 'registration-fee', 'commissions',
      'pricing-packages', 'pricing', 'coupons', 'notifications', 'announcements',
      'analytics', 'admin-users', 'roles-permissions', 'audit-logs', 'legal-policies', 'settings',
    ],
    canManageFees: true,
    canReleasePayouts: true,
    canApproveKyc: true,
    canResolveSafety: true,
    canManageAdmins: true,
    canEditSettings: true,
    canResolveComplaints: true,
    canManagePolicies: true,
  },
  operations_admin: {
    displayName: 'Operations Admin',
    description: 'Oversees bookings, companion schedules, KYC applications, and ground events.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    allowedTabs: [
      'overview', 'bookings', 'completion', 'users', 'payment-approvals', 'companions', 'applications', 'complaints', 'safety', 'roles-permissions', 'legal-policies',
    ],
    canManageFees: false,
    canReleasePayouts: false,
    canApproveKyc: true,
    canResolveSafety: true,
    canManageAdmins: false,
    canEditSettings: false,
    canResolveComplaints: true,
    canManagePolicies: true,
  },
  operations_manager: {
    displayName: 'Operations Admin',
    description: 'Oversees bookings, companion schedules, KYC applications, and ground events.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    allowedTabs: [
      'overview', 'bookings', 'completion', 'users', 'payment-approvals', 'companions', 'applications', 'complaints', 'safety', 'roles-permissions', 'legal-policies',
    ],
    canManageFees: false,
    canReleasePayouts: false,
    canApproveKyc: true,
    canResolveSafety: true,
    canManageAdmins: false,
    canEditSettings: false,
    canResolveComplaints: true,
    canManagePolicies: true,
  },
  finance_admin: {
    displayName: 'Finance Admin',
    description: 'Controls escrow releases, payouts, UPI verification, commissions, and revenue.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    allowedTabs: [
      'overview', 'completion', 'users', 'payment-approvals', 'payouts', 'payments', 'upi-settings', 'platform-fees', 'registration-fee', 'commissions', 'pricing-packages', 'pricing', 'analytics',
    ],
    canManageFees: true,
    canReleasePayouts: true,
    canApproveKyc: false,
    canResolveSafety: false,
    canManageAdmins: false,
    canEditSettings: false,
    canResolveComplaints: false,
    canManagePolicies: false,
  },
  financial_auditor: {
    displayName: 'Finance Admin',
    description: 'Controls escrow releases, payouts, UPI verification, commissions, and revenue.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    allowedTabs: [
      'overview', 'payouts', 'payments', 'upi-settings', 'platform-fees', 'registration-fee', 'commissions', 'pricing-packages', 'pricing', 'analytics',
    ],
    canManageFees: true,
    canReleasePayouts: true,
    canApproveKyc: false,
    canResolveSafety: false,
    canManageAdmins: false,
    canEditSettings: false,
    canResolveComplaints: false,
    canManagePolicies: false,
  },
  support_admin: {
    displayName: 'Support Admin',
    description: 'Handles customer accounts, verification emails, guest complaints, and emergency SOS alerts.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    allowedTabs: [
      'overview', 'users', 'complaints', 'safety', 'notifications', 'announcements', 'legal-policies',
    ],
    canManageFees: false,
    canReleasePayouts: false,
    canApproveKyc: false,
    canResolveSafety: true,
    canManageAdmins: false,
    canEditSettings: false,
    canResolveComplaints: true,
    canManagePolicies: false,
  },
  safety_lead: {
    displayName: 'Support Admin',
    description: 'Handles customer accounts, verification emails, guest complaints, and emergency SOS alerts.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    allowedTabs: [
      'overview', 'users', 'complaints', 'safety', 'notifications', 'announcements', 'legal-policies',
    ],
    canManageFees: false,
    canReleasePayouts: false,
    canApproveKyc: false,
    canResolveSafety: true,
    canManageAdmins: false,
    canEditSettings: false,
    canResolveComplaints: true,
    canManagePolicies: false,
  },
};

export interface PlatformFeeConfig {
  feeType: 'fixed' | 'percentage';
  fixedFee: number; // e.g. 50
  percentageRate: number; // e.g. 5 (%)
  applyTo2h: boolean;
  applyTo4h: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface RegistrationFeeConfig {
  enabled: boolean;
  amount: number; // e.g. 499
  lastUpdated: string;
  updatedBy: string;
  totalRegisteredCompanions: number;
  paidCompanions: number;
  pendingCompanions: number;
  totalRevenue: number;
}

export interface CommissionConfig {
  defaultCommissionPercentage: number; // e.g. 15
  cityCommissions: Record<string, number>; // { 'Ahmedabad': 15, 'Gandhinagar': 15 }
  companionOverrides: Record<string, number>; // { 'riya': 10 }
  lastUpdated: string;
  updatedBy: string;
}

export interface PackageTierConfig {
  id: string;
  name: string;
  durationHours: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  active: boolean;
  description: string;
  cityPricing?: Record<string, number>;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount: number;
  expiresAt: string;
  usageCount: number;
  maxUsage: number;
  active: boolean;
  description: string;
}

export interface ComplaintItem {
  id: string;
  bookingId?: string;
  reporterType: 'guest' | 'companion';
  reporterName: string;
  reporterPhone: string;
  targetName: string;
  category:
    | 'late_arrival'
    | 'unprofessional_behavior'
    | 'payment_dispute'
    | 'safety_concern'
    | 'venue_issue'
    | 'fake_profile'
    | 'harassment'
    | 'no_show'
    | 'other';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  subject: string;
  description: string;
  createdAt: string;
  resolvedAt?: string;
  assignedAdmin?: string;
  resolutionNotes?: string;
}

export type { LegalPolicyItem, PolicyAuditEntry } from '../data/legalPoliciesData';

export interface SafetyIncidentItem {
  id: string;
  bookingId?: string;
  incidentType: 'emergency_sos' | 'geofence_deviation' | 'unresponsive_checkin' | 'harassment_alert';
  severity: 'high' | 'critical';
  status: 'active' | 'police_dispatched' | 'resolved' | 'false_alarm';
  guestName: string;
  companionName: string;
  venue: string;
  city: string;
  timestamp: string;
  policeStationNotified?: string;
  emergencyOfficer: string;
  notes: string;
  resolvedAt?: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  companionName: string;
  amount: number;
  platformFee: number;
  gatewayFee: number;
  payoutAmount: number;
  paymentMethod: 'UPI'; // UPI only!
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  refundAmount?: number;
  date: string;
  gatewayTxnId: string;
  paymentReference?: string; // Auto-generated payment reference (e.g. NC10245-REG or RAHUL99-BOOK-7842)
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  category: 'fees' | 'payouts' | 'companions' | 'bookings' | 'users' | 'safety' | 'system' | 'auth';
  details: string;
  ipAddress: string;
}

export interface SystemSettingsConfig {
  platformName: string;
  supportEmail: string;
  emergencyHotline: string;
  policeControlNumber: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  autoEscrowReleaseHours: number;
  checkInWindowMinutes?: number;
  activeAnnouncement?: string;
  announcementType?: 'info' | 'warning' | 'alert';
  
  // Platform Super Admin UPI Configuration
  platformUpiId: string; // e.g. "987654321012@upi" or 12-char UPI ID
  platformUpiQrUrl: string; // URL / Base64 of Admin's official UPI QR code
  platformPayeeName: string;

  // WhatsApp Support Configuration
  whatsappNumber?: string; // international format digits only, e.g. "919876543210"
  whatsappDefaultMessage?: string; // e.g. "Hello Navratri Companion team, I need help with the platform."
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'customer' | 'companion' | 'user' | 'admin' | 'owner';
  city: string;
  idVerified: boolean;
  emailVerified: boolean; // Email verification status
  aadhaarImage?: string;
  selfieImage?: string;
  registrationFeePaid: boolean;
  registrationDate: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'suspended' | 'blocked';
  notes?: string;
  // Payment Approval fields
  paymentReference?: string;
  paymentAmount?: number;
  paymentStatus?: 'Pending Verification' | 'Approved' | 'Rejected' | 'Pending';
  paymentSubmittedAt?: string;
  paymentApprovedAt?: string;
  paymentApprovedBy?: string;
  rejectionReason?: string;
  // Password Reset fields
  mustChangePassword?: boolean;
  temporaryPassword?: boolean;
  passwordExpiresAt?: string | null;
  passwordResetAt?: string | null;
  passwordResetBy?: string | null;
}
