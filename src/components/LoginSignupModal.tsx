import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DynamicUpiQr } from './DynamicUpiQr';
import { getPlatformUpiConfig, generatePaymentReference } from '../utils/upi';
import { useSuperAdmin } from '../super-admin/context/SuperAdminContext';
import {
  registerUserInDb,
  submitRegistrationPaymentToDb,
  fetchFeeConfigurations,
  createPaymentOrderInDb,
  verifyPaymentInDb,
  changeUserPassword,
  FeeConfiguration,
} from '../services/dbService';
import { PhotoUpload } from './PhotoUpload';

// Helper to calculate age from Date of Birth
const calculateAge = (dobString: string): number | null => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export interface PolicyConsentRecord {
  termsVersion: string;
  privacyVersion: string;
  safetyVersion: string;
  communityVersion: string;
  consentedAt: string;
  status: 'consented';
}

export interface RegisteredUserAccount {
  name: string;
  phone: string;
  email: string;
  userId: string;
  password: string;
  city?: string;
  aadhaarImage?: string;
  selfieImage?: string;
  feePaid?: boolean;
  status?: 'pending_payment' | 'pending_admin_confirm' | 'active' | 'payment_rejected';
  paymentReference?: string;
  paymentSubmittedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  role?: 'customer' | 'companion' | 'user' | 'admin' | 'owner';
  policyConsent?: PolicyConsentRecord;
}

const DEFAULT_ACCOUNTS: RegisteredUserAccount[] = [];

export const getRegisteredAccounts = (): RegisteredUserAccount[] => {
  try {
    const data = localStorage.getItem('navratri_registered_users');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading registered accounts:', e);
  }
  return DEFAULT_ACCOUNTS;
};

export const saveRegisteredAccounts = (accounts: RegisteredUserAccount[]) => {
  try {
    localStorage.setItem('navratri_registered_users', JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving registered accounts:', e);
  }
};

interface LoginSignupModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (
    name: string,
    phone: string,
    email: string,
    aadhaarImg?: string,
    selfieImg?: string,
    feePaid?: boolean,
    userId?: string,
    role?: 'user' | 'companion' | 'admin' | 'owner'
  ) => void;
  onAdminLoginSuccess?: () => void;
  onOpenLegalPolicy?: (policyId: 'terms' | 'privacy' | 'safety' | 'cancellation' | 'community' | 'grievance') => void;
}

