import { parseRequestBody, requireAdminAuth } from '../auth/_authUtils.ts';
import {
  getUserByIdentifier,
  updatePayment,
  updateUser,
  getAllPayments,
  isTransactionIdAlreadyVerified,
  getAllPaymentTransactions,
  updatePaymentTransactionRecord,
  getAllApplications,
  updateApplicationRecord,
} from '../_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  // Require server-side admin authentication
  if (!requireAdminAuth(req, res)) {
    return;
  }

  try {
    const body = await parseRequestBody(req);
    const userId = (body.userId || '').toString().trim();
    const approvedBy = (body.approvedBy || 'Master Admin').toString().trim();

    if (!userId) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User ID is required to approve payment.',
        })
      );
    }

    const user = await getUserByIdentifier(userId);
    if (!user) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: `User @${userId} not found in central database.`,
        })
      );
    }

    const now = new Date().toISOString();

    // Check existing payment for this user
    const allPayments = await getAllPayments();
    const existingPayment = allPayments.find(
      (p) => p.userId.toLowerCase() === user.userId.toLowerCase()
    );
    const txnIdToCheck = existingPayment?.transactionId || user.transactionId;

    if (txnIdToCheck) {
      const isDuplicate = await isTransactionIdAlreadyVerified(txnIdToCheck, user.userId);
      if (isDuplicate) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: `Cannot approve: Transaction ID / UTR "${txnIdToCheck}" has already been verified for another user.`,
          })
        );
      }
    }

    // 1. Update Payment Record in central database
    const updatedPayment = await updatePayment(user.userId, {
      paymentStatus: 'APPROVED',
      status: 'PAID',
      verifiedAt: now,
      verifiedBy: approvedBy,
      approvedAt: now,
      approvedBy: approvedBy,
      notes: `Verified & approved by ${approvedBy} on ${now}`,
    });

    // 2. Sync corresponding payment_transactions record if present
    const allTxns = await getAllPaymentTransactions();
    const matchingTxn = allTxns.find(
      (t) =>
        t.userId.toLowerCase() === user.userId.toLowerCase() &&
        (t.feeCode.includes('REGISTRATION') || t.orderId === existingPayment?.paymentReference)
    );
    if (matchingTxn) {
      await updatePaymentTransactionRecord(matchingTxn.id, {
        status: 'PAID',
        paidAt: now,
        verifiedAt: now,
        verifiedBy: approvedBy,
        notes: `Approved by ${approvedBy}`,
      });
    }

    // 3. Update User Record in central database
    const updatedUser = await updateUser(user.userId, {
      accountStatus: 'active',
      paymentStatus: 'approved',
      feePaid: true,
      loginEnabled: true,
      approvedAt: now,
      approvedBy: approvedBy,
      rejectionReason: null,
    });

    // 4. Update Host Applicant if exists
    try {
      const allApps = await getAllApplications();
      const applicant = allApps.find(
        (a) => a.userId.toLowerCase() === user.userId.toLowerCase()
      );
      if (applicant) {
        await updateApplicationRecord(applicant.id, {
          status: 'approved',
          registrationFeePaid: true,
        });
      }
    } catch (e) {
      // non-fatal
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: `Payment verified & approved, account activated for @${user.userId}`,
        user: updatedUser,
        payment: updatedPayment,
      })
    );
  } catch (err: any) {
    console.error('Approve payment error:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to approve payment in database: ' + (err.message || 'Database error'),
      })
    );
  }
}
