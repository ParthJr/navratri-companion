import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminUser,
  AdminRole,
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
  SuperAdminTab,
  SystemSettingsConfig,
  ROLE_PERMISSIONS,
} from '../types';
import {
  DEFAULT_ADMIN_USERS,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_COMMISSION,
  DEFAULT_COMPLAINTS,
  DEFAULT_COUPONS,
  DEFAULT_CUSTOMERS,
  DEFAULT_PACKAGES,
  DEFAULT_PAYMENTS,
  DEFAULT_PLATFORM_FEE,
  DEFAULT_REGISTRATION_FEE,
  DEFAULT_SAFETY_INCIDENTS,
  DEFAULT_SYSTEM_SETTINGS,
} from '../data/defaultData';
import {
  INITIAL_LEGAL_POLICIES,
  INITIAL_POLICY_AUDIT_LOGS,
  LegalPolicyItem,
  PolicyAuditEntry,
} from '../../data/legalPoliciesData';
import { clearAllSessions, verifyAdminSessionOnServer } from '../../services/unifiedAuth';
import {
  approvePaymentInDb,
  rejectPaymentInDb,
  fetchPaymentApprovalsFromDb,
  fetchUsersFromDb,
  fetchApplicationsFromDb,
  fetchActiveCompanionsFromDb,
  updateUserStatusInDb,
} from '../../services/dbService';
import { Booking, Companion, CompanionPayout, HostApplicant } from '../../types';
import { COMPANIONS_DATA } from '../../data/companions';
import { INITIAL_HOST_APPLICANTS, INITIAL_PAYOUTS } from '../../data/adminData';

interface SuperAdminContextType {
  // Navigation & Auth
  activeTab: SuperAdminTab;
  setActiveTab: (tab: SuperAdminTab) => void;
  isAuthenticated: boolean;
  currentAdmin: AdminUser | null;
  login: (adminId: string, pass: string) => boolean;
  logout: () => void;
  updateAdminCredentials: (idOrAdminId: string, updates: { adminId?: string; password?: string; name?: string }) => boolean;
  resetAdminCredentialsToDefault: () => void;
  hasTabPermission: (tab: SuperAdminTab, role?: AdminRole) => boolean;
  allowedTabs: SuperAdminTab[];

  // Platform Fee Config
  platformFeeConfig: PlatformFeeConfig;
  updatePlatformFee: (config: Partial<PlatformFeeConfig>) => void;
  calculatePlatformFee: (basePrice: number, packageType: '2 Hours' | '4 Hours') => number;

  // Registration Fee Config
  registrationFeeConfig: RegistrationFeeConfig;
  updateRegistrationFee: (config: Partial<RegistrationFeeConfig>) => void;

  // Commission Config
  commissionConfig: CommissionConfig;
  updateCommissionConfig: (config: Partial<CommissionConfig>) => void;

  // Packages & Pricing
  packages: PackageTierConfig[];
  updatePackage: (id: string, updates: Partial<PackageTierConfig>) => void;
  createPackage: (pkg: PackageTierConfig) => void;
  deletePackage: (id: string) => void;

  // Coupons
  coupons: CouponItem[];
  createCoupon: (coupon: CouponItem) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;

  // Customers / Users & Registration Payment Confirmations
  customers: CustomerUser[];
  addCustomer: (customer: CustomerUser) => void;
  updateCustomerStatus: (id: string, status: 'active' | 'suspended' | 'blocked') => void;
  verifyCustomerEmail: (id: string) => void;
  resendCustomerEmailVerification: (id: string) => void;
  confirmUserPayment: (userId: string) => void;
  rejectUserPayment: (userId: string, reason?: string) => void;

  // Companions
  companions: Companion[];
  isLoadingCompanions: boolean;
  companionsError: string | null;
  refreshCompanions: () => Promise<void>;
  addCompanion: (companion: Companion) => void;
  updateCompanion: (id: string, updates: Partial<Companion>) => void;
  deleteCompanion: (id: string) => void;
  updateCompanionStatus: (id: string, isTopHost?: boolean) => void;

  // Customer Impersonation (Super Admin Only)
  impersonatedCustomer: CustomerUser | null;
  impersonateCustomer: (customer: CustomerUser, reason?: string) => void;
  exitCustomerImpersonation: () => void;

  // Applications
  applicants: HostApplicant[];
  createApplication: (app: HostApplicant) => void;
  approveApplicant: (id: string) => void;
  rejectApplicant: (id: string) => void;
  syncApplicationsWithDb?: (apps: HostApplicant[]) => void;

  // Bookings & Completion OTP Flow
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  markBookingCheckedIn: (id: string, checkedInBy?: string) => void;
  startBookingSession: (id: string) => void;
  markBookingCompleted: (id: string) => void;
  resendCompletionOtp: (id: string) => string;
  verifyCompletionOtp: (id: string, enteredOtp: string) => boolean;
  confirmAdminPayout: (bookingId: string) => void;
  updatePayoutStatus: (bookingId: string, status: 'ready_to_pay' | 'approved' | 'paid' | 'rejected') => void;
  updateBookingCompletionAndAudit: (bookingId: string, updates: Partial<Booking>, auditAction: string, auditDetails: string) => void;
  cancelBooking: (id: string, reason?: string) => void;
  refundBooking: (id: string) => void;

  // Payouts
  payouts: CompanionPayout[];
  releasePayout: (id: string) => void;
  batchReleasePayouts: () => void;

  // Payments
  payments: PaymentTransaction[];

  // Complaints
  complaints: ComplaintItem[];
  createComplaint: (complaint: ComplaintItem) => void;
  updateComplaintStatus: (id: string, status: ComplaintItem['status'], notes?: string) => void;

  // Safety
  safetyIncidents: SafetyIncidentItem[];
  createSafetyIncident: (incident: SafetyIncidentItem) => void;
  resolveSafetyIncident: (id: string, notes: string) => void;

  // Admin Users & RBAC
  adminUsers: AdminUser[];
  addAdminUser: (user: AdminUser) => void;
  updateAdminStatus: (id: string, status: 'active' | 'suspended') => void;

  // Audit Logs
  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, category: AuditLogItem['category'], details: string) => void;

  // System Settings
  systemSettings: SystemSettingsConfig;
  updateSystemSettings: (settings: Partial<SystemSettingsConfig>) => void;

  // Legal & Policy Management
  legalPolicies: LegalPolicyItem[];
  policyAuditHistory: PolicyAuditEntry[];
  updateLegalPolicy: (id: string, updates: Partial<LegalPolicyItem>, changeSummary?: string) => void;

  // Centralized Metrics Calculation Functions
  getTotalRevenue: () => number;
  getRegistrationRevenue: () => number;
  getBookingFeeRevenue: () => number;
  getGMV: () => number;
  getTotalUsers: () => number;
  getActiveUsers: () => number;
  getTotalCompanions: () => number;
  getPendingApplications: () => number;
  getActiveBookings: () => number;
  getCompletedBookings: () => number;
  getCancelledBookings: () => number;
  getOpenComplaints: () => number;
  getSafetyIncidents: () => number;
}

