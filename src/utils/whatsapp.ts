/**
 * WhatsApp Support Utility for Navratri Companion Platform
 * Centralized, secure WhatsApp link generator and configuration manager.
 * 
 * Rules:
 * - DO NOT hardcode WhatsApp numbers across components.
 * - Store and fetch from centralized system settings / environment.
 * - Format: international digits only (e.g. 919876543210), no +, spaces, dashes, or brackets.
 * - Official URL: https://wa.me/{WHATSAPP_NUMBER}?text={encodedMessage}
 * - Safe URL encoding with encodeURIComponent.
 * - No sensitive payment credentials (passwords, OTPs, PINs, card numbers) ever included.
 */

/**
 * =====================================================================
 * CENTRAL WHATSAPP BUSINESS CONFIGURATION
 * =====================================================================
 * Single source of truth for the platform WhatsApp Business contact number.
 * Can be configured directly here or overridden via VITE_WHATSAPP_NUMBER.
 * 
 * Supports formats:
 * - "+91 820 056 4182"
 * - "918200564182"
 * - "8200564182"
 */
export const WHATSAPP_NUMBER = '+91 820 056 4182';
export const WHATSAPP_DEFAULT_MESSAGE = 'Hello Navratri Companion team, I need help with the platform.';

/**
 * Known placeholder / demo numbers to guard against using in production.
 */
const DEMO_PLACEHOLDER_NUMBERS = [
  '919876543210',
  '9876543210',
  '1234567890',
  '911234567890',
  '0000000000',
];

/**
 * Checks if a phone number is a known dummy/demo number
 */
export function isDemoWhatsAppNumber(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return DEMO_PLACEHOLDER_NUMBERS.includes(digits);
}

export interface WhatsAppConfig {
  whatsappNumber: string;
  defaultMessage: string;
}

export type WhatsAppContextKey =
  | 'home'
  | 'marketplace'
  | 'companion_registration'
  | 'become_companion'
  | 'payment'
  | 'payment_companion_499'
  | 'booking'
  | 'help'
  | 'safety'
  | 'default';

export const CONTEXT_MESSAGES: Record<WhatsAppContextKey, string> = {
  home: 'Hello Navratri Companion team, I have a question about the platform.',
  marketplace: 'Hello Navratri Companion team, I have a question about finding a companion.',
  companion_registration: 'Hello, I need help with Companion registration.',
  become_companion: 'Hello Navratri Companion team, I need help with Companion registration.',
  payment: 'Hello, I need help regarding my registration payment.',
  payment_companion_499: 'Hello Navratri Companion team, I need help with my ₹499 Companion registration payment.',
  booking: 'Hello, I need help regarding my booking.',
  help: 'Hello, I need help from the Navratri Companion support team.',
  safety: 'Hello Navratri Companion safety team, I have a question regarding festival safety.',
  default: 'Hello Navratri Companion team, I need help with the platform.',
};

/**
 * Cleans phone number to international digits only (no +, -, spaces, or brackets).
 * If a 10-digit Indian mobile is provided (e.g., 8200564182), prepends 91 country code.
 * Replaces demo/dummy numbers with the official business number.
 */
export function cleanWhatsAppNumber(phone?: string | null): string {
  if (!phone || isDemoWhatsAppNumber(phone)) {
    return cleanWhatsAppNumber(WHATSAPP_NUMBER);
  }
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  if (isDemoWhatsAppNumber(digits)) {
    return cleanWhatsAppNumber(WHATSAPP_NUMBER);
  }
  return digits;
}

/**
 * Validates international WhatsApp phone number format
 */
export function validateWhatsAppNumber(phone: string): {
  isValid: boolean;
  cleanNumber?: string;
  errorMessage?: string;
} {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      errorMessage: 'WhatsApp phone number is required.',
    };
  }

  const clean = phone.replace(/\D/g, '');
  if (!clean) {
    return {
      isValid: false,
      errorMessage: 'Please enter digits only for the WhatsApp number.',
    };
  }

  // 10 digits gets prefixed with 91, or 10-15 digits international
  const finalDigits = clean.length === 10 ? `91${clean}` : clean;

  if (finalDigits.length < 10 || finalDigits.length > 15) {
    return {
      isValid: false,
      errorMessage: 'WhatsApp number must be 10 to 15 digits in international format (e.g. 918200564182).',
    };
  }

  return {
    isValid: true,
    cleanNumber: finalDigits,
  };
}

