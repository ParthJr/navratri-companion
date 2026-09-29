import { parseRequestBody } from '../auth/_authUtils.ts';
import {
  createPayment,
  createPaymentTransactionRecord,
  getUserByIdentifier,
  updateUser,
  isTransactionIdAlreadyVerified,
  PaymentRecord,
  PaymentTransactionRecord,
} from '../_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const body = await parseRequestBody(req);
    const userId = (body.userId || '').toString().trim();
    const paymentReference = (body.paymentReference || '').toString().trim();
    const rawTxnId = (body.transactionId || body.utr || '').toString();
    const amount = Number(body.amount) || 499;
    const paymentMethod = (body.paymentMethod || 'UPI').toString().trim();
    const role = (body.role || 'COMPANION').toString().toUpperCase();
    const feeType = (body.feeType || 'COMPANION_REGISTRATION').toString();

    // 1. Mandatory Input Validation
    if (!userId) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User ID is required.',
        })
      );
    }

    if (!paymentReference) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Payment Reference is required.',
        })
      );
    }

    // Required: Transaction ID / UTR must not be empty
    const cleanTxnId = rawTxnId.replace(/<[^>]*>?/gm, '').trim();
    if (!cleanTxnId) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Please enter your Transaction ID / UTR.',
        })
      );
    }

    if (cleanTxnId.length < 4) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Please enter a valid Transaction ID / UTR (at least 4 characters).',
        })
      );
    }

    if (cleanTxnId.length > 64) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Transaction ID / UTR is too long (maximum 64 characters).',
        })
      );
    }

    // Prevent confusing Payment Reference with Transaction ID
    if (cleanTxnId.toLowerCase() === paymentReference.toLowerCase()) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage:
            'Transaction ID / UTR must be the actual reference number from your UPI app (e.g. 427819364829), not the platform payment reference.',
        })
      );
    }

    // 2. Locate User
    let existingUser;
    try {
      existingUser = await getUserByIdentifier(userId);
    } catch (err: any) {
      console.error('Database error finding user during payment submit:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Database error: unable to locate user record. Please try again.',
        })
      );
    }

    if (!existingUser) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: `User record with ID "${userId}" was not found.`,
        })
      );
    }

    // 3. Duplicate Transaction Protection
    // Check if this Transaction ID / UTR has already been verified/paid by another user
    const isAlreadyUsed = await isTransactionIdAlreadyVerified(cleanTxnId, existingUser.userId);
    if (isAlreadyUsed) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Transaction ID already used.',
        })
      );
    }

    const now = new Date().toISOString();

    // 4. Save to registration_payments table
    const paymentRecord: PaymentRecord = {
      id: `regpay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: existingUser.userId,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      transactionId: cleanTxnId,
      role: existingUser.role ? existingUser.role.toUpperCase() : role,
      feeType: feeType,
      paymentStatus: 'PAYMENT_SUBMITTED',
      submittedAt: now,
      approvedAt: null,
      approvedBy: null,
      verifiedAt: null,
      verifiedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
      notes: `User submitted UPI UTR: ${cleanTxnId} for Ref: ${paymentReference}`,
    };

    let savedPayment;
    try {
      savedPayment = await createPayment(paymentRecord);
    } catch (payErr: any) {
      console.error('Failed to create payment in central database:', payErr);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Unable to record payment in the central database. Please try again.',
        })
      );
    }

    // 5. Save to payment_transactions table for Super Admin Transactions tab
    const txnRecord: PaymentTransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: existingUser.userId,
      userName: existingUser.name,
      userEmail: existingUser.email,
      userPhone: existingUser.phone,
      userRole: (existingUser.role || 'COMPANION').toUpperCase() as any,
      feeCode: feeType,
      feeName: feeType.includes('COMPANION') ? 'Companion Registration Fee' : 'Customer Registration Fee',
      baseAmount: amount,
      gstAmount: 0,
      totalAmount: amount,
      currency: 'INR',
      status: 'PAYMENT_SUBMITTED',
      gateway: 'DIRECT_UPI',
      orderId: paymentReference,
      paymentId: paymentReference,
      transactionId: cleanTxnId,
      paymentReference: paymentReference,
      paymentMethod: paymentMethod,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      notes: `Submitted UPI UTR: ${cleanTxnId}`,
    };

    try {
      await createPaymentTransactionRecord(txnRecord);
    } catch (txErr) {
      console.warn('Notice saving payment transaction:', txErr);
    }

    // 6. Update user record in central database
    // IMPORTANT: Companion cannot mark payment as PAID! feePaid remains false until Super Admin approves!
    let updatedUser;
    try {
      updatedUser = await updateUser(existingUser.userId, {
        paymentStatus: 'pending',
        accountStatus: 'pending_approval',
        feePaid: false,
        loginEnabled: false,
        paymentReference: paymentReference,
        transactionId: cleanTxnId,
        paymentSubmittedAt: now,
        rejectionReason: null, // Clear any previous rejection reason
      });
    } catch (userErr: any) {
      console.error('Failed to update user status in central database:', userErr);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Unable to update registration status in the central database. Please try again.',
        })
      );
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: 'Payment submitted successfully. Your transaction ID has been sent to Super Admin for verification.',
        payment_status: 'PAYMENT_SUBMITTED',
        payment: savedPayment,
        user: updatedUser,
      })
    );
  } catch (err: any) {
    console.error('Fatal error in submit registration payment:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Payment submission failed due to a server error. Please try again.',
      })
    );
  }
}
