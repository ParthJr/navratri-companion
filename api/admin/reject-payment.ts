import { parseRequestBody, requireAdminAuth } from '../auth/_authUtils.ts';
import { getUserByIdentifier, updatePayment, updateUser } from '../_db.ts';

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
    const reason = (body.reason || 'Invalid transaction reference').toString().trim();
    const rejectedBy = (body.rejectedBy || 'Master Admin').toString().trim();

    if (!userId) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User ID is required to reject payment.',
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

    // 1. Update Payment Record
    const updatedPayment = await updatePayment(user.userId, {
      paymentStatus: 'REJECTED',
      rejectedAt: now,
      rejectionReason: reason,
      notes: `Rejected by ${rejectedBy} on ${now}. Reason: ${reason}`,
    });

    // 2. Update User Record without deleting registration
    const updatedUser = await updateUser(user.userId, {
      accountStatus: 'payment_rejected',
      paymentStatus: 'rejected',
      feePaid: false,
      loginEnabled: false,
      rejectedAt: now,
      rejectionReason: reason,
    });

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: `Payment rejected for @${user.userId}. User can submit a new payment reference.`,
        user: updatedUser,
        payment: updatedPayment,
      })
    );
  } catch (err: any) {
    console.error('Reject payment error:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to reject payment in database: ' + (err.message || 'Database error'),
      })
    );
  }
}