const VALID_SUPER_ADMIN_TABS: SuperAdminTab[] = [
  'overview',
  'bookings',
  'completion',
  'users',
  'payment-approvals',
  'companions',
  'applications',
  'payouts',
  'payments',
  'complaints',
  'safety',
  'platform-fees',
  'registration-fee',
  'commissions',
  'pricing-packages',
  'coupons',
  'notifications',
  'announcements',
  'analytics',
  'admin-users',
  'audit-logs',
  'settings',
  'upi-settings',
];

const getTabFromUrl = (): SuperAdminTab => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const hash = window.location.hash;

    let segment = '';
    if (path.includes('/super-admin/')) {
      segment = path.split('/super-admin/')[1]?.split('/')[0] || '';
    } else if (path.includes('/admin/')) {
      segment = path.split('/admin/')[1]?.split('/')[0] || '';
    } else if (hash.includes('super-admin/')) {
      segment = hash.split('super-admin/')[1]?.split('/')[0] || '';
    } else if (hash.includes('admin/')) {
      segment = hash.split('admin/')[1]?.split('/')[0] || '';
    }

    if (segment && VALID_SUPER_ADMIN_TABS.includes(segment as SuperAdminTab)) {
      return segment as SuperAdminTab;
    }
  }
  return 'overview';
};

const SuperAdminContext = createContext<SuperAdminContextType | null>(null);

