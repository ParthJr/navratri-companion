// Ensure global WebSocket is defined for Node.js 20/22 serverless environment
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class DummyWebSocket {} as any;
}

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
  rawDate?: string;
  timeSlot: string;
  durationPackage: '2 Hours' | '4 Hours' | string;
  venue: string;
  city: string;
  basePrice: number;
  platformFee: number;
  totalPrice: number;
  companionEarnings: number;
  status: 'PENDING_PAYMENT_VERIFICATION' | 'confirmed' | 'checked_in' | 'session_active' | 'completed' | 'cancelled';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'DISPUTED';
  paymentReference?: string;
  escrowStatus: string;
  completionOtp?: string;
  otpVerified?: boolean;
  checkInAt?: string;
  completedAt?: string;
  payoutStatus: 'escrow_held' | 'ready_to_pay' | 'PENDING_ADMIN_APPROVAL' | 'approved' | 'paid' | 'rejected';
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

/**
 * Returns a configured Supabase Client using server environment variables.
 * Uses SUPABASE_SERVICE_ROLE_KEY for privileged server operations,
 * falling back to SUPABASE_ANON_KEY if service-role key is omitted.
 */
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

/**
 * Strict database client helper. Throws an error if Supabase is unconfigured,
 * ensuring no silent fallback to local storage or memory can occur.
 */
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
// USERS CRUD
// ============================================================================

