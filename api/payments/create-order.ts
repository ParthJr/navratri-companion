import { parseRequestBody } from '../auth/_authUtils.ts';
import {
  getUserByIdentifier,
  getFeeByCode,
  createPaymentTransactionRecord,
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
    const feeCode = (body.feeCode || 'COMPANION_REGISTRATION').toString().trim();
    const gateway = (body.gateway || 'RAZORPAY').toString().toUpperCase().trim();

    if (!userId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'User ID is required' }));
    }

    const user = await getUserByIdentifier(userId);
    if (!user) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, errorMessage: `User "${userId}" was not found.` }));
    }

    // Backend retrieves active fee configuration strictly (never trusts frontend amount!)
    const feeConfig = await getFeeByCode(feeCode);

    // Verify role applicability
    if (feeConfig.applicableRole === 'COMPANION' && user.role !== 'companion') {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Fee is only applicable to Companion accounts.',
        })
      );
    }

    const baseAmount = Number(feeConfig.amount) || 0;
    const gstRate = feeConfig.gstEnabled ? Number(feeConfig.gstPercentage || 18) / 100 : 0;
    const gstAmount = Math.round(baseAmount * gstRate);
    const totalAmount = baseAmount + gstAmount;

    // Generate unique order ID
    const timestamp = Date.now();
    const randSuffix = Math.random().toString(36).substring(2, 8);
    const orderId = `order_${feeCode.toLowerCase().slice(0, 4)}_${timestamp}_${randSuffix}`;
    const txnId = `txn_${timestamp}_${randSuffix}`;

    const transactionRecord: PaymentTransactionRecord = {
      id: txnId,
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      userRole: user.role === 'companion' ? 'COMPANION' : 'CUSTOMER',
      feeConfigurationId: feeConfig.id,
      feeCode: feeConfig.feeCode,
      feeName: feeConfig.feeName,
      baseAmount,
      gstAmount,
      totalAmount,
      currency: feeConfig.currency || 'INR',
      status: totalAmount === 0 ? 'PAID' : 'PENDING',
      gateway,
      orderId,
      paymentId: '',
      transactionId: '',
      paymentMethod: 'UPI',
      paidAt: totalAmount === 0 ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Order created for ${feeConfig.feeName} via ${gateway}`,
    };

    const savedTxn = await createPaymentTransactionRecord(transactionRecord);

    const upiId = process.env.VITE_UPI_ID || 'navratri.companion@okaxis';
    const payeeName = process.env.VITE_UPI_NAME || 'Navratri Companion';

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        order: {
          id: savedTxn.id,
          orderId: savedTxn.orderId,
          feeCode: savedTxn.feeCode,
          feeName: savedTxn.feeName,
          baseAmount: savedTxn.baseAmount,
          gstAmount: savedTxn.gstAmount,
          totalAmount: savedTxn.totalAmount,
          currency: savedTxn.currency,
          gateway: savedTxn.gateway,
          upiId,
          payeeName,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_navratri2026',
        },
      })
    );
  } catch (err: any) {
    console.error('Error in create-order endpoint:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: err.message || 'Failed to initialize payment order',
      })
    );
  }
}
