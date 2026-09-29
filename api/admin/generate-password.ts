import {
  parseRequestBody,
  verifySuperAdminAuthorization,
  generateSecureTemporaryPassword,
  hashPassword,
} from '../auth/_authUtils.ts';
import {
  getUserByIdentifier,
  updateUser,
  logPaymentAuditRecord,
} from '../_db.ts';

// In-memory rate limiting map: targetUserId -> timestamp
const lastResetTimestamps = new Map<string, number>();

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  // 1. Strict Server-Side Super Admin Authorization Verification
  const { authorized, payload } = verifySuperAdminAuthorization(req);
  if (!authorized || !payload) {
    res.statusCode = 403;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Access Denied: Only users with the Super Admin role are authorized to generate user passwords.',
      })
    );
  }

  try {
    const body = await parseRequestBody(req);
    const targetUserId = (body.userId || body.targetUserId || '').toString().trim();

    if (!targetUserId) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Target user ID is required.',
        })
      );
    }

    // 2. Lookup Target User
    const targetUser = await getUserByIdentifier(targetUserId);
    if (!targetUser) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: `User "${targetUserId}" was not found in the database.`,
        })
      );
    }

    // 3. Prevent Self-Service Admin Password Generation
    // Protect Super Admin and Admin accounts from unauthorized override
    const targetRole = (targetUser.role || '').toLowerCase();
    if (targetRole === 'owner' || targetRole === 'admin') {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Super Admin and Platform Administrator accounts cannot be reset via this endpoint.',
        })
      );
    }

    // 4. Rate Limiting & Accidental Double-Click Protection
    const now = Date.now();
    const lastReset = lastResetTimestamps.get(targetUser.userId.toLowerCase()) || 0;
    if (now - lastReset < 3000) {
      // 3-second cooldown per user
      res.statusCode = 429;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'A password generation request was recently submitted for this user. Please wait a few seconds.',
        })
      );
    }
    lastResetTimestamps.set(targetUser.userId.toLowerCase(), now);

    // 5. Generate Cryptographically Secure Random Temporary Password
    const tempPassword = generateSecureTemporaryPassword(14);
    const hashedPassword = hashPassword(tempPassword);

    // Temporary password validity: strictly 24 hours
    const passwordExpiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    const resetTimestamp = new Date(now).toISOString();

    // 6. Update Target User in Persistent Central Database
    // NEVER write plaintext passwords to the database
    await updateUser(targetUser.userId, {
      password: hashedPassword,
      mustChangePassword: true,
      temporaryPassword: true,
      passwordExpiresAt,
      passwordResetAt: resetTimestamp,
      passwordResetBy: payload.userId,
    });

    // 7. Audit Log (Never logs plaintext password or hash!)
    const ipAddress =
      req.headers?.['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || 'unknown';

    await logPaymentAuditRecord(
      'PASSWORD_RESET',
      payload.userId,
      targetUser.userId,
      {
        target_role: targetUser.role,
        target_email: targetUser.email,
        expires_at: passwordExpiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
      }
    );

    // 8. Return the plaintext temporary password ONCE to Super Admin
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        temporaryPassword: tempPassword,
        expiresAt: passwordExpiresAt,
        user: {
          userId: targetUser.userId,
          name: targetUser.name,
          role: targetUser.role,
          email: targetUser.email,
        },
      })
    );
  } catch (err: any) {
    console.error('Error generating temporary password:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'An internal server error occurred while generating the temporary password.',
      })
    );
  }
}
