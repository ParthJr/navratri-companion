import { parseRequestBody, requireAdminAuth } from '../auth/_authUtils.ts';
import { updateApplicationRecord, getAllApplications, updateUser } from '../_db.ts';

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
    const applicationId = (body.applicationId || body.id || '').toString().trim();

    if (!applicationId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Application ID is required.' }));
    }

    const updated = await updateApplicationRecord(applicationId, {
      status: 'approved',
      reviewStatus: 'Approved',
      phoneVerified: true,
      registrationFeePaid: true,
    });

    if (!updated) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Application record not found.' }));
    }

    // Also update corresponding user record if userId exists
    if (updated.userId) {
      try {
        await updateUser(updated.userId, {
          role: 'companion',
          profileStatus: 'verified',
          verificationStatus: 'verified',
        });
      } catch (userErr) {
        console.warn('Note updating companion user record:', userErr);
      }
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: `Application ${applicationId} approved successfully. Companion is now verified.`,
        application: updated,
      })
    );
  } catch (err: any) {
    console.error('Approve application error:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to approve application in database: ' + (err.message || 'Database error'),
      })
    );
  }
}
