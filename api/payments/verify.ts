import crypto from 'crypto';
import { parseRequestBody } from '../auth/_authUtils.ts';
import {
  getTransactionByOrderId,
  updatePaymentTransactionRecord,
  updateUser,
  updateApplicationRecord,
  logPaymentAuditRecord,
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
    const orderId = (body.orderId || '').toString().trim();
    const paymentId = (body.paymentId || body.razorpay_payment_id || '').toString().trim();
    const transactionId = (
      body.transactionId ||
      body.razorpay_payment_id ||
      body.paymentReference ||
      body.utr ||
      paymentId
    ).toString().trim();
    const signature = (body.signature || body.razorpay_signature || '').toString().trim();
    const paymentMethod = (body.paymentMethod || 'UPI').toString().trim();
    const userId = (body.userId || '').toString().trim();

    if (!orderId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Order ID is required.' }));
    }

    if (!transactionId && !paymentId) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Transaction ID / Payment ID is required for verification.',
        })
      );
    }

    const transaction = await getTransactionByOrderId(orderId);
    if (!transaction) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: `No payment order found matching Order ID "${orderId}".`,
        })
      );
    }

    // Idempotency: if already paid, return success immediately
    if (transaction.status === 'PAID') {
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: 'Payment already verified and completed.',
          transaction,
        })
      );
    }

    // Optional cryptographic signature check if gateway secret configured
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (razorpaySecret && signature && paymentId) {
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        // Mark failed payment attempt
        await updatePaymentTransactionRecord(orderId, {
          status: 'FAILED',
          notes: 'Cryptographic signature verification failed',
        });

        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Payment signature verification failed. Untrusted response.',
          })
        );
      }
    }

    const verifiedTxnId = transactionId || paymentId || `txn_verified_${Date.now()}`;
    const verifiedPaymentId = paymentId || transactionId || `pay_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Update Payment Transaction to PAID
    const updatedTxn = await updatePaymentTransactionRecord(orderId, {
      status: 'PAID',
      paymentId: verifiedPaymentId,
      transactionId: verifiedTxnId,
      paymentMethod,
      paidAt: now,
      notes: `Verified successfully via ${transaction.gateway}. Txn: ${verifiedTxnId}`,
    });

    // 2. Activate user account in central database
    const targetUserId = userId || transaction.userId;
    const updatedUser = await updateUser(targetUserId, {
      accountStatus: 'active',
      paymentStatus: 'Approved',
      feePaid: true,
      loginEnabled: true,
      paymentReference: verifiedTxnId,
      approvedAt: now,
      approvedBy: 'SYSTEM_PAYMENT_GATEWAY',
    });

    // 3. If companion application exists, mark fee as paid
    try {
      await updateApplicationRecord(targetUserId, {
        registrationFeePaid: true,
      });
    } catch (e) {}

    // 4. Financial Audit Logging
    await logPaymentAuditRecord(
      'PAYMENT_VERIFIED_SUCCESS',
      'GATEWAY',
      targetUserId,
      {
        orderId,
        paymentId: verifiedPaymentId,
        transactionId: verifiedTxnId,
        amount: transaction.totalAmount,
        feeCode: transaction.feeCode,
        gateway: transaction.gateway,
      },
      transaction.id
    );

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: 'Payment verified and confirmed. Account activated.',
        transaction: updatedTxn,
        user: updatedUser,
      })
    );
  } catch (err: any) {
    console.error('Error during payment verification:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: err.message || 'Payment verification encountered a server error. Please retry.',
      })
    );
  }
}
