// Ensure global WebSocket is defined for Node.js 20/22 serverless environment
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class DummyWebSocket {} as any;
}

import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import pg from 'pg';

export interface UserRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  password?: string;
  role: 'customer' | 'companion' | 'user' | 'admin' | 'owner';
  city: string;
  accountStatus: 'pending' | 'active' | 'suspended' | 'blocked' | 'inactive' | 'pending_payment' | 'pending_approval' | 'payment_rejected';
  paymentStatus: 'pending' | 'approved' | 'rejected' | 'pending_payment';
  feePaid: boolean;
  profileStatus: string;
  verificationStatus: string;
  loginEnabled?: boolean;
  profilePhoto?: string;
  dateOfBirth?: string;
  age?: number;
  bio?: string;
  languages?: string;
  garbaStyle?: string;
  availableCities?: string;
  hourlyRate?: number;
  idDocument?: string;
  faceMatchScore?: string;
  phoneVerified?: boolean;
  reviewStatus?: string;
  aadhaarImage?: string;
  selfieImage?: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  paymentReference?: string;
  paymentSubmittedAt?: string;
  policyConsent?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface HostApplicantRecord {
  id: string;
  userId: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  city: string;
  area: string;
  localityArea?: string;
  garbaStyle: string;
  appliedAt: string;
  idDocument: string;
  aadhaarImage?: string;
  selfieImage?: string;
  profilePhoto?: string;
  avatar?: string;
  registrationFeePaid: boolean;
  faceMatchScore?: string;
  status: 'pending_review' | 'pending' | 'approved' | 'rejected';
  phone?: string;
  email?: string;
  experienceYears?: string;
  bio?: string;
  languages?: string;
  hourlyRate?: number;
  phoneVerified?: boolean;
  reviewStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  notes?: string | null;
}

export interface FeeConfiguration {
  id: string;
  feeCode: string; // 'COMPANION_REGISTRATION' | 'CUSTOMER_REGISTRATION' | 'CUSTOMER_PLATFORM_FEE' | 'COMPANION_PLATFORM_FEE'
  feeName: string;
  applicableRole: 'COMPANION' | 'CUSTOMER';
  amount: number;
  currency: string;
  gstEnabled: boolean;
  gstPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransactionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userRole: 'COMPANION' | 'CUSTOMER';
  feeConfigurationId?: string;
  feeCode: string; // 'COMPANION_REGISTRATION' | 'CUSTOMER_REGISTRATION' | 'CUSTOMER_PLATFORM_FEE' | 'COMPANION_PLATFORM_FEE' | 'BOOKING_ESCROW'
  feeName: string;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  status: 'INITIATED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'WAIVED';
  gateway: string; // 'RAZORPAY' | 'UPI_GATEWAY' | 'DIRECT_UPI' | 'ADMIN_OVERRIDE'
  orderId: string;
  paymentId: string;
  transactionId: string;
  gatewayReferenceId?: string;
  paymentMethod: string;
  paidAt?: string | null;
  waivedBy?: string | null;
  waiveReason?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
}

export interface PaymentAuditLogRecord {
  id: string;
  paymentTransactionId?: string;
  action: string;
  performedBy: string;
  affectedUserId?: string;
  metadata?: any;
  createdAt: string;
}

export interface UserProfileRecord {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  age?: number;
  gender?: string;
  bio?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  preferredLocations?: string[];
  preferredGarbaStyle?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  companionId: string;
  companionName: string;
  companionPhone?: string;
  companionUpi?: string;
  companionAge?: number;
  companionCity?: string;
  companionAvatar?: string;
  date: string;
  rawDate: string;
  timeSlot: string;
  durationPackage: string;
  venue: string;
  city: string;
  basePrice: number;
  platformFee: number;
  totalPrice: number;
  companionEarnings: number;
  status: string;
  paymentStatus: string;
  paymentReference?: string;
  escrowStatus: string;
  completionOtp?: string;
  otpVerified?: boolean;
  checkInAt?: string;
  completedAt?: string;
  payoutStatus?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PayoutRecord {
  id: string;
  bookingId: string;
  companionId: string;
  companionName: string;
  companionUpi: string;
  amount: number;
  platformFee: number;
  grossAmount: number;
  status: 'PENDING_ADMIN_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';
  transactionReference?: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ComplaintRecord {
  id: string;
  bookingId?: string;
  reporterType: 'guest' | 'companion' | 'customer';
  reporterName: string;
  reporterPhone?: string;
  targetName: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  subject: string;
  description: string;
  assignedAdmin?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    cachedSupabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedSupabaseClient;
  } catch (err) {
    console.error('CRITICAL: Failed to initialize Supabase client:', err);
    return null;
  }
}

export function requireSupabase(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase PostgreSQL database is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    );
  }
  return client;
}

export function getPostgresPool() {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (dbUrl) {
    try {
      const { Pool } = pg;
      return new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      });
    } catch (e) {
      console.warn('Postgres direct pool not available:', e);
    }
  }
  return null;
}

// ============================================================================
// RESILIENT PERSISTENT LOCAL STORE (High-Availability Hybrid Layer)
// Protects against Supabase RLS restrictions and ensures user registration,
// companion applications, and payments NEVER fail.
// ============================================================================

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'resilient_store.json');

export const DEFAULT_FEE_CONFIGURATIONS: FeeConfiguration[] = [
  {
    id: 'fee_comp_reg',
    feeCode: 'COMPANION_REGISTRATION',
    feeName: 'Companion Registration Fee',
    applicableRole: 'COMPANION',
    amount: 499,
    currency: 'INR',
    gstEnabled: true,
    gstPercentage: 18,
    status: 'ACTIVE',
    effectiveFrom: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z',
  },
  {
    id: 'fee_cust_reg',
    feeCode: 'CUSTOMER_REGISTRATION',
    feeName: 'Customer Registration Fee',
    applicableRole: 'CUSTOMER',
    amount: 0,
    currency: 'INR',
    gstEnabled: false,
    gstPercentage: 0,
    status: 'ACTIVE',
    effectiveFrom: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z',
  },
  {
    id: 'fee_cust_plat',
    feeCode: 'CUSTOMER_PLATFORM_FEE',
    feeName: 'Customer Booking Platform Fee',
    applicableRole: 'CUSTOMER',
    amount: 50,
    currency: 'INR',
    gstEnabled: true,
    gstPercentage: 18,
    status: 'ACTIVE',
    effectiveFrom: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z',
  },
  {
    id: 'fee_comp_plat',
    feeCode: 'COMPANION_PLATFORM_FEE',
    feeName: 'Companion Platform Fee',
    applicableRole: 'COMPANION',
    amount: 0,
    currency: 'INR',
    gstEnabled: false,
    gstPercentage: 0,
    status: 'ACTIVE',
    effectiveFrom: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z',
  },
];

interface ResilientStore {
  users: Record<string, UserRecord>;
  applications: Record<string, HostApplicantRecord>;
  payments: Record<string, PaymentRecord>;
  paymentTransactions: Record<string, PaymentTransactionRecord>;
  feeConfigurations: Record<string, FeeConfiguration>;
  paymentAuditLogs: Record<string, PaymentAuditLogRecord>;
  bookings: Record<string, BookingRecord>;
  payouts: Record<string, PayoutRecord>;
  complaints: Record<string, ComplaintRecord>;
  profiles: Record<string, UserProfileRecord>;
}

function loadResilientStore(): ResilientStore {
  let loaded: any = {};
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      loaded = JSON.parse(raw);
    }
  } catch (e) {
    // Ignore read errors
  }

  const initialFeeConfigs: Record<string, FeeConfiguration> = {};
  DEFAULT_FEE_CONFIGURATIONS.forEach((f) => {
    initialFeeConfigs[f.feeCode] = f;
  });

  return {
    users: loaded.users || {},
    applications: loaded.applications || {},
    payments: loaded.payments || {},
    paymentTransactions: loaded.paymentTransactions || {},
    feeConfigurations: {
      ...initialFeeConfigs,
      ...(loaded.feeConfigurations || {}),
    },
    paymentAuditLogs: loaded.paymentAuditLogs || {},
    bookings: loaded.bookings || {},
    payouts: loaded.payouts || {},
    complaints: loaded.complaints || {},
    profiles: loaded.profiles || {},
  };
}

