import {
  AdminUser,
  AuditLogItem,
  ComplaintItem,
  CouponItem,
  CustomerUser,
  PackageTierConfig,
  PaymentTransaction,
  PlatformFeeConfig,
  RegistrationFeeConfig,
  CommissionConfig,
  SafetyIncidentItem,
  SystemSettingsConfig,
} from '../types';

export const DEFAULT_PLATFORM_FEE: PlatformFeeConfig = {
  feeType: 'fixed',
  fixedFee: 50,
  percentageRate: 5.0,
  applyTo2h: true,
  applyTo4h: true,
  lastUpdated: 'Oct 15, 2026, 10:30 AM',
  updatedBy: 'Parth Patel (Super Admin)',
};

export const DEFAULT_REGISTRATION_FEE: RegistrationFeeConfig = {
  enabled: true,
  amount: 499,
  lastUpdated: 'Just now',
  updatedBy: 'Platform Admin',
  totalRegisteredCompanions: 0,
  paidCompanions: 0,
  pendingCompanions: 0,
  totalRevenue: 0,
};

export const DEFAULT_COMMISSION: CommissionConfig = {
  defaultCommissionPercentage: 15,
  cityCommissions: {
    Ahmedabad: 15,
    Gandhinagar: 15,
    Surat: 15,
    Vadodara: 15,
  },
  companionOverrides: {},
  lastUpdated: 'Just now',
  updatedBy: 'Platform Admin',
};

export const DEFAULT_PACKAGES: PackageTierConfig[] = [
  {
    id: 'pkg-2h',
    name: '2 Hours Garba Circle Pass',
    durationHours: 2,
    basePrice: 1499,
    minPrice: 999,
    maxPrice: 2499,
    active: true,
    description: 'Perfect for quick evening rounds, step learning & Aarti participation.',
    cityPricing: {
      Ahmedabad: 1499,
      Gandhinagar: 1399,
    },
  },
  {
    id: 'pkg-4h',
    name: '4 Hours Full Night Prime Pass',
    durationHours: 4,
    basePrice: 2799,
    minPrice: 1999,
    maxPrice: 4499,
    active: true,
    description: 'Complete high-energy Dandiya Raas session including VIP venue escort.',
    cityPricing: {
      Ahmedabad: 2799,
      Gandhinagar: 2599,
    },
  },
];

export const DEFAULT_COUPONS: CouponItem[] = [
  {
    id: 'cpn-1',
    code: 'GARBA2026',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 200,
    minBookingAmount: 1400,
    expiresAt: '2026-10-25',
    usageCount: 0,
    maxUsage: 500,
    active: true,
    description: '10% festival discount for Navratri weekend bookings',
  },
  {
    id: 'cpn-2',
    code: 'FIRSTPASS50',
    discountType: 'fixed',
    discountValue: 50,
    minBookingAmount: 1000,
    expiresAt: '2026-10-24',
    usageCount: 0,
    maxUsage: 1000,
    active: true,
    description: 'Instant discount covering platform fee on first booking',
  },
];

export const DEFAULT_CUSTOMERS: CustomerUser[] = [];

export const DEFAULT_COMPLAINTS: ComplaintItem[] = [];

export const DEFAULT_SAFETY_INCIDENTS: SafetyIncidentItem[] = [];

export const DEFAULT_PAYMENTS: PaymentTransaction[] = [];

const PLATFORM_OWNER_ID =
  (import.meta.env.VITE_PLATFORM_OWNER_ID as string) ||
  (import.meta.env.PLATFORM_OWNER_ID as string) ||
  'parthjunior23';

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-owner',
    adminId: PLATFORM_OWNER_ID,
    password: '',
    name: 'Master Platform Administrator',
    email: 'owner@navratricompanion.com',
    role: 'super_admin',
    status: 'active',
    lastLogin: 'Active now',
    phone: '+91 99000 00000',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
];

export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsConfig = {
  platformName: 'Navratri Companion Super Admin',
  supportEmail: 'ops@navratricompanion.com',
  emergencyHotline: '1800 200 9090',
  policeControlNumber: '112 / 100 (Gujarat Police Navratri Cell)',
  maintenanceMode: false,
  allowNewRegistrations: true,
  autoEscrowReleaseHours: 6,
  activeAnnouncement: 'Navratri Day 5 High-Demand Alert: GMDC & Rajpath Club passes booking out rapidly.',
  announcementType: 'info',

  // Official Platform UPI Settings (Super Admin Configured)
  platformUpiId: '987654321012@upi', // Exactly 12-char identifier prefix: 987654321012
  platformUpiQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D987654321012%40upi%26pn%3DNavratri%2520Companion%2520Platform%26cu%3DINR',
  platformPayeeName: 'Navratri Companion Platform Owner',

  // Official Platform WhatsApp Support
  whatsappNumber: '918200564182',
  whatsappDefaultMessage: 'Hello Navratri Companion team, I need help with the platform.',
};
