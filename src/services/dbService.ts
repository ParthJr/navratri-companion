/**
 * Central Database Service
 * Connects frontend components with the central persistent database via serverless API routes.
 * Ensures multi-device synchronization between User devices and Admin devices.
 */

export interface DbUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'companion' | 'user' | 'admin' | 'owner';
  registrationDate?: string;
  accountStatus: string;
  paymentStatus: string;
  feePaid: boolean;
  profileStatus: string;
  verificationStatus: string;
  loginEnabled: boolean;
  city?: string;
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
  rejectionReason?: string | null;
  paymentReference?: string;
  paymentSubmittedAt?: string;
  policyConsent?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbPaymentApprovalRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role?: 'customer' | 'companion' | 'user' | 'admin' | 'owner';
  city: string;
  amount: number;
  paymentReference: string;
  submittedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string;
  rejectionReason?: string;
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  paymentStatus: 'pending' | 'approved' | 'rejected' | 'pending_payment' | 'PENDING' | 'APPROVED' | 'REJECTED';
  accountStatus: string;
  feePaid: boolean;
  loginEnabled: boolean;
  profilePhoto?: string;
  aadhaarImage?: string;
  selfieImage?: string;
  registrationDate: string;
}

export interface PaymentApprovalsResponse {
  success: boolean;
  requests: DbPaymentApprovalRequest[];
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  total: number;
  errorMessage?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('navratri_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Register a new user in the central database
 */
export async function registerUserInDb(userData: {
  name: string;
  phone: string;
  email: string;
  userId: string;
  password: string;
  city?: string;
  role?: 'customer' | 'companion' | 'user';
  profilePhoto?: string;
  dateOfBirth?: string;
  age?: number;
  bio?: string;
  languages?: string;
  garbaStyle?: string;
  availableCities?: string;
  hourlyRate?: number;
  idDocument?: string;
  policyConsent?: any;
  aadhaarImage?: string;
  selfieImage?: string;
}): Promise<{ success: boolean; user?: DbUser; errorMessage?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, errorMessage: data.errorMessage || 'Registration failed' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error during registration' };
  }
}

/**
 * Submit registration fee payment reference to the central database
 */
export async function submitRegistrationPaymentToDb(
  userId: string,
  paymentReference: string,
  amount: number = 499,
  paymentMethod: string = 'UPI'
): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/payments/submit-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, paymentReference, amount, paymentMethod }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Payment submission failed' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error submitting payment' };
  }
}

/**
 * Fetch all payment approval requests from the central database (for Admin dashboard)
 */
export async function fetchPaymentApprovalsFromDb(): Promise<PaymentApprovalsResponse> {
  try {
    const res = await fetch('/api/admin/payment-approvals', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data;
      }
    }
    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      requests: [],
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      total: 0,
      errorMessage: errData.errorMessage || 'Failed to retrieve records',
    };
  } catch (err: any) {
    return {
      success: false,
      requests: [],
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      total: 0,
      errorMessage: err.message,
    };
  }
}

/**
 * Approve a user registration payment in the central database
 */
export async function approvePaymentInDb(
  userId: string,
  approvedBy?: string
): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/admin/approve-payment', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ userId, approvedBy }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Approval failed' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error during approval' };
  }
}

/**
 * Reject a user registration payment in the central database
 */
export async function rejectPaymentInDb(
  userId: string,
  reason: string,
  rejectedBy?: string
): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/admin/reject-payment', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ userId, reason, rejectedBy }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Rejection failed' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error during rejection' };
  }
}

/**
 * Fetch all registered users from the central database (for Admin Users tab)
 */
export async function fetchUsersFromDb(): Promise<DbUser[]> {
  try {
    const res = await fetch('/api/admin/users', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        return data.users;
      }
    }
  } catch (e) {
    console.warn('fetchUsersFromDb error:', e);
  }
  return [];
}

/**
 * Fetch user profile by userId from central database
 */
export async function fetchUserProfileFromDb(userId: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/users/profile?userId=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.profile) {
        return data.profile;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Save / Update user profile in central database
 */
export async function saveUserProfileToDb(profileData: any): Promise<{ success: boolean; profile?: any; errorMessage?: string }> {
  try {
    const res = await fetch('/api/users/profile', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, profile: data.profile };
    }
    return { success: false, errorMessage: data.errorMessage || 'Failed to save profile' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error saving profile' };
  }
}

/**
 * Upload Image to Production Storage
 * Validates file type (JPEG, PNG, WebP) and size (<=5MB), returns persistent URL
 */
export async function uploadImageToStorage(
  fileOrDataUri: File | string,
  fileName?: string,
  category?: 'profile' | 'kyc' | 'document'
): Promise<{ success: boolean; url?: string; errorMessage?: string }> {
  try {
    let dataUri = '';
    let fName = fileName || 'upload.jpg';
    let fileType = 'image/jpeg';

    if (typeof fileOrDataUri === 'string') {
      dataUri = fileOrDataUri;
    } else {
      fName = fileOrDataUri.name;
      fileType = fileOrDataUri.type;

      // File size validation client-side
      if (fileOrDataUri.size > 5 * 1024 * 1024) {
        return { success: false, errorMessage: 'File size exceeds 5MB limit. Please choose a smaller image.' };
      }

      // Convert File to base64 dataUri
      dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUri);
      });
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUri, fileName: fName, fileType, category }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.url) {
      return { success: true, url: data.url };
    }
    return { success: false, errorMessage: data.errorMessage || 'Failed to upload photo.' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error during photo upload.' };
  }
}