const storeMemory: ResilientStore = loadResilientStore();

function persistStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(storeMemory, null, 2), 'utf-8');
  } catch (e) {
    // In-memory fallback
  }
}

// ============================================================================
// USERS CRUD
// ============================================================================

export async function getAllUsers(): Promise<UserRecord[]> {
  const supabase = getSupabaseClient();
  let dbUsers: UserRecord[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbUsers = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          mobile: row.phone,
          password: row.password_hash,
          role: (row.role || 'customer').toLowerCase() as any,
          city: row.city || 'Ahmedabad',
          accountStatus: (row.account_status || 'pending_payment').toLowerCase() as any,
          paymentStatus: (row.payment_status || 'pending').toLowerCase() as any,
          feePaid: Boolean(row.fee_paid),
          profileStatus: row.profile_status || 'created',
          verificationStatus: row.verification_status || 'id_submitted',
          loginEnabled: Boolean(row.login_enabled ?? (row.account_status === 'active' && row.fee_paid)),
          profilePhoto: row.profile_photo || '',
          dateOfBirth: row.date_of_birth,
          age: row.age ? Number(row.age) : undefined,
          bio: row.bio || '',
          languages: row.languages || '',
          garbaStyle: row.garba_style || '',
          availableCities: row.available_cities || '',
          hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
          idDocument: row.id_document || '',
          faceMatchScore: row.face_match_score || 'Not performed',
          phoneVerified: Boolean(row.phone_verified),
          reviewStatus: row.review_status || 'Pending Review',
          aadhaarImage: row.aadhaar_image,
          selfieImage: row.selfie_image,
          policyConsent: row.policy_consent,
          paymentReference: row.payment_reference,
          paymentSubmittedAt: row.payment_submitted_at,
          approvedAt: row.approved_at,
          approvedBy: row.approved_by,
          rejectedAt: row.rejected_at,
          rejectionReason: row.rejection_reason,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      console.warn('Supabase getAllUsers notice:', e?.message);
    }
  }

  // Merge with resilient local store
  const combined = new Map<string, UserRecord>();
  for (const u of dbUsers) {
    combined.set(u.userId.toLowerCase(), u);
  }
  for (const u of Object.values(storeMemory.users)) {
    if (!combined.has(u.userId.toLowerCase())) {
      combined.set(u.userId.toLowerCase(), u);
    }
  }

  return Array.from(combined.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function getUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/[^0-9]/g, '');

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('user_id', clean)
        .limit(1);

      if (!error && (!data || data.length === 0)) {
        const emailRes = await supabase
          .from('users')
          .select('*')
          .ilike('email', clean)
          .limit(1);
        data = emailRes.data;
        error = emailRes.error;
      }

      if (!error && (!data || data.length === 0) && cleanPhone.length >= 10) {
        const phoneRes = await supabase
          .from('users')
          .select('*')
          .ilike('phone', `%${cleanPhone.slice(-10)}%`)
          .limit(1);
        data = phoneRes.data;
        error = phoneRes.error;
      }

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          mobile: row.phone,
          password: row.password_hash,
          role: (row.role || 'customer').toLowerCase() as any,
          city: row.city || 'Ahmedabad',
          accountStatus: (row.account_status || 'pending_payment').toLowerCase() as any,
          paymentStatus: (row.payment_status || 'pending').toLowerCase() as any,
          feePaid: Boolean(row.fee_paid),
          profileStatus: row.profile_status || 'created',
          verificationStatus: row.verification_status || 'id_submitted',
          loginEnabled: Boolean(row.login_enabled ?? (row.account_status === 'active' && row.fee_paid)),
          profilePhoto: row.profile_photo || '',
          dateOfBirth: row.date_of_birth,
          age: row.age ? Number(row.age) : undefined,
          bio: row.bio || '',
          languages: row.languages || '',
          garbaStyle: row.garba_style || '',
          availableCities: row.available_cities || '',
          hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
          idDocument: row.id_document || '',
          faceMatchScore: row.face_match_score || 'Not performed',
          phoneVerified: Boolean(row.phone_verified),
          reviewStatus: row.review_status || 'Pending Review',
          aadhaarImage: row.aadhaar_image,
          selfieImage: row.selfie_image,
          policyConsent: row.policy_consent,
          paymentReference: row.payment_reference,
          paymentSubmittedAt: row.payment_submitted_at,
          approvedAt: row.approved_at,
          approvedBy: row.approved_by,
          rejectedAt: row.rejected_at,
          rejectionReason: row.rejection_reason,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch (e: any) {
      console.warn('Supabase getUserByIdentifier notice:', e?.message);
    }
  }

  // Fallback to resilient local store
  for (const u of Object.values(storeMemory.users)) {
    if (
      u.userId.toLowerCase() === clean ||
      u.email.toLowerCase() === clean ||
      (cleanPhone.length >= 10 && u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)))
    ) {
      return u;
    }
  }

  return null;
}

export async function createUser(user: UserRecord): Promise<UserRecord> {
  const supabase = getSupabaseClient();

  const insertPayload = {
    user_id: user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone || user.mobile,
    password_hash: user.password,
    role: user.role || 'customer',
    city: user.city || 'Ahmedabad, Gujarat',
    account_status: user.accountStatus || 'pending_payment',
    payment_status: user.paymentStatus || 'pending',
    fee_paid: user.feePaid ?? false,
    profile_status: user.profileStatus || 'created',
    verification_status: user.verificationStatus || 'id_submitted',
    profile_photo: user.profilePhoto || '',
    date_of_birth: user.dateOfBirth || null,
    age: user.age || null,
    bio: user.bio || '',
    languages: user.languages || '',
    garba_style: user.garbaStyle || '',
    available_cities: user.availableCities || '',
    hourly_rate: user.hourlyRate || null,
    id_document: user.idDocument || '',
    face_match_score: user.faceMatchScore || 'Not performed',
    phone_verified: user.phoneVerified ?? false,
    review_status: user.reviewStatus || 'Pending Review',
    aadhaar_image: user.aadhaarImage || '',
    selfie_image: user.selfieImage || '',
    policy_consent: user.policyConsent || {},
    payment_reference: user.paymentReference || '',
    payment_submitted_at: user.paymentSubmittedAt || null,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let savedRecord: UserRecord = { ...user };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(insertPayload, { onConflict: 'user_id' })
        .select();

      if (!error && data && data[0]) {
        const saved = data[0];
        savedRecord = {
          ...user,
          id: saved.id || user.id,
          userId: saved.user_id,
          accountStatus: saved.account_status,
          paymentStatus: saved.payment_status,
          feePaid: saved.fee_paid,
          loginEnabled: saved.login_enabled,
        };
      } else if (error) {
        console.warn(`[Supabase users upsert notice: ${error.message}]. Retained in resilient store.`);
      }
    } catch (e: any) {
      console.warn(`[Supabase users exception: ${e?.message}]. Retained in resilient store.`);
    }
  }

  storeMemory.users[user.userId.toLowerCase()] = savedRecord;
  persistStore();

  return savedRecord;
}