export async function getAllUsers(): Promise<UserRecord[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getAllUsers error:', error.message);
    throw new Error(`Database error fetching users: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
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

export async function getUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/[^0-9]/g, '');

  const supabase = requireSupabase();

  // Primary lookup by user_id
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('user_id', clean)
    .limit(1);

  // Secondary lookup by email
  if (!error && (!data || data.length === 0)) {
    const emailRes = await supabase
      .from('users')
      .select('*')
      .ilike('email', clean)
      .limit(1);
    data = emailRes.data;
    error = emailRes.error;
  }

  // Tertiary lookup by phone if 10+ digits
  if (!error && (!data || data.length === 0) && cleanPhone.length >= 10) {
    const phoneRes = await supabase
      .from('users')
      .select('*')
      .ilike('phone', `%${cleanPhone.slice(-10)}%`)
      .limit(1);
    data = phoneRes.data;
    error = phoneRes.error;
  }

  if (error) {
    console.error('Supabase getUserByIdentifier error:', error.message);
    throw new Error(`Database error finding user: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

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

export async function createUser(user: UserRecord): Promise<UserRecord> {
  const supabase = requireSupabase();

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

  const { data, error } = await supabase
    .from('users')
    .upsert(insertPayload, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('Supabase createUser error:', error.message);
    throw new Error(`Database error saving user: ${error.message}`);
  }

  const saved = (data && data[0]) ? data[0] : insertPayload;
  return {
    ...user,
    id: saved.id || user.id,
    userId: saved.user_id,
    accountStatus: saved.account_status,
    paymentStatus: saved.payment_status,
    feePaid: saved.fee_paid,
    loginEnabled: saved.login_enabled,
  };
}

export async function updateUser(userId: string, updates: Partial<UserRecord>): Promise<UserRecord> {
  const supabase = requireSupabase();

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

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Supabase updateUser error:', error.message);
    throw new Error(`Database error updating user @${userId}: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`User @${userId} not found in database.`);
  }

  const row = data[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    city: row.city,
    accountStatus: row.account_status,
    paymentStatus: row.payment_status,
    feePaid: row.fee_paid,
    loginEnabled: row.login_enabled,
    profilePhoto: row.profile_photo,
    paymentReference: row.payment_reference,
    paymentSubmittedAt: row.payment_submitted_at,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    rejectedAt: row.rejected_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profileStatus: row.profile_status,
    verificationStatus: row.verification_status,
  };
}

// ============================================================================
// REGISTRATION PAYMENTS CRUD
// ============================================================================

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('registration_payments')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Supabase getAllPayments error:', error.message);
    throw new Error(`Database error fetching payments: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount) || 499,
    paymentMethod: row.payment_method || 'UPI',
    paymentReference: row.payment_reference,
    paymentStatus: (row.payment_status || 'PENDING').toUpperCase() as any,
    submittedAt: row.submitted_at || row.created_at,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    rejectedAt: row.rejected_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
  const supabase = requireSupabase();

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

  const { data, error } = await supabase
    .from('registration_payments')
    .upsert(insertPayload, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Supabase createPayment error:', error.message);
    throw new Error(`Database error recording payment: ${error.message}`);
  }

  return payment;
}

export async function updatePayment(
  userIdOrId: string,
  updates: Partial<PaymentRecord>
): Promise<PaymentRecord> {
  const supabase = requireSupabase();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus.toUpperCase();
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
  if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
  if (updates.rejectedAt !== undefined) dbUpdates.rejected_at = updates.rejectedAt;
  if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
  if (updates.paymentReference !== undefined) dbUpdates.payment_reference = updates.paymentReference;

  // Try updating by user_id first, then by id
  let { data, error } = await supabase
    .from('registration_payments')
    .update(dbUpdates)
    .eq('user_id', userIdOrId)
    .select();

  if (!error && (!data || data.length === 0)) {
    const byIdRes = await supabase
      .from('registration_payments')
      .update(dbUpdates)
      .eq('id', userIdOrId)
      .select();
    data = byIdRes.data;
    error = byIdRes.error;
  }

  if (error) {
    console.error('Supabase updatePayment error:', error.message);
    throw new Error(`Database error updating payment: ${error.message}`);
  }

  const row = (data && data[0]) ? data[0] : {};
  return {
    id: row.id || userIdOrId,
    userId: row.user_id || userIdOrId,
    amount: Number(row.amount) || 499,
    paymentMethod: row.payment_method || 'UPI',
    paymentReference: row.payment_reference || '',
    paymentStatus: (row.payment_status || updates.paymentStatus || 'PENDING').toUpperCase() as any,
    submittedAt: row.submitted_at || new Date().toISOString(),
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    rejectedAt: row.rejected_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// COMPANION / HOST APPLICATIONS CRUD
// ============================================================================

export async function getAllApplications(): Promise<HostApplicantRecord[]> {
  const supabase = requireSupabase();

  // Try host_applications, then companion_applications fallback
  let { data, error } = await supabase
    .from('host_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error && error.code === 'PGRST205') {
    const compRes = await supabase
      .from('companion_applications')
      .select('*')
      .order('created_at', { ascending: false });
    data = compRes.data;
    error = compRes.error;
  }

  if (error) {
    console.error('Supabase getAllApplications error:', error.message);
    throw new Error(`Database error fetching companion applications: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    age: Number(row.age) || 22,
    dateOfBirth: row.date_of_birth,
    city: row.city || 'Ahmedabad',
    area: row.area || 'Central',
    localityArea: row.locality_area || row.area || 'Central',
    garbaStyle: row.garba_style || 'Traditional 2-Taali & 3-Taali',
    appliedAt: row.applied_at || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
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

export async function createApplicationRecord(app: HostApplicantRecord): Promise<HostApplicantRecord> {
  const supabase = requireSupabase();

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
    console.error('Supabase createApplicationRecord error:', error.message);
    throw new Error(`Database error saving companion application: ${error.message}`);
  }

  return app;
}

export async function updateApplicationRecord(
  appId: string,
  updates: Partial<HostApplicantRecord>
): Promise<HostApplicantRecord> {
  const supabase = requireSupabase();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status.toLowerCase();
  if (updates.reviewStatus !== undefined) dbUpdates.review_status = updates.reviewStatus;
  if (updates.phoneVerified !== undefined) dbUpdates.phone_verified = updates.phoneVerified;
  if (updates.registrationFeePaid !== undefined) dbUpdates.registration_fee_paid = updates.registrationFeePaid;

  let { data, error } = await supabase
    .from('host_applications')
    .update(dbUpdates)
    .eq('id', appId)
    .select();

  if (error && error.code === 'PGRST205') {
    const compRes = await supabase
      .from('companion_applications')
      .update(dbUpdates)
      .eq('id', appId)
      .select();
    data = compRes.data;
    error = compRes.error;
  }

  if (error) {
    console.error('Supabase updateApplicationRecord error:', error.message);
    throw new Error(`Database error updating application: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Application ${appId} not found in database.`);
  }

  const row = data[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    age: row.age,
    city: row.city,
    area: row.area,
    garbaStyle: row.garba_style,
    appliedAt: row.applied_at,
    idDocument: row.id_document,
    registrationFeePaid: row.registration_fee_paid,
    faceMatchScore: row.face_match_score,
    status: row.status,
    phone: row.phone,
    email: row.email,
    bio: row.bio,
    languages: row.languages,
    hourlyRate: row.hourly_rate,
    reviewStatus: row.review_status,
  };
}

export const updateApplication = updateApplicationRecord;

// ============================================================================
// ACTIVE COMPANIONS LISTINGS (FOR PUBLIC DIRECTORY)
// ============================================================================

export async function getActiveCompanions(): Promise<any[]> {
  const supabase = requireSupabase();

  // Query users where role = companion and account_status = active
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('role', 'companion')
    .eq('account_status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getActiveCompanions error:', error.message);
    throw new Error(`Database error fetching companion listings: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.user_id,
    name: row.name,
    age: row.age || 22,
    city: row.city || 'Ahmedabad',
    gender: 'Female',
    avatar: row.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    garbaStyle: row.garba_style || 'Traditional 2-Taali & 3-Taali',
    languages: (row.languages || 'Gujarati, Hindi, English').split(',').map((s: string) => s.trim()),
    experienceYears: 2,
    hourlyRate: Number(row.hourly_rate) || 1200,
    bio: row.bio || 'Passionate Garba enthusiast ready to celebrate Navratri.',
    rating: 4.9,
    reviewsCount: 12,
    verified: true,
    badges: ['Top Host', 'ID Verified'],
    isAvailable: true,
    availableSlots: ['07:00 PM - 09:00 PM', '09:30 PM - 11:30 PM'],
    availableCities: (row.available_cities || row.city || 'Ahmedabad').split(',').map((s: string) => s.trim()),
    phone: row.phone,
    email: row.email,
  }));
}

// ============================================================================
// BOOKINGS CRUD
// ============================================================================

export async function getAllBookings(filter?: { customerId?: string; companionId?: string }): Promise<BookingRecord[]> {
  const supabase = requireSupabase();

  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

  if (filter?.customerId) {
    query = query.eq('customer_id', filter.customerId);
  }
  if (filter?.companionId) {
    query = query.eq('companion_id', filter.companionId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getAllBookings error:', error.message);
    throw new Error(`Database error fetching bookings: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
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

export async function createBookingRecord(booking: BookingRecord): Promise<BookingRecord> {
  const supabase = requireSupabase();

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

  const { error } = await supabase
    .from('bookings')
    .upsert(insertPayload, { onConflict: 'id' });

  if (error) {
    console.error('Supabase createBookingRecord error:', error.message);
    throw new Error(`Database error saving booking: ${error.message}`);
  }

  return booking;
}

export async function updateBookingRecord(
  bookingId: string,
  updates: Partial<BookingRecord>
): Promise<BookingRecord> {
  const supabase = requireSupabase();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.escrowStatus !== undefined) dbUpdates.escrow_status = updates.escrowStatus;
  if (updates.otpVerified !== undefined) dbUpdates.otp_verified = updates.otpVerified;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
  if (updates.payoutStatus !== undefined) dbUpdates.payout_status = updates.payoutStatus;

  const { data, error } = await supabase
    .from('bookings')
    .update(dbUpdates)
    .eq('id', bookingId)
    .select();

  if (error) {
    console.error('Supabase updateBookingRecord error:', error.message);
    throw new Error(`Database error updating booking: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Booking ${bookingId} not found in database.`);
  }

  return data[0];
}

// ============================================================================
// PAYOUTS CRUD
// ============================================================================

export async function getAllPayouts(): Promise<PayoutRecord[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // If table doesn't exist yet, return empty list gracefully
    if (error.code === 'PGRST205') return [];
    console.error('Supabase getAllPayouts error:', error.message);
    throw new Error(`Database error fetching payouts: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
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

export async function createPayoutRecord(payout: PayoutRecord): Promise<PayoutRecord> {
  const supabase = requireSupabase();

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

  const { error } = await supabase
    .from('payouts')
    .upsert(insertPayload, { onConflict: 'id' });

  if (error) {
    if (error.code === 'PGRST205') return payout;
    console.error('Supabase createPayoutRecord error:', error.message);
    throw new Error(`Database error recording payout: ${error.message}`);
  }

  return payout;
}

export async function updatePayoutRecord(
  payoutId: string,
  updates: Partial<PayoutRecord>
): Promise<PayoutRecord> {
  const supabase = requireSupabase();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.transactionReference !== undefined) dbUpdates.transaction_reference = updates.transactionReference;
  if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
  if (updates.paidAt !== undefined) dbUpdates.paid_at = updates.paidAt;

  const { data, error } = await supabase
    .from('payouts')
    .update(dbUpdates)
    .eq('id', payoutId)
    .select();

  if (error) {
    console.error('Supabase updatePayoutRecord error:', error.message);
    throw new Error(`Database error updating payout: ${error.message}`);
  }

  return data?.[0] || { id: payoutId, ...updates };
}

// ============================================================================
// COMPLAINTS CRUD
// ============================================================================

export async function getAllComplaints(): Promise<ComplaintRecord[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getAllComplaints error:', error.message);
    throw new Error(`Database error fetching complaints: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
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

export async function createComplaintRecord(complaint: ComplaintRecord): Promise<ComplaintRecord> {
  const supabase = requireSupabase();

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

  const { error } = await supabase
    .from('complaints')
    .upsert(insertPayload, { onConflict: 'id' });

  if (error) {
    console.error('Supabase createComplaintRecord error:', error.message);
    throw new Error(`Database error filing complaint: ${error.message}`);
  }

  return complaint;
}

export async function updateComplaintRecord(
  complaintId: string,
  updates: Partial<ComplaintRecord>
): Promise<ComplaintRecord> {
  const supabase = requireSupabase();

  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.resolutionNotes !== undefined) dbUpdates.resolution_notes = updates.resolutionNotes;
  if (updates.assignedAdmin !== undefined) dbUpdates.assigned_admin = updates.assignedAdmin;
  if (updates.resolvedAt !== undefined) dbUpdates.resolved_at = updates.resolvedAt;

  const { data, error } = await supabase
    .from('complaints')
    .update(dbUpdates)
    .eq('id', complaintId)
    .select();

  if (error) {
    console.error('Supabase updateComplaintRecord error:', error.message);
    throw new Error(`Database error updating complaint: ${error.message}`);
  }

  return data?.[0] || { id: complaintId, ...updates };
}

// ============================================================================
// USER PROFILES CRUD
// ============================================================================

export async function getUserProfile(userId: string): Promise<UserProfileRecord | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Supabase getUserProfile error:', error.message);
    return null;
  }

  if (!data || data.length === 0) return null;
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

export async function saveUserProfile(profile: UserProfileRecord): Promise<UserProfileRecord> {
  const supabase = requireSupabase();

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

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('Supabase saveUserProfile error:', error.message);
    throw new Error(`Database error saving profile: ${error.message}`);
  }

  return (data && data[0]) ? data[0] : profile;
}

export const upsertUserProfile = saveUserProfile;

