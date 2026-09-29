import QRCode from 'qrcode';

export interface PlatformUpiConfig {
  upiId: string;
  payeeName: string;
  registrationFee: number;
  platformFee: number;
}

/**
 * Returns current platform UPI configuration from localStorage or defaults
 */
export const getPlatformUpiConfig = (): PlatformUpiConfig => {
  let upiId = 'navratri.official@okicici';
  let payeeName = 'Navratri Companion';
  let registrationFee = 499;
  let platformFee = 50;

  try {
    const savedSys = localStorage.getItem('navratri_system_settings_config');
    if (savedSys) {
      const parsed = JSON.parse(savedSys);
      if (parsed.platformUpiId) upiId = parsed.platformUpiId.trim();
      if (parsed.platformPayeeName) payeeName = parsed.platformPayeeName.trim();
    }

    const savedReg = localStorage.getItem('navratri_reg_fee_config');
    if (savedReg) {
      const parsedReg = JSON.parse(savedReg);
      if (typeof parsedReg.amount === 'number') registrationFee = parsedReg.amount;
    }

    const savedFee = localStorage.getItem('navratri_platform_fee_config');
    if (savedFee) {
      const parsedFee = JSON.parse(savedFee);
      if (typeof parsedFee.fixedFee === 'number') platformFee = parsedFee.fixedFee;
    }
  } catch (e) {
    console.error('Error reading platform UPI config:', e);
  }

  return {
    upiId,
    payeeName,
    registrationFee,
    platformFee,
  };
};

/**
 * Validates UPI ID and payment amount before generating URI / QR code
 */
export const validateUpiParams = (upiId: string, amount: number): boolean => {
  if (!upiId || typeof upiId !== 'string') return false;
  const cleanUpi = upiId.trim();
  if (!cleanUpi || !cleanUpi.includes('@') || cleanUpi.length < 3) return false;
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
  return true;
};

/**
 * Generates valid standard UPI deep-link URI:
 * upi://pay?pa={UPI_ID}&pn={PLATFORM_NAME}&am={AMOUNT}&cu=INR&tn={TRANSACTION_NOTE}
 */
export const generateUpiUri = ({
  upiId,
  payeeName = 'Navratri Companion',
  amount,
  transactionNote,
}: {
  upiId: string;
  payeeName?: string;
  amount: number;
  transactionNote: string;
}): string => {
  const cleanUpiId = (upiId || '').trim();
  const cleanPayee = (payeeName || 'Navratri Companion').trim();
  const cleanNote = (transactionNote || '').trim();

  // Strict parameter encoding
  const pa = encodeURIComponent(cleanUpiId);
  const pn = encodeURIComponent(cleanPayee);
  const am = amount.toString();
  const cu = 'INR';
  const tn = encodeURIComponent(cleanNote);

  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`;
};

/**
 * Generates unique payment reference using user ID / booking ID.
 * Examples:
 *  - Registration: NC10245-REG
 *  - Booking: NC10245-BOOK-7842
 */
export const generatePaymentReference = (
  userId: string,
  type: 'REG' | 'BOOK',
  bookingId?: string
): string => {
  const cleanUser = (userId || 'GUEST').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (type === 'REG') {
    return `${cleanUser}-REG`;
  }
  
  const cleanBooking = (bookingId || Math.floor(1000 + Math.random() * 9000).toString())
    .replace('NC-2026-', '')
    .replace('#', '');
  
  return `${cleanUser}-BOOK-${cleanBooking}`;
};

/**
 * Asynchronously generates a Base64 PNG Data URL for a given UPI URI using qrcode library
 */
export const renderUpiQrCode = async (upiUri: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 2,
      color: {
        dark: '#12001f',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};