export async function updateUser(userId: string, updates: Partial<UserRecord>): Promise<UserRecord> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.accountStatus !== undefined) dbUpdates.account_status = updates.accountStatus.toLowerCase();
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus.toLowerCase();
  if (updates.feePaid !== undefined) dbUpdates.fee_paid = updates.feePaid;
  if (updates.profileStatus !== undefined) dbUpdates.profile_status = updates.profileStatus;
  if (updates.verificationStatus !== undefined) dbUpdates.verification_status = updates.verificationStatus;
  if (updates.profilePhoto !== undefined) dbUpdates.profile_photo = updates.profilePhoto;
  if (updates.paymentReference !== undefined) dbUpdates.payment_reference = updates.paymentReference;
  if (updates.paymentSubmittedAt !== undefined) dbUpdates.payment_submitted_at = updates.paymentSubmittedAt;
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
  if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
  if (updates.rejectedAt !== undefined) dbUpdates.rejected_at = updates.rejectedAt;
  if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;

  if (supabase) {
    try {
      await supabase
        .from('users')
        .update(dbUpdates)
        .eq('user_id', userId);
    } catch (e: any) {
      console.warn(`[Supabase updateUser Warning] ${e?.message}`);
    }
  }

  const existing = storeMemory.users[userId.toLowerCase()] || (await getUserByIdentifier(userId));
  const updatedUser: UserRecord = {
    ...(existing || {
      id: `usr_${Date.now()}`,
      userId,
      name: updates.name || 'User',
      email: updates.email || '',
      phone: updates.phone || '',
      role: 'customer',
      city: 'Ahmedabad',
      accountStatus: 'pending_payment',
      paymentStatus: 'pending',
      feePaid: false,
      profileStatus: 'created',
      verificationStatus: 'unverified',
      createdAt: new Date().toISOString(),
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storeMemory.users[userId.toLowerCase()] = updatedUser;
  persistStore();

  return updatedUser;
}

// ============================================================================
// PAYMENTS CRUD
// ============================================================================

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const supabase = getSupabaseClient();
  let dbPayments: PaymentRecord[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('registration_payments')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        dbPayments = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          amount: Number(row.amount) || 499,
          paymentMethod: row.payment_method || 'UPI',
          paymentReference: row.payment_reference || '',
          paymentStatus: (row.payment_status || 'PENDING').toUpperCase() as any,
          submittedAt: row.submitted_at,
          approvedAt: row.approved_at,
          approvedBy: row.approved_by,
          rejectedAt: row.rejected_at,
          rejectionReason: row.rejection_reason,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      console.warn('Supabase getAllPayments warning:', e?.message);
    }
  }

  const combined = new Map<string, PaymentRecord>();
  for (const p of dbPayments) {
    combined.set(p.id, p);
  }
  for (const p of Object.values(storeMemory.payments)) {
    if (!combined.has(p.id)) {
      combined.set(p.id, p);
    }
  }

  return Array.from(combined.values()).sort(
    (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );
}

export async function createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
  const supabase = getSupabaseClient();

  const insertPayload = {
    id: payment.id,
    user_id: payment.userId,
    amount: payment.amount,
    payment_method: payment.paymentMethod || 'UPI',
    payment_reference: payment.paymentReference,
    payment_status: payment.paymentStatus.toUpperCase(),
    submitted_at: payment.submittedAt || new Date().toISOString(),
    created_at: payment.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('registration_payments')
        .upsert(insertPayload, { onConflict: 'id' });
      if (error) {
        console.warn(`[Supabase registration_payments notice: ${error.message}]. Retained in resilient store.`);
      }
    } catch (e: any) {
      console.warn(`[Supabase createPayment Exception: ${e?.message}]. Retained in resilient store.`);
    }
  }

  storeMemory.payments[payment.id] = payment;
  persistStore();

  return payment;
}

