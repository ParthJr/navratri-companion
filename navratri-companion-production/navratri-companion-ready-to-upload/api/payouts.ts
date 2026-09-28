import { getAllPayouts, createPayoutRecord, updatePayoutRecord } from './_db.ts';
import { parseRequestBody } from './auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'GET') {
    try {
      const payouts = await getAllPayouts();
      const pendingCount = payouts.filter((p) => p.status === 'PENDING_ADMIN_APPROVAL').length;
      const approvedCount = payouts.filter((p) => p.status === 'PAID' || p.status === 'APPROVED').length;

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          payouts,
          pendingCount,
          approvedCount,
          total: payouts.length,
        })
      );
    } catch (e: any) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Failed to fetch payouts' }));
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { payoutId, action, transactionReference, approvedBy = 'Platform Operations' } = body;

      if (!payoutId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'Payout ID is required.' }));
      }

      if (action === 'approve') {
        if (!transactionReference || transactionReference.trim().length < 4) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              success: false,
              errorMessage: 'Actual Bank/UPI Transaction Reference (UTR) is required to approve manual payout.',
            })
          );
        }

        const updated = await updatePayoutRecord(payoutId, {
          status: 'PAID',
          transactionReference: transactionReference.trim(),
          approvedBy,
          approvedAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
        });

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: `Payout of ₹${updated?.amount} approved and marked PAID. Transaction Reference: ${transactionReference}`,
            payout: updated,
          })
        );
      }

      if (action === 'reject') {
        const updated = await updatePayoutRecord(payoutId, {
          status: 'REJECTED',
          approvedBy,
          approvedAt: new Date().toISOString(),
        });

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: 'Payout marked as rejected / on hold.',
            payout: updated,
          })
        );
      }

      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Invalid action' }));
    } catch (e: any) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Failed to process payout action.' }));
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