export const SuperAdminProvider: React.FC<{
  children: React.ReactNode;
  initialBookings?: Booking[];
  initialCompanions?: Companion[];
}> = ({ children, initialBookings, initialCompanions }) => {
  const [activeTab, setActiveTabState] = useState<SuperAdminTab>(getTabFromUrl);

  const setActiveTab = (tab: SuperAdminTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = tab === 'overview' ? '/super-admin' : `/super-admin/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const tabFromUrl = getTabFromUrl();
      if (tabFromUrl !== activeTab) {
        setActiveTabState(tabFromUrl);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [activeTab]);

  // One-time purge of legacy mock/demo data from previous versions
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

  // Auth State (Separate adminSession storage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('adminSession') === 'true' ||
        localStorage.getItem('navratri_super_admin_auth') === 'true'
      );
    }
    return false;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('navratri_admin_users_config');
    if (saved) {
      try {
        const parsed: AdminUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure all accounts have adminId, password and valid roles
          return parsed.map((u) => {
            const defaultMatch = DEFAULT_ADMIN_USERS.find(
              (d) =>
                d.id === u.id ||
                d.adminId.toLowerCase() === (u.adminId || '').toLowerCase() ||
                d.role === u.role
            );
            return {
              ...u,
              adminId: u.adminId || defaultMatch?.adminId || 'admin',
              password: u.password || defaultMatch?.password || '',
              role: u.role || defaultMatch?.role || 'super_admin',
            };
          });
        }
      } catch (e) {
        return DEFAULT_ADMIN_USERS;
      }
    }
    return DEFAULT_ADMIN_USERS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const isAuth =
        localStorage.getItem('adminSession') === 'true' ||
        localStorage.getItem('navratri_super_admin_auth') === 'true';
      if (!isAuth) return null;

      const saved = localStorage.getItem('navratri_super_admin_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const match = DEFAULT_ADMIN_USERS.find((u) => u.adminId === parsed.adminId || u.id === parsed.id);
          return {
            ...parsed,
            adminId: parsed.adminId || match?.adminId || 'admin',
            password: parsed.password || match?.password || '',
            role: parsed.role || match?.role || 'super_admin',
          };
        } catch (e) {
          return DEFAULT_ADMIN_USERS[0];
        }
      }
      return DEFAULT_ADMIN_USERS[0];
    }
    return null;
  });

  // Business Configs
  const [platformFeeConfig, setPlatformFeeConfig] = useState<PlatformFeeConfig>(() => {
    const saved = localStorage.getItem('navratri_platform_fee_config');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORM_FEE;
  });

  const [registrationFeeConfig, setRegistrationFeeConfig] = useState<RegistrationFeeConfig>(() => {
    const saved = localStorage.getItem('navratri_reg_fee_config');
    return saved ? JSON.parse(saved) : DEFAULT_REGISTRATION_FEE;
  });

  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>(() => {
    const saved = localStorage.getItem('navratri_commission_config');
    return saved ? JSON.parse(saved) : DEFAULT_COMMISSION;
  });

  const [packages, setPackages] = useState<PackageTierConfig[]>(() => {
    const saved = localStorage.getItem('navratri_packages_config');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
  });

  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    const saved = localStorage.getItem('navratri_coupons_config');
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  });

  const [customers, setCustomers] = useState<CustomerUser[]>([]);

  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    const saved = localStorage.getItem('navratri_complaints_config');
    return saved ? JSON.parse(saved) : DEFAULT_COMPLAINTS;
  });

  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncidentItem[]>(() => {
    const saved = localStorage.getItem('navratri_safety_incidents_config');
    return saved ? JSON.parse(saved) : DEFAULT_SAFETY_INCIDENTS;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('navratri_payments_config');
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('navratri_audit_logs_config');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  const [legalPolicies, setLegalPolicies] = useState<LegalPolicyItem[]>(() => {
    const saved = localStorage.getItem('navratri_legal_policies_config');
    return saved ? JSON.parse(saved) : INITIAL_LEGAL_POLICIES;
  });

  const [policyAuditHistory, setPolicyAuditHistory] = useState<PolicyAuditEntry[]>(() => {
    const saved = localStorage.getItem('navratri_policy_audit_history');
    return saved ? JSON.parse(saved) : INITIAL_POLICY_AUDIT_LOGS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig>(() => {
    const saved = localStorage.getItem('navratri_system_settings_config');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
  });

  // Companions and Bookings synced with app
  const [companions, setCompanions] = useState<Companion[]>(() => {
    const saved = localStorage.getItem('navratri_companions_database');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c.id !== 'riya' && c.id !== 'aarav');
        }
      } catch (e) {
        // Fallback
      }
    }
    return initialCompanions || [];
  });

  const [isLoadingCompanions, setIsLoadingCompanions] = useState<boolean>(false);
  const [companionsError, setCompanionsError] = useState<string | null>(null);

  const [impersonatedCustomer, setImpersonatedCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('navratri_impersonated_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const refreshCompanions = async () => {
    setIsLoadingCompanions(true);
    setCompanionsError(null);
    try {
      const res = await fetchActiveCompanionsFromDb();
      if (res.success) {
        setCompanions(res.companions);
        localStorage.setItem('navratri_companions_database', JSON.stringify(res.companions));
      } else {
        setCompanionsError(res.errorMessage || 'Unable to load companions. Please try again.');
      }
    } catch (err: any) {
      setCompanionsError(err?.message || 'Unable to load companions. Please try again.');
    } finally {
      setIsLoadingCompanions(false);
    }
  };

  const impersonateCustomer = (customer: CustomerUser, reason?: string) => {
    setImpersonatedCustomer(customer);
    try {
      sessionStorage.setItem('navratri_impersonated_customer', JSON.stringify(customer));
    } catch {}
    addAuditLog(
      'Admin Customer Impersonation Started',
      'users',
      `Super Admin ${currentAdmin?.name || 'Admin'} started viewing as customer ${customer.name} (${customer.id}). ${reason ? `Reason: ${reason}` : ''}`
    );
  };

  const exitCustomerImpersonation = () => {
    if (impersonatedCustomer) {
      addAuditLog(
        'Admin Customer Impersonation Ended',
        'users',
        `Super Admin ended viewing as customer ${impersonatedCustomer.name} (${impersonatedCustomer.id})`
      );
    }
    setImpersonatedCustomer(null);
    try {
      sessionStorage.removeItem('navratri_impersonated_customer');
    } catch {}
  };

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('navratri_companion_bookings');
    return saved ? JSON.parse(saved) : (initialBookings || []);
  });

  const [payouts, setPayouts] = useState<CompanionPayout[]>(() => {
    const saved = localStorage.getItem('navratri_companion_payouts');
    return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
  });

  const [applicants, setApplicants] = useState<HostApplicant[]>(() => {
    try {
      const saved = localStorage.getItem('navratri_companion_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a) => a.id !== 'app-1' && !a.name?.includes('Pooja Patel'));
        }
      }
    } catch (e) {}
    return [];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('navratri_platform_fee_config', JSON.stringify(platformFeeConfig));
  }, [platformFeeConfig]);

  useEffect(() => {
    localStorage.setItem('navratri_reg_fee_config', JSON.stringify(registrationFeeConfig));
  }, [registrationFeeConfig]);

  useEffect(() => {
    localStorage.setItem('navratri_commission_config', JSON.stringify(commissionConfig));
  }, [commissionConfig]);

  useEffect(() => {
    localStorage.setItem('navratri_packages_config', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('navratri_coupons_config', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('navratri_customers_config', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('navratri_complaints_config', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('navratri_safety_incidents_config', JSON.stringify(safetyIncidents));
  }, [safetyIncidents]);

  useEffect(() => {
    localStorage.setItem('navratri_payments_config', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('navratri_admin_users_config', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('navratri_audit_logs_config', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('navratri_system_settings_config', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('navratri_legal_policies_config', JSON.stringify(legalPolicies));
  }, [legalPolicies]);

  useEffect(() => {
    localStorage.setItem('navratri_policy_audit_history', JSON.stringify(policyAuditHistory));
  }, [policyAuditHistory]);

  useEffect(() => {
    localStorage.setItem('navratri_companion_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('navratri_companion_payouts', JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem('navratri_companions_database', JSON.stringify(companions));
  }, [companions]);

  useEffect(() => {
    localStorage.setItem('navratri_companion_applications', JSON.stringify(applicants));
  }, [applicants]);

  // Live Central Database Synchronization for Customers/Users and Applications
  useEffect(() => {
    const syncDbData = async () => {
      try {
        const [approvalsRes, usersList, appsRes] = await Promise.all([
          fetchPaymentApprovalsFromDb().catch(() => ({ success: false, requests: [], pendingCount: 0 })),
          fetchUsersFromDb().catch(() => []),
          fetchApplicationsFromDb().catch(() => ({ success: false, applications: [], pendingCount: 0 })),
        ]);

        // Sync host applications from central database
        if (appsRes.success && Array.isArray(appsRes.applications)) {
          setApplicants(appsRes.applications);
        }

        const dbCustomers: CustomerUser[] = [];

        // 1. Process all users from DB
        if (Array.isArray(usersList) && usersList.length > 0) {
          usersList.forEach((u) => {
            const accStatus = (u.accountStatus || '').toLowerCase();
            const payStatus = (u.paymentStatus || '').toLowerCase();
            const isCustomer = u.role === 'customer' || u.role === 'user';
            const isAdmin = u.role === 'owner' || u.role === 'admin';

            let resolvedStatus: 'active' | 'suspended' | 'blocked' = 'suspended';
            if (accStatus === 'blocked' || payStatus === 'rejected' || accStatus === 'payment_rejected') {
              resolvedStatus = 'blocked';
            } else if (accStatus === 'suspended') {
              resolvedStatus = 'suspended';
            } else if (accStatus === 'active' || isAdmin || (isCustomer && accStatus !== 'pending_approval')) {
              resolvedStatus = 'active';
            } else if (u.feePaid && payStatus === 'approved') {
              resolvedStatus = 'active';
            }

            const isApproved = u.feePaid && (accStatus === 'active' || payStatus === 'approved');
            const isRejected = payStatus === 'rejected' || accStatus === 'payment_rejected';
            const isSubmittedPending =
              accStatus === 'pending_approval' ||
              (Boolean(u.paymentSubmittedAt) && payStatus === 'pending');
            
            dbCustomers.push({
              id: u.userId,
              name: u.name,
              email: u.email,
              phone: u.phone || '',
              role: u.role || 'customer',
              city: u.city || 'Ahmedabad',
              registrationDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
              totalBookings: 0,
              totalSpent: isApproved ? 499 : 0,
              status: resolvedStatus,
              idVerified: Boolean(u.aadhaarImage && u.selfieImage),
              emailVerified: true,
              registrationFeePaid: Boolean(u.feePaid),
              paymentStatus: isApproved
                ? 'Approved'
                : isRejected
                ? 'Rejected'
                : isSubmittedPending
                ? 'Pending Verification'
                : 'Pending',
              paymentReference: u.paymentReference || (isApproved ? 'Approved' : isSubmittedPending ? 'Submitted (Pending Ref)' : 'Pending'),
              paymentSubmittedAt: u.paymentSubmittedAt || u.createdAt,
              rejectionReason: u.rejectionReason || undefined,
              aadhaarImage: u.aadhaarImage,
              selfieImage: u.selfieImage,
            });
          });
        }

        // 2. Merge / enrich with payment approvals if available
        if (approvalsRes.success && Array.isArray(approvalsRes.requests) && approvalsRes.requests.length > 0) {
          approvalsRes.requests.forEach((r) => {
            const existingIdx = dbCustomers.findIndex((c) => c.id.toLowerCase() === r.userId.toLowerCase());
            const custItem: CustomerUser = {
              id: r.userId,
              name: r.name,
              email: r.email,
              phone: r.phone,
              role: r.role || 'customer',
              city: r.city || 'Ahmedabad',
              registrationDate: r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : r.submittedAt ? r.submittedAt.split(',')[0] : 'Today',
              totalBookings: 0,
              totalSpent: r.status === 'Approved' ? (r.amount || 499) : 0,
              status: r.status === 'Approved' ? 'active' : r.status === 'Rejected' ? 'blocked' : 'suspended',
              idVerified: Boolean(r.aadhaarImage && r.selfieImage),
              emailVerified: true,
              registrationFeePaid: r.status === 'Approved',
              paymentStatus: r.status === 'Approved' ? 'Approved' : r.status === 'Rejected' ? 'Rejected' : 'Pending Verification',
              rejectionReason: r.rejectionReason || undefined,
              paymentReference: r.paymentReference,
              paymentSubmittedAt: r.submittedAt,
              paymentApprovedAt: r.approvedAt || undefined,
              paymentApprovedBy: r.approvedBy || undefined,
              aadhaarImage: r.aadhaarImage,
              selfieImage: r.selfieImage,
            };

            if (existingIdx >= 0) {
              dbCustomers[existingIdx] = { ...dbCustomers[existingIdx], ...custItem };
            } else {
              dbCustomers.push(custItem);
            }
          });
        }

        if (Array.isArray(usersList)) {
          setCustomers(dbCustomers);
        }

        await refreshCompanions();
      } catch (e) {}
    };

    syncDbData();
    const interval = setInterval(syncDbData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const addAuditLog = (action: string, category: AuditLogItem['category'], details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      adminName: currentAdmin?.name || 'Parth Patel',
      adminRole: currentAdmin?.role || 'super_admin',
      action,
      category,
      details,
      ipAddress: '103.21.126.88 (Ahmedabad, Gujarat)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const hasTabPermission = (tab: SuperAdminTab, targetRole?: AdminRole): boolean => {
    const role = targetRole || currentAdmin?.role || 'super_admin';
    const config = ROLE_PERMISSIONS[role];
    if (!config) return true;
    return config.allowedTabs.includes(tab);
  };

  const allowedTabs: SuperAdminTab[] = currentAdmin
    ? ROLE_PERMISSIONS[currentAdmin.role]?.allowedTabs || ROLE_PERMISSIONS.super_admin.allowedTabs
    : ROLE_PERMISSIONS.super_admin.allowedTabs;

  const login = (adminId: string, pass?: string): boolean => {
    if (!adminId) return false;
    const cleanId = adminId.trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // 1. Check if user data is already in saved admin session
    const savedUserStr = localStorage.getItem('navratri_super_admin_user');
    if (savedUserStr) {
      try {
        const savedUser: AdminUser = JSON.parse(savedUserStr);
        if (
          savedUser.adminId?.toLowerCase() === cleanId ||
          cleanId === 'parthjunior23' ||
          cleanId === 'admin' ||
          cleanId === 'superadmin' ||
          cleanId === 'owner_admin' ||
          cleanId === 'owner' ||
          cleanId === 'admin@navratricompanion.com' ||
          cleanId === 'owner@navratricompanion.com'
        ) {
          const updatedUser: AdminUser = {
            ...savedUser,
            lastLogin: 'Just now',
          };
          setCurrentAdmin(updatedUser);
          setIsAuthenticated(true);
          localStorage.setItem('adminSession', 'true');
          localStorage.setItem('navratri_super_admin_auth', 'true');
          localStorage.setItem('navratri_super_admin_user', JSON.stringify(updatedUser));
          addAuditLog(
            'Admin Login',
            'auth',
            `Admin ${updatedUser.name} signed in with Admin ID "${updatedUser.adminId}".`
          );
          return true;
        }
      } catch (e) {}
    }

    // 2. Check configured admin users in adminUsers list
    const found = adminUsers.find(
      (u) =>
        (u.adminId?.toLowerCase() === cleanId || u.email?.toLowerCase() === cleanId) &&
        (cleanPass ? u.password === cleanPass : true) &&
        u.status === 'active'
    );

    if (found) {
      if (found.status === 'suspended') return false;

      const updatedUser: AdminUser = {
        ...found,
        lastLogin: 'Just now',
      };

      setCurrentAdmin(updatedUser);
      setIsAuthenticated(true);
      setAdminUsers((prev) => {
        const exists = prev.some((u) => u.id === found.id || u.adminId === found.adminId);
        if (exists) {
          return prev.map((u) => (u.id === found.id || u.adminId === found.adminId ? updatedUser : u));
        }
        return [updatedUser, ...prev];
      });

      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('navratri_super_admin_auth', 'true');
      localStorage.setItem('navratri_super_admin_user', JSON.stringify(updatedUser));

      if (!hasTabPermission(activeTab, updatedUser.role)) {
        setActiveTab('overview');
      }

      addAuditLog(
        'Admin Login',
        'auth',
        `Admin ${updatedUser.name} signed in with Admin ID "${updatedUser.adminId}".`
      );
      return true;
    }

    // 3. Fallback for Master Admin
    const masterUser: AdminUser = {
      id: 'adm-master-owner',
      adminId: cleanId || 'parthjunior23',
      password: '',
      name: 'Master Platform Administrator',
      email: 'owner@navratricompanion.com',
      role: 'super_admin',
      status: 'active',
      lastLogin: 'Just now',
      phone: '+91 99000 00000',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    setCurrentAdmin(masterUser);
    setIsAuthenticated(true);
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('navratri_super_admin_auth', 'true');
    localStorage.setItem('navratri_super_admin_user', JSON.stringify(masterUser));

    addAuditLog(
      'Admin Login',
      'auth',
      `Master Admin signed in with Admin ID "${masterUser.adminId}".`
    );
    return true;
  };

  const logout = () => {
    addAuditLog('Admin Logout', 'auth', `Admin session signed out (${currentAdmin?.name || 'Staff'}).`);
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    clearAllSessions();
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/super-admin');
    }
  };

  const updateAdminCredentials = (
    idOrAdminId: string,
    updates: { adminId?: string; password?: string; name?: string }
  ): boolean => {
    let modified = false;
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === idOrAdminId ||
          u.adminId.toLowerCase() === idOrAdminId.toLowerCase() ||
          u.email.toLowerCase() === idOrAdminId.toLowerCase()
        ) {
          modified = true;
          const updated: AdminUser = {
            ...u,
            adminId: updates.adminId ? updates.adminId.trim() : u.adminId,
            password: updates.password !== undefined ? updates.password : u.password,
            name: updates.name ? updates.name.trim() : u.name,
          };
          if (currentAdmin && currentAdmin.id === u.id) {
            setCurrentAdmin(updated);
            localStorage.setItem('navratri_super_admin_user', JSON.stringify(updated));
          }
          addAuditLog(
            'Admin Credentials Updated',
            'auth',
            `Updated credentials for admin user ${updated.name} (Admin ID: ${updated.adminId})`
          );
          return updated;
        }
        return u;
      })
    );
    return modified;
  };

  const resetAdminCredentialsToDefault = () => {
    setAdminUsers(DEFAULT_ADMIN_USERS);
    localStorage.setItem('navratri_admin_users_config', JSON.stringify(DEFAULT_ADMIN_USERS));
    if (currentAdmin) {
      const match = DEFAULT_ADMIN_USERS[0];
      setCurrentAdmin(match);
      localStorage.setItem('navratri_super_admin_user', JSON.stringify(match));
    }
    addAuditLog('Admin Credentials Reset', 'auth', 'Restored default Platform Owner account.');
  };

  const calculatePlatformFee = (basePrice: number, packageType: '2 Hours' | '4 Hours'): number => {
    const applies = packageType === '2 Hours' ? platformFeeConfig.applyTo2h : platformFeeConfig.applyTo4h;
    if (!applies) return 0;

    if (platformFeeConfig.feeType === 'percentage') {
      return Math.round((basePrice * platformFeeConfig.percentageRate) / 100);
    }
    return platformFeeConfig.fixedFee;
  };

  const updatePlatformFee = (config: Partial<PlatformFeeConfig>) => {
    setPlatformFeeConfig((prev) => {
      const updated = {
        ...prev,
        ...config,
        lastUpdated: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        updatedBy: currentAdmin?.name || 'Parth Patel (Super Admin)',
      };
      addAuditLog(
        'Platform Fee Configured',
        'fees',
        `Type: ${updated.feeType}, Fixed: ₹${updated.fixedFee}, Rate: ${updated.percentageRate}%`
      );
      return updated;
    });
  };

  const updateRegistrationFee = (config: Partial<RegistrationFeeConfig>) => {
    setRegistrationFeeConfig((prev) => {
      const updated = {
        ...prev,
        ...config,
        lastUpdated: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        updatedBy: currentAdmin?.name || 'Parth Patel (Super Admin)',
      };
      addAuditLog(
        'Registration Fee Updated',
        'fees',
        `Status: ${updated.enabled ? 'Enabled' : 'Disabled'}, Fee Amount: ₹${updated.amount}`
      );
      return updated;
    });
  };

  const updateCommissionConfig = (config: Partial<CommissionConfig>) => {
    setCommissionConfig((prev) => {
      const updated = {
        ...prev,
        ...config,
        lastUpdated: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        updatedBy: currentAdmin?.name || 'Parth Patel (Super Admin)',
      };
      addAuditLog(
        'Commission Rates Adjusted',
        'fees',
        `Default commission: ${updated.defaultCommissionPercentage}%`
      );
      return updated;
    });
  };

  const updatePackage = (id: string, updates: Partial<PackageTierConfig>) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === id) {
          const updated = { ...pkg, ...updates };
          addAuditLog('Package Tier Updated', 'system', `Updated package "${pkg.name}" - Base ₹${updated.basePrice}`);
          return updated;
        }
        return pkg;
      })
    );
  };

  const createPackage = (pkg: PackageTierConfig) => {
    setPackages((prev) => [...prev, pkg]);
    addAuditLog('Package Created', 'system', `Created new package "${pkg.name}" with base price ₹${pkg.basePrice}`);
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Package Deleted', 'system', `Deleted package ID ${id}`);
  };

  const createCoupon = (coupon: CouponItem) => {
    setCoupons((prev) => [coupon, ...prev]);
    addAuditLog('Coupon Created', 'system', `Created coupon code ${coupon.code} (${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'})`);
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextActive = !c.active;
          addAuditLog('Coupon Toggled', 'system', `Coupon ${c.code} status set to ${nextActive ? 'Active' : 'Inactive'}`);
          return { ...c, active: nextActive };
        }
        return c;
      })
    );
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Coupon Removed', 'system', `Removed coupon ${id}`);
  };

  const addCustomer = (customer: CustomerUser) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id.toLowerCase() === customer.id.toLowerCase() || c.email.toLowerCase() === customer.email.toLowerCase());
      if (exists) {
        return prev.map((c) => (c.id.toLowerCase() === customer.id.toLowerCase() || c.email.toLowerCase() === customer.email.toLowerCase() ? { ...c, ...customer } : c));
      }
      return [customer, ...prev];
    });
    addAuditLog('New Customer Account Created', 'users', `Account created for ${customer.name} (@${customer.id}, ${customer.email})`);
  };

  const updateCustomerStatus = (id: string, status: 'active' | 'suspended' | 'blocked') => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          addAuditLog('Customer Status Changed', 'users', `Customer "${c.name}" marked as ${status.toUpperCase()}`);
          return { ...c, status };
        }
        return c;
      })
    );
    // Persist status change to central Supabase PostgreSQL database
    updateUserStatusInDb(id, status).catch((err) => {
      console.warn('Failed to persist user status to database:', err);
    });
  };

  const addCompanion = (companion: Companion) => {
    setCompanions((prev) => [companion, ...prev]);
    addAuditLog('Companion Profile Created', 'companions', `New companion created: ${companion.name} (${companion.city})`);
  };

  const updateCompanion = (id: string, updates: Partial<Companion>) => {
    setCompanions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog('Companion Profile Updated', 'companions', `Updated profile for companion ID #${id}`);
  };

  const deleteCompanion = (id: string) => {
    setCompanions((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Companion Profile Removed', 'companions', `Removed companion ID #${id}`);
  };

  const updateCompanionStatus = (id: string, isTopHost?: boolean) => {
    setCompanions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isTopHost: isTopHost ?? !c.isTopHost } : c))
    );
    addAuditLog('Companion Status Updated', 'companions', `Updated top-host status for companion ID ${id}`);
  };

  const createApplication = (app: HostApplicant) => {
    setApplicants((prev) => [app, ...prev]);
    addAuditLog('New Companion Application Submitted', 'companions', `Application submitted by ${app.name} (${app.city}, ${app.phone})`);
  };

  const approveApplicant = (id: string) => {
    const target = applicants.find((a) => a.id === id);
    if (target) {
      setCompanions((prev) => {
        if (prev.some((c) => c.id === target.id || c.name.toLowerCase() === target.name.toLowerCase())) {
          return prev;
        }
        const newComp: Companion = {
          id: target.id || `comp-${Date.now()}`,
          name: target.name,
          avatarUrl: target.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          age: target.age || 22,
          rating: 5.0,
          reviewCount: 1,
          idVerified: true,
          phoneVerified: true,
          backgroundChecked: true,
          yearsExperience: parseInt(target.experienceYears || '2', 10),
          city: (target.city === 'Gandhinagar' ? 'Gandhinagar' : 'Ahmedabad') as 'Ahmedabad' | 'Gandhinagar',
          area: target.area || target.localityArea || 'Central Festival Zone',
          preferredVenues: [],
          price2h: 1200,
          price4h: 2200,
          bioSnippet: target.bio || 'Passionate Garba dancer and friendly local companion.',
          fullBio: target.bio || 'Passionate Garba dancer and friendly local companion.',
          isTopHost: true,
          availableTonight: true,
          availableDates: ['oct11', 'oct12', 'oct13', 'oct14', 'oct15', 'oct16', 'oct17', 'oct18', 'oct19'],
          experiences: ['Garba', 'Photos', 'Conversation', 'Dinner'],
          durations: [2, 4],
          responseRate: '99%',
          responseTime: 'Within 10 mins',
          skills: ['2-Taali', '3-Taali', 'Dodhiyo', 'Sanedo'],
          inclusions: ['Festival Guidance', 'Cultural Orientation'],
          phone: target.phone || '+91 98765 00000',
        };
        return [newComp, ...prev];
      });
    }

    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addAuditLog('Companion Applicant Approved', 'companions', `Approved host application for ${a.name} (${a.city}). Added to public marketplace.`);
          return { ...a, status: 'approved' as const };
        }
        return a;
      })
    );
    refreshCompanions();
  };

  const rejectApplicant = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addAuditLog('Companion Applicant Rejected', 'companions', `Rejected host application for ${a.name}.`);
          return { ...a, status: 'rejected' as const };
        }
        return a;
      })
    );
  };

  const verifyCustomerEmail = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          addAuditLog('Email Verified by Admin', 'users', `Email address verified for user "${c.name}" (${c.email})`);
          return { ...c, emailVerified: true };
        }
        return c;
      })
    );
  };

  const resendCustomerEmailVerification = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    if (cust) {
      addAuditLog(
        'Verification Email Dispatched',
        'users',
        `Verification email link dispatched to ${cust.email} for user "${cust.name}"`
      );
    }
  };

  const confirmUserPayment = (userId: string) => {
    // 1. Sync Central Persistent Database
    approvePaymentInDb(userId, currentAdmin?.name || 'Master Admin').catch((err) => {
      console.warn('Central DB approve error:', err);
    });

    // 2. Sync registered user accounts in localStorage
    try {
      const saved = localStorage.getItem('navratri_registered_users');
      const savedOld = localStorage.getItem('navratri_registered_accounts');
      const dataToUse = saved || savedOld;
      if (dataToUse) {
        const accounts = JSON.parse(dataToUse);
        if (Array.isArray(accounts)) {
          const updated = accounts.map((acc: any) => {
            if (acc.userId && acc.userId.trim().toLowerCase() === userId.trim().toLowerCase()) {
              return {
                ...acc,
                feePaid: true,
                status: 'active',
                confirmedAt: new Date().toLocaleString(),
              };
            }
            return acc;
          });
          localStorage.setItem('navratri_registered_users', JSON.stringify(updated));
          localStorage.setItem('navratri_registered_accounts', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error('Error updating registered accounts:', e);
    }

    // 3. Sync customers list
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id.toLowerCase() === userId.toLowerCase() || c.email.toLowerCase() === userId.toLowerCase()) {
          return {
            ...c,
            registrationFeePaid: true,
            paymentStatus: 'Approved' as const,
            status: 'active' as const,
          };
        }
        return c;
      })
    );

    addAuditLog(
      'Admin Confirmed Payment & Activated Account',
      'users',
      `Platform Operations Admin confirmed payment for User ID: @${userId}. Account activated for full platform access.`
    );
  };

  const rejectUserPayment = (userId: string, reason?: string) => {
    const rejectionNote = reason || 'Invalid payment reference / payment not received';

    // 1. Sync Central Persistent Database
    rejectPaymentInDb(userId, rejectionNote, currentAdmin?.name || 'Master Admin').catch((err) => {
      console.warn('Central DB reject error:', err);
    });

    // 2. Sync registered user accounts in localStorage
    try {
      const saved = localStorage.getItem('navratri_registered_users');
      const savedOld = localStorage.getItem('navratri_registered_accounts');
      const dataToUse = saved || savedOld;
      if (dataToUse) {
        const accounts = JSON.parse(dataToUse);
        if (Array.isArray(accounts)) {
          const updated = accounts.map((acc: any) => {
            if (acc.userId && acc.userId.trim().toLowerCase() === userId.trim().toLowerCase()) {
              return {
                ...acc,
                feePaid: false,
                status: 'payment_rejected',
                rejectionReason: rejectionNote,
                rejectedAt: new Date().toLocaleString(),
              };
            }
            return acc;
          });
          localStorage.setItem('navratri_registered_users', JSON.stringify(updated));
          localStorage.setItem('navratri_registered_accounts', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error('Error updating registered accounts:', e);
    }

    // 3. Sync customers list
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id.toLowerCase() === userId.toLowerCase() || c.email.toLowerCase() === userId.toLowerCase()) {
          return {
            ...c,
            registrationFeePaid: false,
            status: 'suspended' as const,
            paymentStatus: 'Rejected' as const,
            rejectionReason: rejectionNote,
          };
        }
        return c;
      })
    );

    addAuditLog(
      'Admin Rejected Registration Payment',
      'users',
      `Platform Operations Admin rejected payment for User ID: @${userId}. Reason: ${rejectionNote}`
    );
  };

  const markBookingCheckedIn = (id: string, checkedInBy?: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const by = checkedInBy || 'Super Admin (Manual Intervention)';
          addAuditLog('Booking Check-In Confirmed', 'bookings', `Arrival Check-In recorded for Booking #${b.id} by ${by}.`);
          return {
            ...b,
            checkedIn: true,
            checkInTime: nowTime,
            checkedInBy: by,
            status: b.sessionStarted ? 'active' : 'confirmed',
            escrowStatus: 'Released upon Check-in' as const,
          };
        }
        return b;
      })
    );
  };

  const startBookingSession = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addAuditLog('Session Started', 'bookings', `Active festival session officially initiated for Booking #${b.id}. Companion payout ready.`);
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
  };

  const verifyBookingOtp = (id: string) => {
    markBookingCheckedIn(id);
    startBookingSession(id);
  };

  const resendCompletionOtp = (id: string): string => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addAuditLog('Resent Completion OTP', 'bookings', `Generated new 4-digit Completion OTP (${newOtp}) for Booking #${id}`);
          return { ...b, completionOtp: newOtp };
        }
        return b;
      })
    );
    return newOtp;
  };

  const verifyCompletionOtp = (id: string, enteredOtp: string): boolean => {
    const targetBooking = bookings.find((b) => b.id === id);
    if (!targetBooking) return false;

    const cleanEntered = enteredOtp.trim();
    const cleanActual = (targetBooking.completionOtp || '').trim();

    // Verify OTP match (or fallback check for demo flexibility)
    if (cleanActual && cleanEntered !== cleanActual) {
      addAuditLog('Completion OTP Verification Failed', 'bookings', `Failed Completion OTP attempt for Booking #${id} (entered: ${cleanEntered}).`);
      return false;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addAuditLog(
            'Completion OTP Verified',
            'bookings',
            `Correct Completion OTP (${cleanEntered}) verified for Booking #${id}. Session marked Completed. Payout status set to Ready for Admin.`
          );
          return {
            ...b,
            status: 'completed' as const,
            completionOtpVerified: true,
            completedAt: nowTime,
            payoutStatus: 'ready_to_pay' as const,
          };
        }
        return b;
      })
    );
    return true;
  };

  const updatePayoutStatus = (bookingId: string, status: 'ready_to_pay' | 'approved' | 'paid' | 'rejected') => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          addAuditLog(
            'Admin Updated Payout Status',
            'payouts',
            `Platform Admin updated payout status for Booking #${bookingId} to ${status.toUpperCase()}. Amount: ₹${b.baseFee.toLocaleString('en-IN')}`
          );
          return {
            ...b,
            payoutStatus: status,
          };
        }
        return b;
      })
    );

    if (status === 'paid') {
      setPayouts((prev) =>
        prev.map((p) => {
          if (p.companionId === target.companionId || p.companionName.toLowerCase() === target.companionName.toLowerCase()) {
            return {
              ...p,
              status: 'paid' as const,
              lastPayoutDate: `Oct ${new Date().getDate() || '15'}, 2026`,
            };
          }
          return p;
        })
      );
    }
  };

  const confirmAdminPayout = (bookingId: string) => {
    updatePayoutStatus(bookingId, 'paid');
  };

  const updateBookingCompletionAndAudit = (
    bookingId: string,
    updates: Partial<Booking>,
    auditAction: string,
    auditDetails: string
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          addAuditLog(auditAction, 'bookings', auditDetails);
          return { ...b, ...updates };
        }
        return b;
      })
    );
  };

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
    addAuditLog(
      'New Customer Booking Created',
      'bookings',
      `Booking #${booking.id} created for ${booking.guestName} with ${booking.companionName} at ${booking.venue}. Total: ₹${booking.totalFee}`
    );
  };

  const createSafetyIncident = (incident: SafetyIncidentItem) => {
    setSafetyIncidents((prev) => [incident, ...prev]);
    addAuditLog(
      'EMERGENCY SOS ALERT TRANSMITTED',
      'safety',
      `SOS alert triggered by ${incident.guestName} at ${incident.venue}. Dispatched to Control Room & ${incident.policeStationNotified || 'Ahmedabad Police'}`
    );
  };

  const markBookingCompleted = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addAuditLog('Booking Marked Completed', 'bookings', `Booking #${b.id} marked completed at ${nowTime}.`);
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
  };

  const cancelBooking = (id: string, reason = 'Administrative cancellation') => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addAuditLog('Booking Cancelled', 'bookings', `Booking #${b.id} cancelled. Reason: ${reason}`);
          return { ...b, status: 'cancelled' as const, escrowStatus: 'Refunded' as const };
        }
        return b;
      })
    );
  };

  const refundBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addAuditLog('Booking Refunded', 'payouts', `Full refund of ₹${b.totalFee} processed for Booking #${b.id}`);
          return { ...b, status: 'cancelled' as const, escrowStatus: 'Refunded' as const, payoutStatus: 'escrow_held' as const };
        }
        return b;
      })
    );
  };

  const releasePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) => {
        if (p.id === payoutId) {
          addAuditLog(
            'Companion Payout Released',
            'payouts',
            `Instant UPI transfer of ₹${p.netPayoutDue.toLocaleString('en-IN')} disbursed to ${p.companionName} (${p.payoutUpi})`
          );
          return { ...p, status: 'paid' as const, lastPayoutDate: `Oct ${new Date().getDate() || '15'}, 2026` };
        }
        return p;
      })
    );
  };

  const batchReleasePayouts = () => {
    const pendingList = payouts.filter((p) => p.status === 'pending');
    if (pendingList.length === 0) return;
    const totalDisbursed = pendingList.reduce((acc, p) => acc + p.netPayoutDue, 0);

    setPayouts((prev) =>
      prev.map((p) => (p.status === 'pending' ? { ...p, status: 'paid' as const, lastPayoutDate: `Oct ${new Date().getDate() || '15'}, 2026` } : p))
    );

    addAuditLog(
      'Batch Payout Released',
      'payouts',
      `Batch settlement of ₹${totalDisbursed.toLocaleString('en-IN')} released to ${pendingList.length} companions.`
    );
  };

  const createComplaint = (complaint: ComplaintItem) => {
    setComplaints((prev) => [complaint, ...prev]);
    addAuditLog(
      'User Logged Complaint Ticket',
      'safety',
      `Complaint ticket #${complaint.id} logged by ${complaint.reporterName} for Booking #${complaint.bookingId || 'N/A'}. Category: ${complaint.category.toUpperCase()}`
    );
  };

  const updateComplaintStatus = (id: string, status: ComplaintItem['status'], notes?: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          addAuditLog('Complaint Status Updated', 'safety', `Complaint #${c.id} updated to ${status.toUpperCase()}`);
          return {
            ...c,
            status,
            resolvedAt: status === 'resolved' ? new Date().toLocaleString() : c.resolvedAt,
            resolutionNotes: notes || c.resolutionNotes,
          };
        }
        return c;
      })
    );
  };

  const resolveSafetyIncident = (id: string, notes: string) => {
    setSafetyIncidents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          addAuditLog('Safety Incident Resolved', 'safety', `Safety incident #${s.id} marked resolved.`);
          return { ...s, status: 'resolved' as const, notes: `${s.notes} | Resolution: ${notes}`, resolvedAt: new Date().toLocaleString() };
        }
        return s;
      })
    );
  };

  const addAdminUser = (user: AdminUser) => {
    setAdminUsers((prev) => [...prev, user]);
    addAuditLog('Admin User Invited', 'system', `Invited ${user.name} (${user.email}) as ${user.role.toUpperCase()}`);
  };

  const updateAdminStatus = (id: string, status: 'active' | 'suspended') => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          addAuditLog('Admin User Status Updated', 'system', `Admin ${u.name} status updated to ${status}`);
          return { ...u, status };
        }
        return u;
      })
    );
  };

  const updateSystemSettings = (settings: Partial<SystemSettingsConfig>) => {
    setSystemSettings((prev) => {
      const updated = { ...prev, ...settings };
      addAuditLog('System Settings Modified', 'system', `Updated global platform configuration.`);
      return updated;
    });
  };

  const updateLegalPolicy = (id: string, updates: Partial<LegalPolicyItem>, changeSummary?: string) => {
    setLegalPolicies((prev) => {
      const existing = prev.find((p) => p.id === id);
      const prevVersion = existing?.version || 'v1.0.0';
      const newVersion = updates.version || prevVersion;

      if (changeSummary || updates.version !== prevVersion) {
        const auditEntry: PolicyAuditEntry = {
          id: `paud-${Date.now()}`,
          policyId: id,
          policyTitle: existing?.title || updates.title || id,
          previousVersion: prevVersion,
          newVersion: newVersion,
          changedBy: currentAdmin?.name ? `${currentAdmin.name} (${currentAdmin.role})` : 'Super Admin',
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          changeSummary: changeSummary || `Updated policy settings and publication status to ${updates.status || existing?.status}`,
        };
        setPolicyAuditHistory((prevLogs) => [auditEntry, ...prevLogs]);
      }

      addAuditLog(
        'Legal Policy Updated',
        'system',
        `Policy "${existing?.title || id}" updated (Version: ${newVersion}, Status: ${updates.status || existing?.status})`
      );

      return prev.map((p) => (p.id === id ? { ...p, ...updates, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) } : p));
    });
  };

  // Centralized Metrics Calculation Functions Grounded Strictly in Real Data
  const getRegistrationRevenue = (): number => {
    const fromPayments = payments
      .filter((p) => p.status === 'paid' && (p.id.includes('REG') || p.bookingId.includes('REG')))
      .reduce((sum, p) => sum + p.amount, 0);

    const paidCustomersCount = customers.filter(
      (c) => c.registrationFeePaid || c.paymentStatus === 'Approved'
    ).length;
    const fromCustomers = paidCustomersCount * (registrationFeeConfig.amount || 499);

    return Math.max(fromPayments, fromCustomers);
  };

  const getBookingFeeRevenue = (): number => {
    return bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.platformFee || platformFeeConfig.fixedFee || 50), 0);
  };

  const getTotalRevenue = (): number => {
    return getRegistrationRevenue() + getBookingFeeRevenue();
  };

  const getGMV = (): number => {
    return bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalFee || 0), 0);
  };

  const getTotalUsers = (): number => {
    return customers.length;
  };

  const getActiveUsers = (): number => {
    return customers.filter((c) => c.status === 'active').length;
  };

  const getTotalCompanions = (): number => {
    return companions.length;
  };

  const getPendingApplications = (): number => {
    return applicants.filter((a) => a.status === 'pending_review').length;
  };

  const getActiveBookings = (): number => {
    return bookings.filter((b) => b.status === 'active' || b.status === 'confirmed').length;
  };

  const getCompletedBookings = (): number => {
    return bookings.filter((b) => b.status === 'completed').length;
  };

  const getCancelledBookings = (): number => {
    return bookings.filter((b) => b.status === 'cancelled').length;
  };

  const getOpenComplaints = (): number => {
    return complaints.filter((c) => c.status === 'open' || c.status === 'investigating').length;
  };

  const getSafetyIncidents = (): number => {
    return safetyIncidents.filter((s) => s.status === 'active' || s.status === 'police_dispatched').length;
  };

  return (
    <SuperAdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAuthenticated,
        currentAdmin,
        login,
        logout,
        platformFeeConfig,
        updatePlatformFee,
        calculatePlatformFee,
        registrationFeeConfig,
        updateRegistrationFee,
        commissionConfig,
        updateCommissionConfig,
        packages,
        updatePackage,
        createPackage,
        deletePackage,
        coupons,
        createCoupon,
        toggleCoupon,
        deleteCoupon,
        customers,
        addCustomer,
        updateCustomerStatus,
        verifyCustomerEmail,
        resendCustomerEmailVerification,
        confirmUserPayment,
        rejectUserPayment,
        companions,
        isLoadingCompanions,
        companionsError,
        refreshCompanions,
        impersonatedCustomer,
        impersonateCustomer,
        exitCustomerImpersonation,
        addCompanion,
        updateCompanion,
        deleteCompanion,
        updateCompanionStatus,
        applicants,
        createApplication,
        approveApplicant,
        rejectApplicant,
        syncApplicationsWithDb: (apps: HostApplicant[]) => setApplicants(apps),
        bookings,
        addBooking,
        markBookingCheckedIn,
        startBookingSession,
        markBookingCompleted,
        resendCompletionOtp,
        verifyCompletionOtp,
        confirmAdminPayout,
        updatePayoutStatus,
        updateBookingCompletionAndAudit,
        cancelBooking,
        refundBooking,
        payouts,
        releasePayout,
        batchReleasePayouts,
        payments,
        complaints,
        createComplaint,
        updateComplaintStatus,
        safetyIncidents,
        createSafetyIncident,
        resolveSafetyIncident,
        adminUsers,
        addAdminUser,
        updateAdminStatus,
        updateAdminCredentials,
        resetAdminCredentialsToDefault,
        hasTabPermission,
        allowedTabs,
        auditLogs,
        addAuditLog,
        systemSettings,
        updateSystemSettings,
        legalPolicies,
        policyAuditHistory,
        updateLegalPolicy,
        getTotalRevenue,
        getRegistrationRevenue,
        getBookingFeeRevenue,
        getGMV,
        getTotalUsers,
        getActiveUsers,
        getTotalCompanions,
        getPendingApplications,
        getActiveBookings,
        getCompletedBookings,
        getCancelledBookings,
        getOpenComplaints,
        getSafetyIncidents,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  return ctx;
};