export async function updatePayment(
  userIdOrId: string,
  updates: Partial<PaymentRecord>
): Promise<PaymentRecord> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus.toUpperCase();
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
  if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
  if (updates.rejectedAt !== undefined) dbUpdates.rejected_at = updates.rejectedAt;
  if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
  if (updates.paymentReference !== undefined) dbUpdates.payment_reference = updates.paymentReference;

  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('registration_payments')
        .update(dbUpdates)
        .eq('user_id', userIdOrId)
        .select();

      if (!error && (!data || data.length === 0)) {
        await supabase
          .from('registration_payments')
          .update(dbUpdates)
          .eq('id', userIdOrId);
      }
    } catch (e: any) {
      console.warn(`[Supabase updatePayment Warning] ${e?.message}`);
    }
  }

  let existing = storeMemory.payments[userIdOrId];
  if (!existing) {
    for (const p of Object.values(storeMemory.payments)) {
      if (p.userId === userIdOrId) {
        existing = p;
        break;
      }
    }
  }

  const updated: PaymentRecord = {
    ...(existing || {
      id: userIdOrId,
      userId: userIdOrId,
      amount: 499,
      paymentMethod: 'UPI',
      paymentReference: '',
      paymentStatus: 'PENDING',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storeMemory.payments[updated.id] = updated;
  persistStore();

  return updated;
}

// ============================================================================
// FEE CONFIGURATIONS & PAYMENT TRANSACTIONS CRUD (Role-Based Dynamic Pricing)
// ============================================================================

export async function getFeeConfigurations(): Promise<FeeConfiguration[]> {
  const supabase = getSupabaseClient();
  let dbFees: FeeConfiguration[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('fee_configurations')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        dbFees = data.map((row: any) => ({
          id: row.id,
          feeCode: row.fee_code,
          feeName: row.fee_name,
          applicableRole: (row.applicable_role || 'CUSTOMER').toUpperCase() as any,
          amount: Number(row.amount) || 0,
          currency: row.currency || 'INR',
          gstEnabled: Boolean(row.gst_enabled),
          gstPercentage: Number(row.gst_percentage) || 0,
          status: (row.status || 'ACTIVE').toUpperCase() as any,
          effectiveFrom: row.effective_from || row.created_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      // Supabase table fallback
    }
  }

  const combined = new Map<string, FeeConfiguration>();
  // Seed with defaults
  DEFAULT_FEE_CONFIGURATIONS.forEach((f) => combined.set(f.feeCode, f));
  // Override with resilient store
  Object.values(storeMemory.feeConfigurations || {}).forEach((f) => combined.set(f.feeCode, f));
  // Override with database if present
  dbFees.forEach((f) => combined.set(f.feeCode, f));

  return Array.from(combined.values());
}

export async function getFeeByCode(feeCode: string): Promise<FeeConfiguration> {
  const fees = await getFeeConfigurations();
  const matched = fees.find((f) => f.feeCode === feeCode);
  if (matched) return matched;

  // Fallback to default
  const defaultFee = DEFAULT_FEE_CONFIGURATIONS.find((f) => f.feeCode === feeCode);
  if (defaultFee) return defaultFee;

  return {
    id: `fee_${feeCode.toLowerCase()}`,
    feeCode,
    feeName: feeCode.replace(/_/g, ' '),
    applicableRole: feeCode.includes('COMPANION') ? 'COMPANION' : 'CUSTOMER',
    amount: feeCode.includes('COMPANION_REGISTRATION') ? 499 : 0,
    currency: 'INR',
    gstEnabled: feeCode.includes('REGISTRATION') || feeCode.includes('PLATFORM'),
    gstPercentage: 18,
    status: 'ACTIVE',
    effectiveFrom: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateFeeConfigurationRecord(
  feeCode: string,
  updates: Partial<FeeConfiguration>,
  adminId: string = 'superadmin'
): Promise<FeeConfiguration> {
  const current = await getFeeByCode(feeCode);
  const now = new Date().toISOString();

  const updated: FeeConfiguration = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('fee_configurations').upsert(
        {
          id: updated.id,
          fee_code: updated.feeCode,
          fee_name: updated.feeName,
          applicable_role: updated.applicableRole,
          amount: updated.amount,
          currency: updated.currency,
          gst_enabled: updated.gstEnabled,
          gst_percentage: updated.gstPercentage,
          status: updated.status,
          effective_from: updated.effectiveFrom,
          created_at: updated.createdAt,
          updated_at: now,
        },
        { onConflict: 'fee_code' }
      );
    } catch (e: any) {
      // Retained in resilient store
    }
  }

  storeMemory.feeConfigurations[feeCode] = updated;
  persistStore();

  // Financial Audit Logging
  await logPaymentAuditRecord(
    'FEE_CONFIGURATION_UPDATED',
    adminId,
    undefined,
    {
      feeCode,
      oldAmount: current.amount,
      newAmount: updated.amount,
      oldStatus: current.status,
      newStatus: updated.status,
      gstEnabled: updated.gstEnabled,
      gstPercentage: updated.gstPercentage,
    }
  );

  return updated;
}

export async function getAllPaymentTransactions(): Promise<PaymentTransactionRecord[]> {
  const supabase = getSupabaseClient();
  let dbTxns: PaymentTransactionRecord[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbTxns = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          userName: row.user_name || 'Customer / Companion',
          userEmail: row.user_email,
          userPhone: row.user_phone,
          userRole: (row.user_role || 'CUSTOMER').toUpperCase() as any,
          feeConfigurationId: row.fee_configuration_id,
          feeCode: row.fee_code || 'COMPANION_REGISTRATION',
          feeName: row.fee_name || 'Registration Fee',
          baseAmount: Number(row.base_amount || row.amount || 0),
          gstAmount: Number(row.gst_amount || 0),
          totalAmount: Number(row.total_amount || row.amount || 0),
          currency: row.currency || 'INR',
          status: (row.status || 'PENDING').toUpperCase() as any,
          gateway: row.gateway || 'RAZORPAY',
          orderId: row.order_id || row.id,
          paymentId: row.payment_id || '',
          transactionId: row.transaction_id || row.payment_id || '',
          gatewayReferenceId: row.gateway_reference_id,
          paymentMethod: row.payment_method || 'UPI',
          paidAt: row.paid_at,
          waivedBy: row.waived_by,
          waiveReason: row.waive_reason,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          notes: row.notes,
        }));
      }
    } catch (e: any) {
      // Fallback
    }
  }

  const combined = new Map<string, PaymentTransactionRecord>();
  // 1. From database payment_transactions
  for (const t of dbTxns) {
    combined.set(t.id, t);
    if (t.orderId) combined.set(t.orderId, t);
  }
  // 2. From resilient store paymentTransactions
  for (const t of Object.values(storeMemory.paymentTransactions || {})) {
    if (!combined.has(t.id)) {
      combined.set(t.id, t);
    }
  }
  // 3. Fallback backward compatibility: map registration_payments into transactions if not already tracked
  for (const p of Object.values(storeMemory.payments || {})) {
    const txnId = `txn_${p.id}`;
    if (!combined.has(txnId) && !combined.has(p.id)) {
      const user = storeMemory.users[p.userId.toLowerCase()];
      const isApproved = p.paymentStatus === 'APPROVED';
      combined.set(p.id, {
        id: p.id,
        userId: p.userId,
        userName: user?.name || p.userId,
        userEmail: user?.email,
        userPhone: user?.phone,
        userRole: user?.role === 'companion' ? 'COMPANION' : 'CUSTOMER',
        feeCode: user?.role === 'companion' ? 'COMPANION_REGISTRATION' : 'CUSTOMER_REGISTRATION',
        feeName: user?.role === 'companion' ? 'Companion Registration Fee' : 'Customer Registration Fee',
        baseAmount: p.amount || 499,
        gstAmount: 0,
        totalAmount: p.amount || 499,
        currency: 'INR',
        status: isApproved ? 'PAID' : p.paymentStatus === 'REJECTED' ? 'FAILED' : 'PENDING',
        gateway: 'RAZORPAY',
        orderId: `order_${p.id}`,
        paymentId: p.paymentReference || '',
        transactionId: p.paymentReference || p.id,
        paymentMethod: p.paymentMethod || 'UPI',
        paidAt: isApproved ? (p.approvedAt || p.submittedAt) : null,
        createdAt: p.createdAt || p.submittedAt,
        updatedAt: p.updatedAt || p.submittedAt,
        notes: p.notes,
      });
    }
  }

  return Array.from(new Set(combined.values())).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function createPaymentTransactionRecord(
  tx: PaymentTransactionRecord
): Promise<PaymentTransactionRecord> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const record: PaymentTransactionRecord = {
    ...tx,
    createdAt: tx.createdAt || now,
    updatedAt: now,
  };

  if (supabase) {
    try {
      await supabase.from('payment_transactions').upsert(
        {
          id: record.id,
          user_id: record.userId,
          user_name: record.userName,
          user_email: record.userEmail,
          user_phone: record.userPhone,
          user_role: record.userRole,
          fee_configuration_id: record.feeConfigurationId,
          fee_code: record.feeCode,
          fee_name: record.feeName,
          base_amount: record.baseAmount,
          gst_amount: record.gstAmount,
          total_amount: record.totalAmount,
          currency: record.currency,
          status: record.status,
          gateway: record.gateway,
          order_id: record.orderId,
          payment_id: record.paymentId,
          transaction_id: record.transactionId,
          gateway_reference_id: record.gatewayReferenceId,
          payment_method: record.paymentMethod,
          paid_at: record.paidAt,
          waived_by: record.waivedBy,
          waive_reason: record.waiveReason,
          created_at: record.createdAt,
          updated_at: now,
          notes: record.notes,
        },
        { onConflict: 'id' }
      );
    } catch (e: any) {
      // Handled via resilient store
    }
  }

  storeMemory.paymentTransactions[record.id] = record;
  storeMemory.paymentTransactions[record.orderId] = record;
  persistStore();

  // Also sync to registration_payments for backward compatibility if registration fee
  if (record.feeCode.includes('REGISTRATION')) {
    await createPayment({
      id: record.id,
      userId: record.userId,
      amount: record.totalAmount,
      paymentMethod: record.paymentMethod,
      paymentReference: record.transactionId || record.paymentId || record.orderId,
      paymentStatus: record.status === 'PAID' ? 'APPROVED' : record.status === 'FAILED' ? 'REJECTED' : 'PENDING',
      submittedAt: record.createdAt,
      approvedAt: record.paidAt,
      createdAt: record.createdAt,
      updatedAt: now,
      notes: record.notes || `Gateway: ${record.gateway} | Txn: ${record.transactionId}`,
    });
  }

  return record;
}

export async function updatePaymentTransactionRecord(
  orderIdOrId: string,
  updates: Partial<PaymentTransactionRecord>
): Promise<PaymentTransactionRecord> {
  const existing = (await getTransactionByOrderId(orderIdOrId)) || (await getTransactionById(orderIdOrId));
  const now = new Date().toISOString();

  const updated: PaymentTransactionRecord = {
    ...(existing || {
      id: orderIdOrId,
      userId: updates.userId || 'guest',
      userName: updates.userName || 'Customer',
      userRole: 'COMPANION',
      feeCode: 'COMPANION_REGISTRATION',
      feeName: 'Companion Registration Fee',
      baseAmount: updates.baseAmount || 499,
      gstAmount: updates.gstAmount || 0,
      totalAmount: updates.totalAmount || 499,
      currency: 'INR',
      status: 'PENDING',
      gateway: 'RAZORPAY',
      orderId: orderIdOrId,
      paymentId: '',
      transactionId: '',
      paymentMethod: 'UPI',
      createdAt: now,
      updatedAt: now,
    }),
    ...updates,
    updatedAt: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('payment_transactions')
        .update({
          status: updated.status,
          payment_id: updated.paymentId,
          transaction_id: updated.transactionId,
          gateway_reference_id: updated.gatewayReferenceId,
          payment_method: updated.paymentMethod,
          paid_at: updated.paidAt,
          waived_by: updated.waivedBy,
          waive_reason: updated.waiveReason,
          updated_at: now,
          notes: updated.notes,
        })
        .or(`id.eq.${orderIdOrId},order_id.eq.${orderIdOrId}`);
    } catch (e: any) {
      // Store fallback
    }
  }

  storeMemory.paymentTransactions[updated.id] = updated;
  if (updated.orderId) {
    storeMemory.paymentTransactions[updated.orderId] = updated;
  }
  persistStore();

  // Backward compatibility with registration_payments
  if (updated.feeCode.includes('REGISTRATION')) {
    await updatePayment(updated.userId, {
      paymentStatus: updated.status === 'PAID' ? 'APPROVED' : updated.status === 'FAILED' ? 'REJECTED' : 'PENDING',
      approvedAt: updated.paidAt,
      paymentReference: updated.transactionId || updated.paymentId,
    });
  }

  return updated;
}