/**
 * Retrieves the active WhatsApp configuration from System Settings or env fallback
 */
export function getWhatsAppConfig(): WhatsAppConfig {
  const envNumber =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER) || '';
  const envMsg =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_DEFAULT_MESSAGE) ||
    WHATSAPP_DEFAULT_MESSAGE;

  let whatsappNumber = envNumber && !isDemoWhatsAppNumber(envNumber)
    ? cleanWhatsAppNumber(envNumber)
    : cleanWhatsAppNumber(WHATSAPP_NUMBER);
  let defaultMessage = envMsg;

  if (typeof window !== 'undefined') {
    try {
      const savedSys = localStorage.getItem('navratri_system_settings_config');
      if (savedSys) {
        const parsed = JSON.parse(savedSys);
        if (parsed.whatsappNumber && typeof parsed.whatsappNumber === 'string') {
          if (!isDemoWhatsAppNumber(parsed.whatsappNumber)) {
            const cleaned = cleanWhatsAppNumber(parsed.whatsappNumber);
            if (cleaned) whatsappNumber = cleaned;
          }
        }
        if (parsed.whatsappDefaultMessage && typeof parsed.whatsappDefaultMessage === 'string') {
          defaultMessage = parsed.whatsappDefaultMessage.trim();
        }
      }
    } catch (e) {
      console.warn('Error reading WhatsApp configuration from settings:', e);
    }
  }

  return {
    whatsappNumber,
    defaultMessage,
  };
}

export interface GenerateWhatsAppUrlOptions {
  message?: string;
  context?: WhatsAppContextKey;
  customNumber?: string;
  paymentRef?: string;
}

/**
 * Generates the official, safe wa.me WhatsApp URL with encoded message
 */
export function generateWhatsAppUrl(options: GenerateWhatsAppUrlOptions = {}): string {
  const config = getWhatsAppConfig();
  const rawNumber = options.customNumber || config.whatsappNumber;
  const targetNumber = cleanWhatsAppNumber(rawNumber);

  let messageText =
    options.message ||
    (options.context ? CONTEXT_MESSAGES[options.context] : null) ||
    config.defaultMessage;

  // Append safe public reference if provided (never sensitive info)
  if (options.paymentRef) {
    const cleanRef = options.paymentRef.trim();
    if (cleanRef && !messageText.includes(cleanRef)) {
      messageText = `${messageText} (Reference: ${cleanRef})`;
    }
  }

  const encodedMessage = encodeURIComponent(messageText.trim());
  return `https://wa.me/${targetNumber}?text=${encodedMessage}`;
}

/**
 * Analytics tracking for WhatsApp button clicks
 */
export function trackWhatsAppClick(eventData: {
  page?: string;
  context?: string;
  role?: string;
  route?: string;
  timestamp?: string;
}) {
  const payload = {
    event: 'whatsapp_support_clicked',
    page: eventData.page || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
    route: eventData.route || (typeof window !== 'undefined' ? window.location.hash || window.location.pathname : ''),
    context: eventData.context || 'general',
    role: eventData.role || (typeof window !== 'undefined' ? localStorage.getItem('navratri_user_role') || 'guest' : 'guest'),
    timestamp: eventData.timestamp || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    // Custom DOM event for internal analytics listeners
    try {
      window.dispatchEvent(new CustomEvent('whatsapp_support_clicked', { detail: payload }));
    } catch (e) {
      // ignore
    }

    // Google Analytics / GTM if present
    if (typeof (window as any).gtag === 'function') {
      try {
        (window as any).gtag('event', 'whatsapp_support_clicked', payload);
      } catch (e) {
        // ignore
      }
    }
  }

  // Development audit log
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Analytics] whatsapp_support_clicked', payload);
  }
}