/**
 * Fetch all host companion applications from central database
 */
export async function fetchApplicationsFromDb(): Promise<{
  success: boolean;
  applications: any[];
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}> {
  try {
    const res = await fetch('/api/admin/applications', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.applications)) {
        return {
          success: true,
          applications: data.applications,
          pendingCount: data.pendingCount || 0,
          approvedCount: data.approvedCount || 0,
          rejectedCount: data.rejectedCount || 0,
        };
      }
    }
  } catch (e) {}
  return { success: false, applications: [], pendingCount: 0, approvedCount: 0, rejectedCount: 0 };
}

/**
 * Approve host application in central database
 */
export async function approveApplicationInDb(
  applicationId: string
): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/admin/approve-application', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ applicationId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Failed to approve application.' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error approving application.' };
  }
}

/**
 * Reject host application in central database
 */
export async function rejectApplicationInDb(
  applicationId: string,
  reason: string
): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/admin/reject-application', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ applicationId, reason }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Failed to reject application.' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error rejecting application.' };
  }
}

/**
 * Submit host companion application from public form
 */
export async function submitApplicationToDb(
  appData: any
): Promise<{ success: boolean; application?: any; errorMessage?: string }> {
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, application: data.application };
    }
    return { success: false, errorMessage: data.errorMessage || 'Submission failed.' };
  } catch (err: any) {
    return { success: false, errorMessage: err.message || 'Network error submitting application.' };
  }
}

/**
 * Fetch Bookings from central database
 */
export async function fetchBookingsFromDb(filter?: { customerId?: string; companionId?: string }): Promise<any[]> {
  try {
    let url = '/api/bookings';
    if (filter?.customerId) url += `?customerId=${encodeURIComponent(filter.customerId)}`;
    else if (filter?.companionId) url += `?companionId=${encodeURIComponent(filter.companionId)}`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.bookings)) {
        return data.bookings;
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Create a new booking in central database
 */
export async function createBookingInDb(bookingData: any): Promise<{ success: boolean; booking?: any; errorMessage?: string }> {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, booking: data.booking };
    }
    return { success: false, errorMessage: data.errorMessage || 'Booking creation failed.' };
  } catch (e: any) {
    return { success: false, errorMessage: e.message || 'Network error creating booking.' };
  }
}

/**
 * Verify customer booking payment in central database
 */
export async function verifyBookingPaymentInDb(bookingId: string): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'verify_payment', bookingId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Payment verification failed.' };
  } catch (e: any) {
    return { success: false, errorMessage: e.message || 'Network error verifying payment.' };
  }
}

/**
 * Verify 4-digit Completion OTP in central database
 */
export async function verifyCompletionOtpInDb(bookingId: string, otp: string): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_otp', bookingId, otp }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Invalid completion OTP.' };
  } catch (e: any) {
    return { success: false, errorMessage: e.message || 'Network error verifying completion OTP.' };
  }
}

/**
 * Fetch Payouts from central database
 */
export async function fetchPayoutsFromDb(): Promise<{ success: boolean; payouts: any[]; pendingCount: number }> {
  try {
    const res = await fetch('/api/payouts', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.payouts)) {
        return { success: true, payouts: data.payouts, pendingCount: data.pendingCount || 0 };
      }
    }
  } catch (e) {}
  return { success: false, payouts: [], pendingCount: 0 };
}

/**
 * Approve payout with real transaction reference (UTR) in central database
 */
export async function approvePayoutInDb(payoutId: string, transactionReference: string, approvedBy?: string): Promise<{ success: boolean; message?: string; errorMessage?: string }> {
  try {
    const res = await fetch('/api/payouts', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'approve', payoutId, transactionReference, approvedBy }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, errorMessage: data.errorMessage || 'Payout approval failed.' };
  } catch (e: any) {
    return { success: false, errorMessage: e.message || 'Network error approving payout.' };
  }
}

/**
 * Fetch complaints from central database
 */
export async function fetchComplaintsFromDb(): Promise<any[]> {
  try {
    const res = await fetch('/api/complaints', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.complaints)) {
        return data.complaints;
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Create complaint in central database
 */
export async function createComplaintInDb(complaintData: any): Promise<{ success: boolean; complaint?: any; errorMessage?: string }> {
  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, complaint: data.complaint };
    }
    return { success: false, errorMessage: data.errorMessage || 'Failed to submit complaint.' };
  } catch (e: any) {
    return { success: false, errorMessage: e.message || 'Network error submitting complaint.' };
  }
}

/**
 * Fetch active verified companions from central database
 */
export async function fetchActiveCompanionsFromDb(): Promise<{ success: boolean; companions: any[]; errorMessage?: string }> {
  try {
    const res = await fetch('/api/companions');
    const data = await res.json().catch(() => ({}));
    if (res.ok && data && data.success && Array.isArray(data.companions)) {
      return { success: true, companions: data.companions };
    }
    return {
      success: false,
      companions: [],
      errorMessage: data.errorMessage || 'Unable to load companions. Please try again.',
    };
  } catch (e: any) {
    return {
      success: false,
      companions: [],
      errorMessage: e?.message || 'Network connection error. Unable to load companions.',
    };
  }
}

/**
 * Health check
 */
export async function checkDatabaseHealth(): Promise<{ ok: boolean; database: string }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      return { ok: Boolean(data.ok), database: data.database || 'unknown' };
    }
  } catch (e) {}
  return { ok: false, database: 'disconnected' };
}
