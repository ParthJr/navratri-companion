import { parseRequestBody } from '../auth/_authUtils.ts';
import { createPayment, getUserByIdentifier, updateUser, PaymentRecord } from '../_db.ts';

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
    const amount = Number(body.amount) || 499;
    const paymentMethod = (body.paymentMethod || 'UPI').toString().trim();

    if (!userId || !paymentReference) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User ID and Payment Reference are required.',
        })
      );
    }

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

    const now = new Date().toISOString();
    const paymentRecord: PaymentRecord = {
      id: `regpay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: existingUser.userId,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      paymentStatus: 'PENDING',
      submittedAt: now,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
      notes: 'Registration fee awaiting platform admin confirmation',
    };

    // 1. Create / update central registration_payments record
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

    // 2. Update user status in central database
    let updatedUser;
    try {
      updatedUser = await updateUser(existingUser.userId, {
        paymentStatus: 'pending',
        accountStatus: 'pending_approval',
        feePaid: false,
        loginEnabled: false,
        paymentReference: paymentReference,
        paymentSubmittedAt: now,
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
        message: 'Payment submitted successfully. Awaiting admin approval.',
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