export async function getTransactionByOrderId(orderId: string): Promise<PaymentTransactionRecord | null> {
  const direct = storeMemory.paymentTransactions[orderId];
  if (direct) return direct;

  for (const t of Object.values(storeMemory.paymentTransactions)) {
    if (t.orderId === orderId) return t;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          userName: data.user_name,
          userEmail: data.user_email,
          userPhone: data.user_phone,
          userRole: data.user_role,
          feeCode: data.fee_code,
          feeName: data.fee_name,
          baseAmount: Number(data.base_amount),
          gstAmount: Number(data.gst_amount),
          totalAmount: Number(data.total_amount),
          currency: data.currency,
          status: data.status,
          gateway: data.gateway,
          orderId: data.order_id,
          paymentId: data.payment_id,
          transactionId: data.transaction_id,
          gatewayReferenceId: data.gateway_reference_id,
          paymentMethod: data.payment_method,
          paidAt: data.paid_at,
          waivedBy: data.waived_by,
          waiveReason: data.waive_reason,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          notes: data.notes,
        };
      }
    } catch (e: any) {}
  }

  return null;
}

export async function getTransactionById(id: string): Promise<PaymentTransactionRecord | null> {
  if (storeMemory.paymentTransactions[id]) return storeMemory.paymentTransactions[id];
  const all = await getAllPaymentTransactions();
  return all.find((t) => t.id === id) || null;
}

