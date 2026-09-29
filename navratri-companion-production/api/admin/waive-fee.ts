import { parseRequestBody } from '../auth/_authUtils.ts';
import { waiveUserFeeRecord } from '../_db.ts';

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
    const reason = (body.reason || 'Admin promotional waiver').toString().trim();
    const adminId = (body.adminId || 'superadmin').toString().trim();

    if (!userId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'User ID is required' }));
    }

    if (!reason) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'A reason for waiving the fee is required for audit compliance.' }));
    }

    const result = await waiveUserFeeRecord(userId, feeCode, reason, adminId);

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: `Registration fee successfully marked as WAIVED for ${result.user.name}.`,
        transaction: result.transaction,
        user: result.user,
      })
    );
  } catch (err: any) {
    console.error('Error waiving user fee:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: err.message || 'Failed to waive fee',
      })
    );
  }
}
