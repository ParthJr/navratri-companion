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

    // 1. Update Payment Record in central database
    const updatedPayment = await updatePayment(user.userId, {
      paymentStatus: 'APPROVED',
      approvedAt: now,
      approvedBy: approvedBy,
      notes: `Approved by ${approvedBy} on ${now}`,
    });

    // 2. Update User Record in central database
    const updatedUser = await updateUser(user.userId, {
      accountStatus: 'active',
      paymentStatus: 'approved',
      feePaid: true,
      loginEnabled: true,
      approvedAt: now,
      approvedBy: approvedBy,
      rejectionReason: null,
    });

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: `Payment approved and account activated for @${user.userId}`,
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
