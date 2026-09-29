import { AdminRole } from '../super-admin/types';

export type AccountRole = 'owner' | 'admin' | 'customer' | 'companion' | 'user';

export interface AuthenticatedAccount {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: AccountRole;
  adminRole?: AdminRole;
  avatarUrl?: string;
  city?: string;
  status?: string;
  feePaid?: boolean;
  aadhaarImage?: string;
  selfieImage?: string;
  profilePhoto?: string;
  mustChangePassword?: boolean;
  temporaryPassword?: boolean;
  passwordExpiresAt?: string | null;
}

export interface UnifiedAuthResult {
  success: boolean;
  errorMessage?: string;
  account?: AuthenticatedAccount;
  token?: string;
  mustChangePassword?: boolean;
  temporaryPassword?: boolean;
  passwordExpired?: boolean;
}

/**
 * Universal backend/authentication layer.
 * Validates Master Admin credentials and registered users strictly via central server-side API endpoint (/api/auth/login).
 * NO LOCALSTORAGE OR MOCK FALLBACKS ARE PERMITTED IN PRODUCTION.
 */
export const authenticateCredentials = async (
  rawIdentifier: string,
  rawPassword: string
): Promise<UnifiedAuthResult> => {
  const cleanId = (rawIdentifier || '').trim();
  const cleanPass = (rawPassword || '').trim();

  if (!cleanId || !cleanPass) {
    return {
      success: false,
      errorMessage: 'Invalid User ID or Password.',
    };
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        identifier: cleanId,
        password: cleanPass,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data && data.success && data.account) {
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('navratri_admin_token', data.token);
      }
      return {
        success: true,
        account: data.account,
        token: data.token,
        mustChangePassword: Boolean(data.account.mustChangePassword),
        temporaryPassword: Boolean(data.account.temporaryPassword),
      };
    }

    if (data && data.passwordExpired) {
      return {
        success: false,
        passwordExpired: true,
        errorMessage: data.errorMessage || 'Your temporary password has expired. Please contact Super Admin to generate a new password.',
      };
    }

    // Specific status messages from backend (e.g. pending approval, payment rejected, suspended, invalid password)
    if (data && data.errorMessage) {
      return {
        success: false,
        errorMessage: data.errorMessage,
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        errorMessage: 'Invalid User ID or Password.',
      };
    }

    return {
      success: false,
      errorMessage: 'Authentication service is temporarily unavailable. Please try again.',
    };
  } catch (apiError) {
    console.error('Login network error:', apiError);
    return {
      success: false,
      errorMessage: 'Authentication service is temporarily unavailable. Please try again.',
    };
  }
};

/**
 * Creates isolated session for the authenticated account role.
 */
export const createSessionForAccount = (account: AuthenticatedAccount, token?: string) => {
  if (typeof window === 'undefined') return;

  if (account.role === 'owner' || account.role === 'admin') {
    // Admin Session
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('navratri_super_admin_auth', 'true');
    localStorage.setItem('navratri_super_admin_user', JSON.stringify(account));
    if (token) {
      localStorage.setItem('navratri_admin_token', token);
    }

    // Clear normal user session to isolate permissions
    localStorage.removeItem('navratri_is_logged_in');
    localStorage.removeItem('navratri_companion_profile');
    localStorage.removeItem('navratri_user_role');
  } else {
    // Customer or Companion Session
    const userRole = account.role === 'companion' ? 'companion' : 'user';
    localStorage.setItem('navratri_is_logged_in', 'true');
    localStorage.setItem('navratri_user_role', userRole);
    localStorage.setItem('navratri_current_user_profile', JSON.stringify(account));

    // CRITICAL SECURITY: Normal user must never receive Admin permissions
    localStorage.removeItem('adminSession');
    localStorage.removeItem('navratri_super_admin_auth');
    localStorage.removeItem('navratri_super_admin_user');
    localStorage.removeItem('navratri_admin_token');
  }
};

/**
 * Completely clears all sessions upon logout
 */
export const clearAllSessions = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminSession');
  localStorage.removeItem('navratri_super_admin_auth');
  localStorage.removeItem('navratri_super_admin_user');
  localStorage.removeItem('navratri_admin_token');
  localStorage.removeItem('navratri_is_logged_in');
  localStorage.removeItem('navratri_companion_profile');
  localStorage.removeItem('navratri_user_role');
  localStorage.removeItem('navratri_current_user_profile');
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  // Also call backend logout to clear cookie
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
};

/**
 * Verifies session token with server endpoint
 */
export const verifyAdminSessionOnServer = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('navratri_admin_token');

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data && data.valid === true);
    }
    return false;
  } catch (e) {
    return false;
  }
};