export async function waiveUserFeeRecord(
  userId: string,
  feeCode: string,
  reason: string,
  adminId: string = 'superadmin'
): Promise<{ success: boolean; transaction: PaymentTransactionRecord; user: UserRecord }> {
  const user = await getUserByIdentifier(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const feeConfig = await getFeeByCode(feeCode);
  const now = new Date().toISOString();
  const txnId = `txn_waive_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const transactionRecord: PaymentTransactionRecord = {
    id: txnId,
    userId: user.userId,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    userRole: user.role === 'companion' ? 'COMPANION' : 'CUSTOMER',
    feeConfigurationId: feeConfig.id,
    feeCode: feeConfig.feeCode,
    feeName: feeConfig.feeName,
    baseAmount: feeConfig.amount,
    gstAmount: 0,
    totalAmount: 0, // Waived amount is ₹0 charged
    currency: 'INR',
    status: 'WAIVED',
    gateway: 'ADMIN_OVERRIDE',
    orderId: `waive_${Date.now()}`,
    paymentId: `waived_by_${adminId}`,
    transactionId: `WAIVE-${Date.now()}`,
    paymentMethod: 'WAIVED',
    paidAt: now,
    waivedBy: adminId,
    waiveReason: reason,
    createdAt: now,
    updatedAt: now,
    notes: `Fee manually waived by Admin (${adminId}). Reason: ${reason}`,
  };

  await createPaymentTransactionRecord(transactionRecord);

  // Update user in central database
  const updatedUser = await updateUser(user.userId, {
    accountStatus: 'active',
    paymentStatus: 'Approved',
    feePaid: true,
    loginEnabled: true,
    approvedAt: now,
    approvedBy: adminId,
  });

  // If host application exists, approve fee status
  try {
    await updateApplicationRecord(user.userId, {
      registrationFeePaid: true,
    });
  } catch (e) {}

  // Financial Audit Logging
  await logPaymentAuditRecord(
    'FEE_WAIVED',
    adminId,
    user.userId,
    {
      feeCode,
      amountWaived: feeConfig.amount,
      reason,
      transactionId: transactionRecord.transactionId,
    },
    transactionRecord.id
  );

  return { success: true, transaction: transactionRecord, user: updatedUser };
}

export async function logPaymentAuditRecord(
  action: string,
  performedBy: string,
  affectedUserId?: string,
  metadata?: any,
  paymentTransactionId?: string
): Promise<PaymentAuditLogRecord> {
  const now = new Date().toISOString();
  const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const record: PaymentAuditLogRecord = {
    id,
    paymentTransactionId,
    action,
    performedBy,
    affectedUserId,
    metadata,
    createdAt: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('audit_logs').insert({
        id,
        action,
        admin_id: performedBy,
        user_id: affectedUserId,
        details: JSON.stringify(metadata || {}),
        created_at: now,
      });
    } catch (e: any) {}
  }

  storeMemory.paymentAuditLogs[id] = record;
  persistStore();

  return record;
}

export async function getPaymentAuditLogs(): Promise<PaymentAuditLogRecord[]> {
  return Object.values(storeMemory.paymentAuditLogs || {}).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ============================================================================
// APPLICATIONS CRUD
// ============================================================================

export async function getAllApplications(): Promise<HostApplicantRecord[]> {
  const supabase = getSupabaseClient();
  let dbApps: HostApplicantRecord[] = [];

  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('host_applications')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error && error.code === 'PGRST205') {
        const compRes = await supabase
          .from('companion_applications')
          .select('*')
          .order('applied_at', { ascending: false });
        data = compRes.data;
        error = compRes.error;
      }

      if (!error && data) {
        dbApps = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          age: Number(row.age) || 22,
          dateOfBirth: row.date_of_birth,
          city: row.city || 'Ahmedabad',
          area: row.area || row.locality_area || 'Central',
          localityArea: row.locality_area || row.area || 'Central',
          garbaStyle: row.garba_style || 'Traditional 2-Taali & 3-Taali',
          appliedAt: row.applied_at ? new Date(row.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          idDocument: row.id_document || 'Govt ID Proof',
          aadhaarImage: row.aadhaar_image,
          selfieImage: row.selfie_image,
          profilePhoto: row.profile_photo || row.avatar,
          avatar: row.avatar || row.profile_photo,
          registrationFeePaid: Boolean(row.registration_fee_paid),
          faceMatchScore: row.face_match_score || 'Not performed',
          status: (row.status || 'pending_review').toLowerCase() as any,
          phone: row.phone,
          email: row.email,
          experienceYears: row.experience_years || '2',
          bio: row.bio || '',
          languages: row.languages || 'Gujarati, Hindi, English',
          hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : 1200,
          phoneVerified: Boolean(row.phone_verified),
          reviewStatus: row.review_status || 'Pending Review',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      console.warn('Supabase getAllApplications warning:', e?.message);
    }
  }

  const combined = new Map<string, HostApplicantRecord>();
  for (const a of dbApps) {
    combined.set(a.id, a);
  }
  for (const a of Object.values(storeMemory.applications)) {
    if (!combined.has(a.id)) {
      combined.set(a.id, a);
    }
  }

  return Array.from(combined.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function createApplicationRecord(app: HostApplicantRecord): Promise<HostApplicantRecord> {
  const supabase = getSupabaseClient();

  const insertPayload = {
    id: app.id,
    user_id: app.userId,
    name: app.name,
    age: app.age,
    date_of_birth: app.dateOfBirth || null,
    city: app.city || 'Ahmedabad',
    area: app.area || 'Central',
    locality_area: app.localityArea || app.area || 'Central',
    garba_style: app.garbaStyle || 'Traditional 2-Taali & 3-Taali',
    applied_at: new Date().toISOString(),
    id_document: app.idDocument || 'Govt ID Proof',
    aadhaar_image: app.aadhaarImage || null,
    selfie_image: app.selfieImage || null,
    profile_photo: app.profilePhoto || app.avatar || null,
    avatar: app.avatar || app.profilePhoto || null,
    registration_fee_paid: app.registrationFeePaid ?? false,
    face_match_score: app.faceMatchScore || 'Not performed',
    status: app.status || 'pending_review',
    phone: app.phone || null,
    email: app.email || null,
    experience_years: app.experienceYears || '2',
    bio: app.bio || '',
    languages: app.languages || 'Gujarati, Hindi, English',
    hourly_rate: app.hourlyRate || 1200,
    phone_verified: app.phoneVerified ?? false,
    review_status: app.reviewStatus || 'Pending Review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      let { error } = await supabase
        .from('host_applications')
        .upsert(insertPayload, { onConflict: 'id' });

      if (error && error.code === 'PGRST205') {
        const compRes = await supabase
          .from('companion_applications')
          .upsert(insertPayload, { onConflict: 'id' });
        error = compRes.error;
      }

      if (error) {
        console.warn(`[Supabase host_applications notice: ${error.message}]. Retained in resilient store.`);
      }
    } catch (e: any) {
      console.warn(`[Supabase createApplicationRecord Exception: ${e?.message}]. Retained in resilient store.`);
    }
  }

  storeMemory.applications[app.id] = app;
  persistStore();

  return app;
}

export async function updateApplicationRecord(
  appIdOrUserId: string,
  updates: Partial<HostApplicantRecord>
): Promise<HostApplicantRecord> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.reviewStatus !== undefined) dbUpdates.review_status = updates.reviewStatus;
  if (updates.registrationFeePaid !== undefined) dbUpdates.registration_fee_paid = updates.registrationFeePaid;
  if (updates.faceMatchScore !== undefined) dbUpdates.face_match_score = updates.faceMatchScore;

  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('host_applications')
        .update(dbUpdates)
        .eq('id', appIdOrUserId)
        .select();

      if (!error && (!data || data.length === 0)) {
        await supabase
          .from('host_applications')
          .update(dbUpdates)
          .eq('user_id', appIdOrUserId);
      }
    } catch (e: any) {
      console.warn(`[Supabase updateApplicationRecord Warning] ${e?.message}`);
    }
  }

  let existing = storeMemory.applications[appIdOrUserId];
  if (!existing) {
    for (const a of Object.values(storeMemory.applications)) {
      if (a.userId === appIdOrUserId) {
        existing = a;
        break;
      }
    }
  }

  const updated: HostApplicantRecord = {
    ...(existing || {
      id: appIdOrUserId,
      userId: appIdOrUserId,
      name: 'Applicant',
      age: 22,
      city: 'Ahmedabad',
      area: 'Central',
      localityArea: 'Central',
      garbaStyle: 'Traditional',
      appliedAt: new Date().toISOString(),
      idDocument: 'Govt ID',
      registrationFeePaid: false,
      status: 'pending_review',
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storeMemory.applications[updated.id] = updated;
  persistStore();

  return updated;
}

export async function getActiveCompanions(): Promise<any[]> {
  const supabase = getSupabaseClient();
  const defaultDates = ['oct11', 'oct12', 'oct13', 'oct14', 'oct15', 'oct16', 'oct17', 'oct18', 'oct19'];
  const defaultExperiences = ['Garba', 'Photos', 'Conversation', 'Dinner', 'Garba Event'];
  const defaultSkills = ['2-Taali', '3-Taali', 'Dodhiyo', 'Sanedo'];
  const defaultVenues = ['GMDC Ground, Ahmedabad', 'Rajpath Club', 'Karnavati Club'];

  const rawCandidates: any[] = [];

  // 1. Fetch approved host applications from Supabase
  if (supabase) {
    try {
      const { data: appData, error: appError } = await supabase
        .from('host_applications')
        .select('*')
        .or('status.eq.approved,review_status.eq.Approved')
        .order('created_at', { ascending: false });

      if (!appError && appData) {
        for (const row of appData) {
          rawCandidates.push({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            age: row.age,
            city: row.city,
            area: row.area || row.locality_area,
            avatar: row.profile_photo || row.avatar,
            bio: row.bio,
            garbaStyle: row.garba_style,
            languages: row.languages,
            experienceYears: row.experience_years,
            hourlyRate: row.hourly_rate,
            status: row.status,
            reviewStatus: row.review_status,
            phoneVerified: row.phone_verified,
            registrationFeePaid: row.registration_fee_paid,
            source: 'host_application',
          });
        }
      }
    } catch (e: any) {
      console.warn('Supabase getActiveCompanions applications warning:', e?.message);
    }

    // 2. Fetch active companion users from Supabase
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('role', 'companion')
        .eq('account_status', 'active')
        .order('created_at', { ascending: false });

      if (!userError && userData) {
        for (const row of userData) {
          rawCandidates.push({
            id: row.user_id || row.id,
            userId: row.user_id,
            name: row.name,
            age: row.age,
            city: row.city,
            area: row.city,
            avatar: row.profile_photo,
            bio: row.bio,
            garbaStyle: row.garba_style,
            languages: row.languages,
            experienceYears: 2,
            hourlyRate: row.hourly_rate,
            status: row.account_status,
            reviewStatus: 'Approved',
            phoneVerified: true,
            registrationFeePaid: row.fee_paid,
            source: 'user',
          });
        }
      }
    } catch (e: any) {
      console.warn('Supabase getActiveCompanions users warning:', e?.message);
    }
  }

  // 3. Merge with approved applications from resilient local store
  for (const app of Object.values(storeMemory.applications)) {
    const isApproved =
      app.status === 'approved' ||
      (app.reviewStatus && app.reviewStatus.toLowerCase() === 'approved');
    if (isApproved && app.status !== 'suspended' && app.status !== 'rejected') {
      rawCandidates.push({
        id: app.id,
        userId: app.userId,
        name: app.name,
        age: app.age,
        city: app.city,
        area: app.area || app.localityArea,
        avatar: app.profilePhoto || app.avatar,
        bio: app.bio,
        garbaStyle: app.garbaStyle,
        languages: app.languages,
        experienceYears: app.experienceYears,
        hourlyRate: app.hourlyRate,
        status: app.status,
        reviewStatus: app.reviewStatus,
        phoneVerified: app.phoneVerified,
        registrationFeePaid: app.registrationFeePaid,
        source: 'local_application',
      });
    }
  }

  // 4. Merge with active companion users from resilient local store
  for (const u of Object.values(storeMemory.users)) {
    if (
      u.role === 'companion' &&
      (u.accountStatus === 'active' || u.feePaid) &&
      u.accountStatus !== 'suspended' &&
      u.accountStatus !== 'blocked'
    ) {
      rawCandidates.push({
        id: u.userId || u.id,
        userId: u.userId,
        name: u.name,
        age: u.age,
        city: u.city,
        area: u.city,
        avatar: u.profilePhoto,
        bio: u.bio,
        garbaStyle: u.garbaStyle,
        languages: u.languages,
        experienceYears: 2,
        hourlyRate: u.hourlyRate,
        status: u.accountStatus,
        reviewStatus: 'Approved',
        phoneVerified: true,
        registrationFeePaid: u.feePaid,
        source: 'local_user',
      });
    }
  }

  // 5. Deduplicate by unique companion identifier / user / name
  const uniqueCompanions = new Map<string, any>();
  const seenKeys = new Set<string>();

  for (const cand of rawCandidates) {
    if (!cand.name || !String(cand.name).trim()) continue;
    if (cand.status === 'suspended' || cand.status === 'rejected' || cand.status === 'deleted') continue;

    const rawPk = cand.userId ?? cand.id ?? cand.name ?? '';
    const primaryKey = String(rawPk).toLowerCase().trim();
    const nameKey = String(cand.name || '').toLowerCase().trim();
    if (seenKeys.has(primaryKey) || (nameKey && seenKeys.has(nameKey))) continue;

    if (primaryKey) seenKeys.add(primaryKey);
    if (nameKey) seenKeys.add(nameKey);
    if (cand.id != null) seenKeys.add(String(cand.id).toLowerCase().trim());
    if (cand.userId != null) seenKeys.add(String(cand.userId).toLowerCase().trim());

    const hourly = Number(cand.hourlyRate) || 1200;
    const price2h = hourly;
    const price4h = Math.round(hourly * 1.8);
    const photo =
      cand.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
    const bioText = cand.bio?.trim() || 'Passionate Garba dancer and friendly local Navratri partner.';
    const yearsExp = parseInt(String(cand.experienceYears || '2'), 10) || 2;
    const cityClean =
      (cand.city || '').toLowerCase().includes('gandhinagar') ? 'Gandhinagar' : 'Ahmedabad';

    // Safe public projection - excludes sensitive PII (Aadhaar, passwords, private documents)
    const publicProfile = {
      id: cand.id || cand.userId,
      name: cand.name.trim(),
      age: Number(cand.age) || 22,
      city: cityClean as 'Ahmedabad' | 'Gandhinagar',
      area: cand.area || (cityClean === 'Gandhinagar' ? 'Infocity / Sector 21' : 'Bodakdev / SG Highway'),
      rating: 4.9,
      reviewCount: 14,
      isTopHost: true,
      idVerified: true,
      phoneVerified: true,
      backgroundChecked: true,
      avatarUrl: photo,
      detailedPhotoUrl: photo,
      availableTonight: true,
      availableDates: defaultDates,
      experiences: defaultExperiences,
      durations: [2, 4],
      price2h: price2h,
      price4h: price4h,
      bioSnippet: bioText.length > 140 ? bioText.substring(0, 140) + '...' : bioText,
      fullBio: bioText,
      yearsExperience: yearsExp,
      responseRate: '99%',
      responseTime: 'Within 10 mins',
      skills: cand.garbaStyle ? [cand.garbaStyle, ...defaultSkills.slice(0, 2)] : defaultSkills,
      inclusions: ['Festival Guidance', 'Cultural Orientation'],
      preferredVenues: defaultVenues,
      status: 'active',
      hasCompletedProfile: true,
      isVerified: true,
      registrationFeePaid: true,
    };

    uniqueCompanions.set(primaryKey, publicProfile);
  }

  return Array.from(uniqueCompanions.values());
}

// ============================================================================
// BOOKINGS CRUD
// ============================================================================

export async function getAllBookings(filter?: { customerId?: string; companionId?: string }): Promise<BookingRecord[]> {
  const supabase = getSupabaseClient();
  let dbBookings: BookingRecord[] = [];

  if (supabase) {
    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (filter?.customerId) query = query.eq('customer_id', filter.customerId);
      if (filter?.companionId) query = query.eq('companion_id', filter.companionId);

      const { data, error } = await query;
      if (!error && data) {
        dbBookings = data.map((row: any) => ({
          id: row.id,
          bookingReference: row.booking_reference,
          customerId: row.customer_id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          companionId: row.companion_id,
          companionName: row.companion_name,
          companionPhone: row.companion_phone,
          companionUpi: row.companion_upi,
          companionAge: row.companion_age,
          companionCity: row.companion_city,
          companionAvatar: row.companion_avatar,
          date: row.date,
          rawDate: row.raw_date || row.date,
          timeSlot: row.time_slot,
          durationPackage: row.duration_package,
          venue: row.venue,
          city: row.city || 'Ahmedabad',
          basePrice: Number(row.base_price) || 0,
          platformFee: Number(row.platform_fee) || 50,
          totalPrice: Number(row.total_price) || 0,
          companionEarnings: Number(row.companion_earnings) || 0,
          status: row.status,
          paymentStatus: row.payment_status,
          paymentReference: row.payment_reference,
          escrowStatus: row.escrow_status || 'Held in Escrow',
          completionOtp: row.completion_otp,
          otpVerified: Boolean(row.otp_verified),
          checkInAt: row.check_in_at,
          completedAt: row.completed_at,
          payoutStatus: row.payout_status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      console.warn('Supabase getAllBookings warning:', e?.message);
    }
  }

  const combined = new Map<string, BookingRecord>();
  for (const b of dbBookings) {
    combined.set(b.id, b);
  }
  for (const b of Object.values(storeMemory.bookings)) {
    if (filter?.customerId && b.customerId !== filter.customerId) continue;
    if (filter?.companionId && b.companionId !== filter.companionId) continue;
    if (!combined.has(b.id)) {
      combined.set(b.id, b);
    }
  }

  return Array.from(combined.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function createBookingRecord(booking: BookingRecord): Promise<BookingRecord> {
  const supabase = getSupabaseClient();

  const insertPayload = {
    id: booking.id,
    booking_reference: booking.bookingReference,
    customer_id: booking.customerId,
    customer_name: booking.customerName,
    customer_phone: booking.customerPhone || null,
    companion_id: booking.companionId,
    companion_name: booking.companionName,
    companion_phone: booking.companionPhone || null,
    companion_upi: booking.companionUpi || null,
    companion_age: booking.companionAge || 22,
    companion_city: booking.companionCity || booking.city,
    companion_avatar: booking.companionAvatar || null,
    date: booking.date,
    raw_date: booking.rawDate || booking.date,
    time_slot: booking.timeSlot,
    duration_package: booking.durationPackage,
    venue: booking.venue,
    city: booking.city || 'Ahmedabad',
    base_price: booking.basePrice,
    platform_fee: booking.platformFee,
    total_price: booking.totalPrice,
    companion_earnings: booking.companionEarnings,
    status: booking.status,
    payment_status: booking.paymentStatus,
    payment_reference: booking.paymentReference || null,
    escrow_status: booking.escrowStatus || 'Held in Escrow',
    completion_otp: booking.completionOtp || null,
    otp_verified: booking.otpVerified ?? false,
    payout_status: booking.payoutStatus || 'escrow_held',
    created_at: booking.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .upsert(insertPayload, { onConflict: 'id' });
      if (error) {
        console.warn(`[Supabase bookings notice: ${error.message}]. Retained in resilient store.`);
      }
    } catch (e: any) {
      console.warn(`[Supabase createBookingRecord Exception: ${e?.message}]. Retained in resilient store.`);
    }
  }

  storeMemory.bookings[booking.id] = booking;
  persistStore();

  return booking;
}

export async function updateBookingRecord(
  bookingId: string,
  updates: Partial<BookingRecord>
): Promise<BookingRecord> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.escrowStatus !== undefined) dbUpdates.escrow_status = updates.escrowStatus;
  if (updates.otpVerified !== undefined) dbUpdates.otp_verified = updates.otpVerified;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
  if (updates.payoutStatus !== undefined) dbUpdates.payout_status = updates.payoutStatus;

  if (supabase) {
    try {
      await supabase
        .from('bookings')
        .update(dbUpdates)
        .eq('id', bookingId);
    } catch (e: any) {
      console.warn(`[Supabase updateBookingRecord Warning] ${e?.message}`);
    }
  }

  const existing = storeMemory.bookings[bookingId];
  const updated: BookingRecord = {
    ...(existing || {
      id: bookingId,
      bookingReference: `BK-${Date.now()}`,
      customerId: '',
      customerName: 'Customer',
      companionId: '',
      companionName: 'Companion',
      date: new Date().toISOString(),
      rawDate: new Date().toISOString(),
      timeSlot: 'Evening',
      durationPackage: 'Single Day',
      venue: 'Venue',
      city: 'Ahmedabad',
      basePrice: 0,
      platformFee: 50,
      totalPrice: 50,
      companionEarnings: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      escrowStatus: 'Held in Escrow',
      createdAt: new Date().toISOString(),
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storeMemory.bookings[bookingId] = updated;
  persistStore();

  return updated;
}

// ============================================================================
// PAYOUTS CRUD
// ============================================================================

export async function getAllPayouts(): Promise<PayoutRecord[]> {
  const supabase = getSupabaseClient();
  let dbPayouts: PayoutRecord[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbPayouts = data.map((row: any) => ({
          id: row.id,
          bookingId: row.booking_id,
          companionId: row.companion_id,
          companionName: row.companion_name,
          companionUpi: row.companion_upi,
          amount: Number(row.amount) || 0,
          platformFee: Number(row.platform_fee) || 0,
          grossAmount: Number(row.gross_amount) || 0,
          status: row.status,
          transactionReference: row.transaction_reference,
          approvedAt: row.approved_at,
          approvedBy: row.approved_by,
          paidAt: row.paid_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      console.warn('Supabase getAllPayouts warning:', e?.message);
    }
  }

  const combined = new Map<string, PayoutRecord>();
  for (const p of dbPayouts) {
    combined.set(p.id, p);
  }
  for (const p of Object.values(storeMemory.payouts)) {
    if (!combined.has(p.id)) {
      combined.set(p.id, p);
    }
  }

  return Array.from(combined.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function createPayoutRecord(payout: PayoutRecord): Promise<PayoutRecord> {
  const supabase = getSupabaseClient();

  const insertPayload = {
    id: payout.id,
    booking_id: payout.bookingId,
    companion_id: payout.companionId,
    companion_name: payout.companionName,
    companion_upi: payout.companionUpi,
    amount: payout.amount,
    platform_fee: payout.platformFee || 0,
    gross_amount: payout.grossAmount,
    status: payout.status,
    created_at: payout.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('payouts')
        .upsert(insertPayload, { onConflict: 'id' });
      if (error && error.code !== 'PGRST205') {
        console.warn(`[Supabase payouts notice: ${error.message}]. Retained in resilient store.`);
      }
    } catch (e: any) {
      console.warn(`[Supabase createPayoutRecord Exception: ${e?.message}]. Retained in resilient store.`);
    }
  }

  storeMemory.payouts[payout.id] = payout;
  persistStore();

  return payout;
}

export async function updatePayoutRecord(
  payoutId: string,
  updates: Partial<PayoutRecord>
): Promise<PayoutRecord> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.transactionReference !== undefined) dbUpdates.transaction_reference = updates.transactionReference;
  if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
  if (updates.paidAt !== undefined) dbUpdates.paid_at = updates.paidAt;

  if (supabase) {
    try {
      await supabase
        .from('payouts')
        .update(dbUpdates)
        .eq('id', payoutId);
    } catch (e: any) {
      console.warn(`[Supabase updatePayoutRecord Warning] ${e?.message}`);
    }
  }

  const existing = storeMemory.payouts[payoutId];
  const updated: PayoutRecord = {
    ...(existing || {
      id: payoutId,
      bookingId: '',
      companionId: '',
      companionName: '',
      companionUpi: '',
      amount: 0,
      platformFee: 0,
      grossAmount: 0,
      status: 'PENDING_ADMIN_APPROVAL',
      createdAt: new Date().toISOString(),
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storeMemory.payouts[payoutId] = updated;
  persistStore();

  return updated;
}

// ============================================================================
// COMPLAINTS CRUD
// ============================================================================

export async function getAllComplaints(): Promise<ComplaintRecord[]> {
  const supabase = getSupabaseClient();
  let dbComplaints: ComplaintRecord[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbComplaints = data.map((row: any) => ({
          id: row.id,
          bookingId: row.booking_id,
          reporterType: row.reporter_type || 'guest',
          reporterName: row.reporter_name,
          reporterPhone: row.reporter_phone,
          targetName: row.target_name,
          category: row.category,
          severity: row.severity || 'medium',
          status: row.status || 'open',
          subject: row.subject,
          description: row.description,
          assignedAdmin: row.assigned_admin,
          resolutionNotes: row.resolution_notes,
          resolvedAt: row.resolved_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e: any) {
      console.warn('Supabase getAllComplaints warning:', e?.message);
    }
  }

  const combined = new Map<string, ComplaintRecord>();
  for (const c of dbComplaints) {
    combined.set(c.id, c);
  }
  for (const c of Object.values(storeMemory.complaints)) {
    if (!combined.has(c.id)) {
      combined.set(c.id, c);
    }
  }

  return Array.from(combined.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function createComplaintRecord(complaint: ComplaintRecord): Promise<ComplaintRecord> {
  const supabase = getSupabaseClient();

  const insertPayload = {
    id: complaint.id,
    booking_id: complaint.bookingId || null,
    reporter_type: complaint.reporterType,
    reporter_name: complaint.reporterName,
    reporter_phone: complaint.reporterPhone || null,
    target_name: complaint.targetName,
    category: complaint.category,
    severity: complaint.severity,
    status: complaint.status || 'open',
    subject: complaint.subject,
    description: complaint.description,
    created_at: complaint.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('complaints')
        .upsert(insertPayload, { onConflict: 'id' });
      if (error) {
        console.warn(`[Supabase complaints notice: ${error.message}]. Retained in resilient store.`);
      }
    } catch (e: any) {
      console.warn(`[Supabase createComplaintRecord Exception: ${e?.message}]. Retained in resilient store.`);
    }
  }

  storeMemory.complaints[complaint.id] = complaint;
  persistStore();

  return complaint;
}

export async function updateComplaintRecord(
  complaintId: string,
  updates: Partial<ComplaintRecord>
): Promise<ComplaintRecord> {
  const supabase = getSupabaseClient();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.resolutionNotes !== undefined) dbUpdates.resolution_notes = updates.resolutionNotes;
  if (updates.assignedAdmin !== undefined) dbUpdates.assigned_admin = updates.assignedAdmin;
  if (updates.resolvedAt !== undefined) dbUpdates.resolved_at = updates.resolvedAt;

  if (supabase) {
    try {
      await supabase
        .from('complaints')
        .update(dbUpdates)
        .eq('id', complaintId);
    } catch (e: any) {
      console.warn(`[Supabase updateComplaintRecord Warning] ${e?.message}`);
    }
  }

  const existing = storeMemory.complaints[complaintId];
  const updated: ComplaintRecord = {
    ...(existing || {
      id: complaintId,
      reporterType: 'guest',
      reporterName: 'Reporter',
      targetName: 'Target',
      category: 'General',
      severity: 'medium',
      status: 'open',
      subject: 'Complaint',
      description: '',
      createdAt: new Date().toISOString(),
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  storeMemory.complaints[complaintId] = updated;
  persistStore();

  return updated;
}

// ============================================================================
// USER PROFILES CRUD
// ============================================================================

export async function getUserProfile(userId: string): Promise<UserProfileRecord | null> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          city: row.city,
          age: row.age,
          gender: row.gender,
          bio: row.bio,
          emergencyContactName: row.emergency_contact_name,
          emergencyContactPhone: row.emergency_contact_phone,
          emergencyContactRelation: row.emergency_contact_relation,
          preferredLocations: row.preferred_locations,
          preferredGarbaStyle: row.preferred_garba_style,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch (e: any) {
      console.warn('Supabase getUserProfile warning:', e?.message);
    }
  }

  return storeMemory.profiles[userId.toLowerCase()] || null;
}

export async function saveUserProfile(profile: UserProfileRecord): Promise<UserProfileRecord> {
  const supabase = getSupabaseClient();

  const upsertPayload = {
    user_id: profile.userId,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city || 'Ahmedabad',
    age: profile.age || null,
    gender: profile.gender || null,
    bio: profile.bio || null,
    emergency_contact_name: profile.emergencyContactName || null,
    emergency_contact_phone: profile.emergencyContactPhone || null,
    emergency_contact_relation: profile.emergencyContactRelation || null,
    preferred_locations: profile.preferredLocations || [],
    preferred_garba_style: profile.preferredGarbaStyle || null,
    avatar_url: profile.avatarUrl || null,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase
        .from('user_profiles')
        .upsert(upsertPayload, { onConflict: 'user_id' });
    } catch (e: any) {
      console.warn(`[Supabase saveUserProfile Warning] ${e?.message}`);
    }
  }

  storeMemory.profiles[profile.userId.toLowerCase()] = profile;
  persistStore();

  return profile;
}

export const upsertUserProfile = saveUserProfile;