export const LoginSignupModal: React.FC<LoginSignupModalProps> = ({
  mode: initialMode,
  onClose,
  onSuccess,
  onAdminLoginSuccess,
  onOpenLegalPolicy,
}) => {
  // Mode state: 'login' | 'signup' | 'reg_payment' | 'change_password'
  const [mode, setMode] = useState<'login' | 'signup' | 'reg_payment' | 'change_password'>(initialMode);
  const [pendingAccount, setPendingAccount] = useState<RegisteredUserAccount | null>(null);
  const [pendingChangePasswordAccount, setPendingChangePasswordAccount] = useState<{
    account: any;
    token?: string;
    currentPassword: string;
  } | null>(null);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Legal Consent Checkboxes (Explicitly Unchecked by Default)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeGuidelines, setAgreeGuidelines] = useState(false);

  // Login form state - Strictly initialized to empty string
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state - Strictly initialized to empty string
  const [signupRole, setSignupRole] = useState<'customer' | 'companion'>('customer');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUserId, setSignupUserId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mandatory Profile Photo
  const [signupProfilePhoto, setSignupProfilePhoto] = useState<string | null>(null);

  // Age & Date of Birth (min 18 years)
  const [signupDob, setSignupDob] = useState('');
  const [signupAge, setSignupAge] = useState('');

  // Companion Specific Mandatory Fields
  const [signupBio, setSignupBio] = useState('');
  const [signupLanguages, setSignupLanguages] = useState('Gujarati, Hindi, English');
  const [signupGarbaStyle, setSignupGarbaStyle] = useState('Traditional 2-Taali & 3-Taali');
  const [signupCities, setSignupCities] = useState('Ahmedabad');
  const [signupHourlyRate, setSignupHourlyRate] = useState('1200');
  const [signupAadhaarImage, setSignupAadhaarImage] = useState<string | null>(null);
  const [signupSelfieImage, setSignupSelfieImage] = useState<string | null>(null);
  const [signupIdDocument, setSignupIdDocument] = useState('');

  // Status & feedback state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Fee Configuration & Order Tracking State
  const [feeConfigs, setFeeConfigs] = useState<{
    companionFee: number;
    customerFee: number;
    fees: FeeConfiguration[];
  }>({
    companionFee: 499,
    customerFee: 0,
    fees: [],
  });
  const [orderDetails, setOrderDetails] = useState<{
    orderId?: string;
    amount?: number;
    baseAmount?: number;
    gstAmount?: number;
    currency?: string;
    keyId?: string;
  } | null>(null);
  const [enteredTxnId, setEnteredTxnId] = useState('');

  // Fetch active fee structures dynamically
  useEffect(() => {
    fetchFeeConfigurations().then((res) => {
      if (res && res.success) {
        setFeeConfigs({
          companionFee: res.companionRegistrationFee ?? 499,
          customerFee: res.customerRegistrationFee ?? 0,
          fees: res.fees || [],
        });
      }
    });
  }, []);

  // Reset all fields whenever the modal opens or initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setLoginIdentifier('');
    setLoginPassword('');
    setSignupRole('customer');
    setSignupName('');
    setSignupPhone('');
    setSignupEmail('');
    setSignupUserId('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupProfilePhoto(null);
    setSignupDob('');
    setSignupAge('');
    setSignupBio('');
    setSignupLanguages('Gujarati, Hindi, English');
    setSignupGarbaStyle('Traditional 2-Taali & 3-Taali');
    setSignupCities('Ahmedabad');
    setSignupHourlyRate('1200');
    setSignupAadhaarImage(null);
    setSignupSelfieImage(null);
    setSignupIdDocument('');
    setErrorMessage(null);
    setSuccessBanner(null);
    setPendingAccount(null);
    setOrderDetails(null);
    setEnteredTxnId('');
    setAgreeTerms(false);
    setAgreePrivacy(false);
    setAgreeGuidelines(false);
  }, [initialMode]);

  // Clear messages and fields when switching modes
  const handleSwitchToSignup = () => {
    setErrorMessage(null);
    setSuccessBanner(null);
    setSignupRole('customer');
    setSignupName('');
    setSignupPhone('');
    setSignupEmail('');
    setSignupUserId('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupProfilePhoto(null);
    setSignupDob('');
    setSignupAge('');
    setSignupBio('');
    setSignupLanguages('Gujarati, Hindi, English');
    setSignupGarbaStyle('Traditional 2-Taali & 3-Taali');
    setSignupCities('Ahmedabad');
    setSignupHourlyRate('1200');
    setSignupAadhaarImage(null);
    setSignupSelfieImage(null);
    setSignupIdDocument('');
    setAgreeTerms(false);
    setAgreePrivacy(false);
    setAgreeGuidelines(false);
    setMode('signup');
  };

  const handleSwitchToLogin = () => {
    setErrorMessage(null);
    setSuccessBanner(null);
    setLoginIdentifier('');
    setLoginPassword('');
    setMode('login');
  };

  // Unified Login Submission with Automatic Account Type Detection
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Invalid User ID or Password.');
      return;
    }

    setLoading(true);

    try {
      const result = await authenticateCredentials(cleanIdentifier, cleanPassword);
      setLoading(false);

      if (!result.success || !result.account) {
        setErrorMessage(result.errorMessage || 'Invalid User ID or Password.');
        return;
      }

      // Check if user is required to change their temporary password
      if (result.mustChangePassword || result.account.mustChangePassword) {
        setPendingChangePasswordAccount({
          account: result.account,
          token: result.token,
          currentPassword: cleanPassword,
        });
        setChangeCurrentPassword(cleanPassword);
        setChangeNewPassword('');
        setChangeConfirmPassword('');
        setMode('change_password');
        return;
      }

      // Check account role and create isolated session
      if (result.account.role === 'owner' || result.account.role === 'admin') {
        createSessionForAccount(result.account, result.token);
        adminLogin(cleanIdentifier, cleanPassword);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        } else {
          window.location.href = '/super-admin';
        }
        return;
      }

      // Customer or Companion Account
      createSessionForAccount(result.account);
      onSuccess(
        result.account.name,
        result.account.phone,
        result.account.email,
        result.account.aadhaarImage,
        result.account.selfieImage,
        result.account.feePaid ?? true,
        result.account.userId,
        result.account.role === 'customer' ? 'user' : result.account.role
      );
    } catch (err) {
      setLoading(false);
      setErrorMessage('Invalid User ID or Password.');
    }
  };

  // Handle Password Change Submission (Forces strong password requirements)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pendingChangePasswordAccount) {
      setErrorMessage('Session expired. Please log in again.');
      setMode('login');
      return;
    }

    const currentPass = (changeCurrentPassword || pendingChangePasswordAccount.currentPassword).trim();
    const newPass = changeNewPassword.trim();
    const confirmPass = changeConfirmPassword.trim();

    if (!currentPass || !newPass || !confirmPass) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }

    if (newPass.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPass)) {
      setErrorMessage('New password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(newPass)) {
      setErrorMessage('New password must contain at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9]/.test(newPass)) {
      setErrorMessage('New password must contain at least one number (0-9).');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPass)) {
      setErrorMessage('New password must contain at least one special character (!@#$%^&* etc.).');
      return;
    }
    if (newPass === currentPass) {
      setErrorMessage('New password cannot be the same as your temporary password.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await changeUserPassword({
        userId: pendingChangePasswordAccount.account.userId || pendingChangePasswordAccount.account.id,
        currentPassword: currentPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });

      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.errorMessage || 'Failed to update password.');
        return;
      }

      // Password successfully changed! Proceed with login
      const updatedAccount = {
        ...pendingChangePasswordAccount.account,
        mustChangePassword: false,
        temporaryPassword: false,
      };

      if (updatedAccount.role === 'owner' || updatedAccount.role === 'admin') {
        createSessionForAccount(updatedAccount, pendingChangePasswordAccount.token);
        adminLogin(updatedAccount.userId, newPass);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        } else {
          window.location.href = '/super-admin';
        }
        return;
      }

      createSessionForAccount(updatedAccount);
      onSuccess(
        updatedAccount.name,
        updatedAccount.phone,
        updatedAccount.email,
        updatedAccount.aadhaarImage,
        updatedAccount.selfieImage,
        updatedAccount.feePaid ?? true,
        updatedAccount.userId,
        updatedAccount.role === 'customer' ? 'user' : updatedAccount.role
      );
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Error updating password. Please try again.');
    }
  };

  // Handle Sign Up Submission -> Proceeds to ₹499 Registration Fee Payment
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const name = signupName.trim();
    const phone = signupPhone.trim();
    const email = signupEmail.trim();
    const userId = signupUserId.trim();
    const password = signupPassword.trim();
    const confirmPassword = signupConfirmPassword.trim();

    // Validation
    if (!name || !phone || !email || !userId || !password || !confirmPassword) {
      setErrorMessage('All fields are required. Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    if (userId.length < 3) {
      setErrorMessage('User ID must be at least 3 characters long.');
      return;
    }

    // 1. Mandatory Profile Photo Check
    if (!signupProfilePhoto) {
      setErrorMessage('Please upload your profile photo to continue.');
      return;
    }

    // 2. Age / Date of Birth Verification (Minimum 18 years old, strictly derived from DOB)
    if (!signupDob) {
      setErrorMessage('Date of Birth is required to verify age (must be at least 18 years old).');
      return;
    }
    const verifiedAge = calculateAge(signupDob);
    if (verifiedAge === null || isNaN(verifiedAge)) {
      setErrorMessage('Please enter a valid Date of Birth.');
      return;
    }

    if (verifiedAge < 18) {
      setErrorMessage('You must be at least 18 years old to register.');
      return;
    }

    // 3. Companion Specific Requirements
    if (signupRole === 'companion') {
      if (!signupAadhaarImage) {
        setErrorMessage('Government ID document upload is required for companions.');
        return;
      }
      if (!signupSelfieImage) {
        setErrorMessage('Live Selfie with ID is required for face verification.');
        return;
      }
      if (!signupBio || signupBio.trim().length < 10) {
        setErrorMessage('Bio / About Me must be at least 10 characters long.');
        return;
      }
      const rateNum = Number(signupHourlyRate);
      if (!rateNum || rateNum <= 0) {
        setErrorMessage('Hourly/Session Rate is required for companion registration.');
        return;
      }
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms & Conditions to create an account.');
      return;
    }

    if (!agreePrivacy) {
      setErrorMessage('You must confirm that you have read the Privacy Policy to create an account.');
      return;
    }

    if (!agreeGuidelines) {
      setErrorMessage('You must agree to follow the Community Guidelines & Safety Rules to create an account.');
      return;
    }

    setLoading(true);

    try {
      const policyConsent = {
        termsVersion: 'v1.2.0',
        privacyVersion: 'v1.2.0',
        safetyVersion: 'v1.2.0',
        communityVersion: 'v1.2.0',
        consentedAt: new Date().toISOString(),
        status: 'consented' as const,
      };

      const newAccount: RegisteredUserAccount = {
        name,
        phone,
        email,
        userId,
        password,
        role: signupRole,
        city: 'Ahmedabad, Gujarat',
        feePaid: false,
        status: 'pending_payment',
        policyConsent,
        aadhaarImage: signupAadhaarImage || undefined,
        selfieImage: signupSelfieImage || undefined,
      };

      // 1. Register in Central Persistent Database
      const regResult = await registerUserInDb({
        name,
        phone,
        email,
        userId,
        password,
        city: 'Ahmedabad, Gujarat',
        role: signupRole,
        profilePhoto: signupProfilePhoto,
        dateOfBirth: signupDob || undefined,
        age: verifiedAge,
        bio: signupRole === 'companion' ? signupBio : undefined,
        languages: signupRole === 'companion' ? signupLanguages : undefined,
        garbaStyle: signupRole === 'companion' ? signupGarbaStyle : undefined,
        availableCities: signupRole === 'companion' ? signupCities : undefined,
        hourlyRate: signupRole === 'companion' ? Number(signupHourlyRate) : undefined,
        idDocument: signupRole === 'companion' ? signupIdDocument : undefined,
        policyConsent,
        aadhaarImage: signupAadhaarImage || undefined,
        selfieImage: signupSelfieImage || undefined,
      });

      if (!regResult.success) {
        setLoading(false);
        setErrorMessage(regResult.errorMessage || 'Unable to save your registration in the central database. Please try again.');
        return;
      }

      // If customer has 0 registration fee, complete signup immediately!
      if (signupRole === 'customer' && (feeConfigs.customerFee <= 0)) {
        setLoading(false);
        setMode('login');
        setSuccessBanner('Account created successfully! Please enter your password to login.');
        setLoginIdentifier(userId);
        setLoginPassword('');
        setPendingAccount(null);
        // Reset signup form
        setSignupName('');
        setSignupPhone('');
        setSignupEmail('');
        setSignupUserId('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupProfilePhoto(null);
        setSignupDob('');
        setSignupAge('');
        setSignupBio('');
        setSignupAadhaarImage(null);
        setSignupSelfieImage(null);
        setSignupIdDocument('');
        return;
      }

      // Role requires registration fee (e.g. Companion ₹499 or dynamic fee)
      const feeCode = signupRole === 'companion' ? 'COMPANION_REGISTRATION' : 'CUSTOMER_REGISTRATION';
      const orderRes = await createPaymentOrderInDb(userId, feeCode, 'UPI');
      if (orderRes && orderRes.success) {
        setOrderDetails({
          orderId: orderRes.orderId,
          amount: orderRes.amount,
          baseAmount: orderRes.baseAmount,
          gstAmount: orderRes.gstAmount,
          currency: orderRes.currency,
          keyId: orderRes.keyId,
        });
      }

      setLoading(false);
      setPendingAccount(newAccount);
      setMode('reg_payment');

      // Reset signup form
      setSignupName('');
      setSignupPhone('');
      setSignupEmail('');
      setSignupUserId('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupProfilePhoto(null);
      setSignupDob('');
      setSignupAge('');
      setSignupBio('');
      setSignupAadhaarImage(null);
      setSignupSelfieImage(null);
      setSignupIdDocument('');
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Registration failed. Please check your connection.');
    }
  };

  // Handle Registration Fee Payment Submission -> Submits Transaction ID for Super Admin verification
  const handleRegPaymentConfirm = async () => {
    if (!pendingAccount) return;

    // Strict Validation on submit
    const cleanTxnId = (enteredTxnId || '').trim();
    if (!cleanTxnId || cleanTxnId.length < 6 || /[<>{}]/.test(cleanTxnId)) {
      setErrorMessage('Please enter a valid Transaction ID / UTR number from your payment app.');
      return;
    }

    const paymentRef =
      orderDetails?.orderId ||
      pendingAccount.paymentReference ||
      generatePaymentReference(pendingAccount.userId, 'REG');

    // Prevent submitting the system payment reference as the bank UTR
    if (cleanTxnId.toLowerCase() === paymentRef.toLowerCase()) {
      setErrorMessage(
        'Please enter the actual UPI transaction ID / UTR number from your payment app, not the system payment reference.'
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const finalAmount =
      orderDetails?.amount ??
      (pendingAccount.role === 'companion' ? feeConfigs.companionFee : feeConfigs.customerFee) ??
      499;
    const feeCode =
      pendingAccount.role === 'companion' ? 'COMPANION_REGISTRATION' : 'CUSTOMER_REGISTRATION';

    try {
      const submitRes = await submitRegistrationPaymentToDb(
        pendingAccount.userId,
        paymentRef,
        cleanTxnId,
        finalAmount,
        'UPI',
        pendingAccount.role,
        feeCode
      );

      setLoading(false);

      if (!submitRes.success) {
        if (
          submitRes.errorMessage &&
          (submitRes.errorMessage.toLowerCase().includes('already used') ||
            submitRes.errorMessage.toLowerCase().includes('already submitted'))
        ) {
          setErrorMessage(
            'This Transaction ID has already been submitted. Please check and enter the correct ID.'
          );
        } else {
          setErrorMessage(
            submitRes.errorMessage || 'Failed to submit payment reference. Please try again.'
          );
        }
        return;
      }

      // Success: Switched to login mode with message explaining Super Admin review
      setMode('login');
      setLoginIdentifier(pendingAccount.userId);
      setLoginPassword('');
      setSuccessBanner(
        `Payment submitted (Transaction ID: ${cleanTxnId}). Super Admin verification is required. Your account will be activated once approved.`
      );
      setPendingAccount(null);
      setOrderDetails(null);
      setEnteredTxnId('');
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Failed to submit payment reference. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/30 flex flex-col my-auto max-h-[94vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff] shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base sm:text-lg text-[#12001f] truncate">
              {mode === 'login' && 'Login'}
              {mode === 'signup' && 'Sign Up'}
              {mode === 'reg_payment' && `Pay ₹${orderDetails?.amount ?? (pendingAccount?.role === 'companion' ? feeConfigs.companionFee : feeConfigs.customerFee) ?? 499} Registration Fee`}
              {mode === 'change_password' && 'Create New Password'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#596579] truncate">
              {mode === 'login' && 'Enter your User ID or Email and Password'}
              {mode === 'signup' && 'Create your User ID and Password to get started'}
              {mode === 'reg_payment' && 'Official UPI Gateway • Complete payment to activate account'}
              {mode === 'change_password' && 'Update your temporary password to continue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-full hover:bg-[#dee9fc] flex items-center justify-center text-[#12001f] transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 text-[#12001f] overflow-y-auto overflow-x-hidden space-y-3.5 flex-1">
          {/* Success Banner */}
          {successBanner && mode === 'login' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{successBanner}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Sign Up completed. Now enter your password and click Login to proceed to Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="break-words font-medium">{errorMessage}</span>
              </div>
              {mode === 'login' &&
                (errorMessage.toLowerCase().includes('rejected') ||
                  errorMessage.toLowerCase().includes('pending')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = loginIdentifier.trim();
                      if (!id) return;
                      setPendingAccount({
                        name: id,
                        phone: '',
                        email: '',
                        userId: id,
                        password: loginPassword,
                        role: 'companion',
                        city: 'Ahmedabad',
                      });
                      setMode('reg_payment');
                      setErrorMessage(null);
                    }}
                    className="mt-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Re-enter / Submit Payment Transaction ID</span>
                  </button>
                )}
            </div>
          )}

          {/* ======================= LOGIN FORM ======================= */}
          {mode === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Field 1: User ID / Email */}
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1.5">
                    User ID / Email
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="username"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Enter your User ID or Email"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042] transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#12001f]">
                      Password
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Enter your password"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-[#596579] hover:text-[#12001f] cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[46px] bg-[#311042] text-white py-3 rounded-xl font-bold hover:bg-[#9b4500] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer text-sm"
                >
                  <span>{loading ? 'Logging in...' : 'Login'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Sign Up Option Below Login Form */}
                <div className="pt-2 text-center text-xs text-[#596579]">
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={handleSwitchToSignup}
                    className="text-[#9b4500] font-bold hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================= SIGN UP FORM ======================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} autoComplete="off" className="space-y-3.5">
              {/* Role Selection: How do you want to use Navratri Companion? */}
              <div>
                <label className="text-xs font-bold text-[#12001f] block mb-1.5">
                  How do you want to use Navratri Companion?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSignupRole('customer')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      signupRole === 'customer'
                        ? 'bg-[#311042]/5 border-[#311042] ring-2 ring-[#311042]/20 shadow-xs'
                        : 'bg-slate-50 border-[#cec3ce]/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#12001f]">I want to book a companion</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        signupRole === 'customer' ? 'border-[#311042] bg-[#311042]' : 'border-slate-400 bg-white'
                      }`}>
                        {signupRole === 'customer' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#9b4500]">CUSTOMER</span>
                    <p className="text-[10px] text-[#596579] leading-tight mt-0.5">
                      Find verified local companions for Garba festivals &amp; events
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('companion')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      signupRole === 'companion'
                        ? 'bg-[#311042]/5 border-[#311042] ring-2 ring-[#311042]/20 shadow-xs'
                        : 'bg-slate-50 border-[#cec3ce]/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#12001f]">I want to become a companion</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        signupRole === 'companion' ? 'border-[#311042] bg-[#311042]' : 'border-slate-400 bg-white'
                      }`}>
                        {signupRole === 'companion' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#9b4500]">COMPANION</span>
                    <p className="text-[10px] text-[#596579] leading-tight mt-0.5">
                      Create host profile, guide visitors &amp; receive paid bookings
                    </p>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-[#12001f] block mb-1">
                  Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                  />
                </div>
              </div>

              {/* Mobile Number & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      name="tel"
                      required
                      autoComplete="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 98765 12345"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                  </div>
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="text-xs font-semibold text-[#12001f] block mb-1">
                  User ID
                </label>
                <div className="relative flex items-center">
                  <span className="text-xs font-bold text-[#596579] absolute left-3.5 pointer-events-none">@</span>
                  <input
                    type="text"
                    name="signup_username"
                    required
                    autoComplete="off"
                    value={signupUserId}
                    onChange={(e) => setSignupUserId(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="Enter your User ID"
                    className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-8 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                  />
                </div>
                <span className="text-[10px] text-[#596579] block mt-0.5">
                  You will use this User ID to log in.
                </span>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      name="signup_password"
                      required
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-[#596579] hover:text-[#12001f] cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="signup_confirm_password"
                      required
                      autoComplete="new-password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-[#596579] hover:text-[#12001f] cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mandatory Personal Profile Photo */}
              <div className="pt-1">
                <PhotoUpload
                  label="Personal Profile Photo"
                  required
                  value={signupProfilePhoto}
                  onChange={(url) => {
                    setSignupProfilePhoto(url);
                    setErrorMessage(null);
                  }}
                  helperText="Required: Upload clear personal photo"
                />
              </div>

              {/* Age Verification: Date of Birth & Age (minimum 18 years) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Date of Birth <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={signupDob}
                    onChange={(e) => {
                      const dob = e.target.value;
                      setSignupDob(dob);
                      setErrorMessage(null);
                      const calculated = calculateAge(dob);
                      if (calculated !== null) {
                        setSignupAge(String(calculated));
                        if (calculated < 18) {
                          setErrorMessage('You must be at least 18 years old to register.');
                        }
                      }
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Calculated Age (Min 18) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={signupAge ? `${signupAge} years old` : ''}
                    placeholder="Derived from Date of Birth"
                    className="w-full min-h-[44px] text-sm bg-slate-100 border border-[#cec3ce]/60 px-3 py-2.5 rounded-xl cursor-not-allowed text-slate-700 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* If COMPANION: Companion Specific Mandatory Fields */}
              {signupRole === 'companion' && (
                <div className="p-3.5 bg-[#311042]/5 border border-[#311042]/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#311042]/10 pb-2">
                    <span className="text-xs font-bold text-[#311042] uppercase tracking-wider">
                      Companion Host Verification &amp; Profile Details
                    </span>
                    <span className="text-[10px] text-[#9b4500] font-bold">Mandatory</span>
                  </div>

                  {/* Bio / About Me */}
                  <div>
                    <label className="text-xs font-semibold text-[#12001f] block mb-1">
                      Bio / About Me <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={signupBio}
                      onChange={(e) => setSignupBio(e.target.value)}
                      placeholder="Share your Garba experience, passion, and how you will guide visitors..."
                      className="w-full text-sm bg-white border border-[#cec3ce]/60 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                  </div>

                  {/* Dance Style & Base Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-[#12001f] block mb-1">
                        Garba Dance Style <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        value={signupGarbaStyle}
                        onChange={(e) => setSignupGarbaStyle(e.target.value)}
                        className="w-full text-sm bg-white border border-[#cec3ce]/60 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                      >
                        <option>Traditional 2-Taali &amp; 3-Taali</option>
                        <option>Dodhiyo &amp; Teen Taal Expert</option>
                        <option>High Speed Sanedo &amp; Folk Steps</option>
                        <option>Beginner Friendly &amp; Patient Guide</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#12001f] block mb-1">
                        Base Rate (₹/session) <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        min="500"
                        step="100"
                        required
                        value={signupHourlyRate}
                        onChange={(e) => setSignupHourlyRate(e.target.value)}
                        placeholder="e.g. 1200"
                        className="w-full min-h-[44px] text-sm bg-white border border-[#cec3ce]/60 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                      />
                    </div>
                  </div>

                  {/* Languages & Cities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-[#12001f] block mb-1">
                        Languages Known <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={signupLanguages}
                        onChange={(e) => setSignupLanguages(e.target.value)}
                        placeholder="Gujarati, Hindi, English"
                        className="w-full min-h-[44px] text-sm bg-white border border-[#cec3ce]/60 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#12001f] block mb-1">
                        Available Cities / Venues <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={signupCities}
                        onChange={(e) => setSignupCities(e.target.value)}
                        placeholder="Ahmedabad (Bodakdev, SBR)"
                        className="w-full min-h-[44px] text-sm bg-white border border-[#cec3ce]/60 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                      />
                    </div>
                  </div>

                  {/* Government ID Document Upload */}
                  <div>
                    <PhotoUpload
                      label="Government ID / Age Proof Document (Aadhaar / Passport / Voter ID)"
                      required
                      aspectRatio="rect"
                      value={signupAadhaarImage}
                      onChange={(url) => {
                        setSignupAadhaarImage(url);
                        setErrorMessage(null);
                      }}
                      helperText="Front/Back ID Document"
                    />
                  </div>

                  {/* Live Selfie with ID for Face Verification */}
                  <div>
                    <PhotoUpload
                      label="Live Selfie with ID (for Identity Verification)"
                      required
                      aspectRatio="square"
                      value={signupSelfieImage}
                      onChange={(url) => {
                        setSignupSelfieImage(url);
                        setErrorMessage(null);
                      }}
                      helperText="Clear selfie holding your ID"
                    />
                  </div>
                </div>
              )}

              {/* Mandatory Legal & Policy Consent Checkboxes */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-[#cec3ce]/40 space-y-2.5 text-xs">
                <div className="font-bold text-[#12001f] text-[11px] uppercase tracking-wider text-slate-500">
                  Legal &amp; Policy Acceptance (Required)
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-[#12001f]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 min-w-[16px] accent-[#311042] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] leading-tight text-[#596579] break-words">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenLegalPolicy) onOpenLegalPolicy('terms');
                      }}
                      className="text-[#9b4500] font-bold underline hover:text-[#311042]"
                    >
                      Terms &amp; Conditions
                    </button>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-[#12001f]">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 min-w-[16px] accent-[#311042] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] leading-tight text-[#596579] break-words">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenLegalPolicy) onOpenLegalPolicy('privacy');
                      }}
                      className="text-[#9b4500] font-bold underline hover:text-[#311042]"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-[#12001f]">
                  <input
                    type="checkbox"
                    checked={agreeGuidelines}
                    onChange={(e) => setAgreeGuidelines(e.target.checked)}
                    className="mt-0.5 w-4 h-4 min-w-[16px] accent-[#311042] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] leading-tight text-[#596579] break-words">
                    I agree to strictly abide by the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenLegalPolicy) onOpenLegalPolicy('safety');
                      }}
                      className="text-[#9b4500] font-bold underline hover:text-[#311042]"
                    >
                      Safety Guidelines
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenLegalPolicy) onOpenLegalPolicy('community');
                      }}
                      className="text-[#9b4500] font-bold underline hover:text-[#311042]"
                    >
                      Community Standards
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Registration -> Proceeds to Payment */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] bg-[#311042] text-white py-3 rounded-xl font-bold hover:bg-[#9b4500] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer text-sm"
              >
                <span>
                  {loading
                    ? 'Creating Account...'
                    : signupRole === 'customer' && feeConfigs.customerFee <= 0
                    ? 'Complete Registration (Free)'
                    : `Continue to Registration Fee (₹${signupRole === 'companion' ? feeConfigs.companionFee : feeConfigs.customerFee})`}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Switch to Login */}
              <div className="pt-2 text-center text-xs text-[#596579]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="text-[#9b4500] font-bold hover:underline cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>
          )}

          {/* ======================= REGISTRATION FEE PAYMENT STEP ======================= */}
          {mode === 'reg_payment' && pendingAccount && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {pendingAccount.role === 'companion'
                      ? 'Companion Verification & Registration Fee'
                      : 'Platform Registration Fee'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-amber-950 space-y-1 bg-white/60 p-2.5 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Base Registration Fee:</span>
                    <span className="font-semibold">₹{orderDetails?.baseAmount ?? (pendingAccount.role === 'companion' ? feeConfigs.companionFee : feeConfigs.customerFee)}</span>
                  </div>
                  {(orderDetails?.gstAmount ?? 0) > 0 && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-600">Applicable GST:</span>
                      <span className="font-semibold">₹{orderDetails?.gstAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-amber-200 font-bold text-xs text-[#311042]">
                    <span>Total Amount Payable:</span>
                    <span className="text-sm text-[#9b4500]">₹{orderDetails?.amount ?? (pendingAccount.role === 'companion' ? feeConfigs.companionFee : feeConfigs.customerFee)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono pt-0.5 truncate">
                    Payment Reference: {orderDetails?.orderId || pendingAccount.paymentReference || 'REG-PAY'}
                  </div>
                </div>
              </div>

              {/* Dynamic UPI QR Container (Includes single Official UPI ID and copyable payment reference) */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-[#cec3ce]/40 rounded-2xl text-center">
                <DynamicUpiQr
                  upiId={getPlatformUpiConfig().upiId}
                  payeeName={getPlatformUpiConfig().payeeName || 'Navratri Companion'}
                  amount={orderDetails?.amount ?? (pendingAccount.role === 'companion' ? feeConfigs.companionFee : 499)}
                  paymentReference={orderDetails?.orderId || pendingAccount.paymentReference || 'REG-PAY'}
                  purposeLabel={`${pendingAccount.role === 'companion' ? 'Companion' : 'User'} Registration Fee`}
                />
              </div>

              {/* 🔐 TRANSACTION ID / UTR FIELD directly above "I Have Completed Payment" */}
              <div className="p-4 bg-[#fbf9fe] border-2 border-[#9b4500]/30 rounded-2xl space-y-2 text-left shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#311042] uppercase tracking-wide">
                  <span role="img" aria-label="lock">🔐</span>
                  <span>TRANSACTION ID / UTR</span>
                  <span className="text-rose-500 text-xs font-normal ml-0.5">*Required</span>
                </div>
                <p className="text-[11px] text-[#596579] leading-snug">
                  Enter the UPI transaction ID / UTR number from your payment app after completing the payment.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={64}
                    value={enteredTxnId}
                    onChange={(e) => {
                      setEnteredTxnId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter Transaction ID / UTR"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#cec3ce] rounded-xl text-xs font-mono font-medium text-[#12001f] placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9b4500] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Example: 427819364829 or UPI Ref ID</span>
                  <span>{enteredTxnId.trim().length}/64</span>
                </div>
              </div>

              {/* Payment Confirmation Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleRegPaymentConfirm}
                  disabled={loading || !enteredTxnId.trim()}
                  className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Submitting Payment...' : 'I Have Completed Payment'}</span>
                </button>

                <p className="text-[11px] text-center text-[#596579] leading-relaxed">
                  After submission, your Transaction ID / UTR will be verified by Super Admin before account activation.
                </p>
              </div>
            </div>
          )}

          {/* ======================= CHANGE TEMPORARY PASSWORD FORM ======================= */}
          {mode === 'change_password' && pendingChangePasswordAccount && (
            <div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Temporary Password Login Detected</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    For your security, you must set a new permanent password to access your account (@{pendingChangePasswordAccount.account.userId || pendingChangePasswordAccount.account.id}).
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                {/* Current Temporary Password */}
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Current Temporary Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={changeCurrentPassword || pendingChangePasswordAccount.currentPassword}
                      onChange={(e) => {
                        setChangeCurrentPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Temporary password from admin"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 text-[#596579] hover:text-[#12001f] p-1 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    New Permanent Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={changeNewPassword}
                      onChange={(e) => {
                        setChangeNewPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Enter strong new password"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-[#596579] hover:text-[#12001f] p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-xs font-semibold text-[#12001f] block mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#596579] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      value={changeConfirmPassword}
                      onChange={(e) => {
                        setChangeConfirmPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Re-enter new password"
                      className="w-full min-h-[44px] text-sm bg-slate-50 border border-[#cec3ce]/60 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#311042]/20 focus:border-[#311042]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 text-[#596579] hover:text-[#12001f] p-1 cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="p-3 bg-slate-50 border border-[#cec3ce]/40 rounded-xl space-y-1.5 text-[11px]">
                  <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className={`flex items-center gap-1.5 ${changeNewPassword.length >= 8 ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${changeNewPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(changeNewPassword) ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(changeNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(changeNewPassword) ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[a-z]/.test(changeNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[0-9]/.test(changeNewPassword) ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(changeNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(changeNewPassword) ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(changeNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>1 special symbol</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${changeNewPassword && changeNewPassword === changeConfirmPassword ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${changeNewPassword && changeNewPassword === changeConfirmPassword ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[46px] bg-[#311042] hover:bg-[#481661] text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#311042]/20 disabled:opacity-60 cursor-pointer text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Save Password & Enter Account'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingChangePasswordAccount(null);
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#596579] hover:text-[#12001f] underline cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
