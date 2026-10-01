import { parseRequestBody, hashPassword, requireAdminAuth } from '../auth/_authUtils.ts';
import {
  getUserByIdentifier,
  getSuperAdminUser,
  updateUser,
  SUPER_ADMIN_IDENTIFIERS,
  logPaymentAudit,
} from '../_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const body = await parseRequestBody(req);
    const identifier = (body.identifier || body.userId || body.adminId || '').toString().trim();
    const newPassword = (body.newPassword || body.password || '').toString().trim();
    const confirmPassword = (body.confirmPassword || '').toString().trim();

    if (!newPassword || newPassword.length < 6) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Password must be at least 6 characters long.',
        })
      );
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Passwords do not match.',
        })
      );
    }

    const cleanId = (identifier || 'superadmin').toLowerCase();
    const isSuperAdminTarget = SUPER_ADMIN_IDENTIFIERS.includes(cleanId) || cleanId === 'superadmin';

    let targetUser;
    if (isSuperAdminTarget) {
      // Super Admin password reset: targets the canonical Super Admin database record
      targetUser = await getSuperAdminUser();
    } else {
      // Modifying non-admin accounts requires authenticated Super Admin session
      if (!requireAdminAuth(req, res)) {
        return;
      }
      targetUser = await getUserByIdentifier(identifier);
    }

    if (!targetUser) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User account not found in database.',
        })
      );
    }

    // Hash securely with scrypt
    const hashedPassword = hashPassword(newPassword);

    const updatedUser = await updateUser(targetUser.userId, {
      password: hashedPassword,
      passwordResetAt: new Date().toISOString(),
      passwordResetBy: isSuperAdminTarget ? 'superadmin' : 'admin',
      mustChangePassword: false,
      temporaryPassword: false,
      passwordExpiresAt: null,
    });

    try {
      await logPaymentAudit(
        'SUPER_ADMIN_PASSWORD_RESET',
        'superadmin',
        updatedUser.userId,
        {
          timestamp: new Date().toISOString(),
          targetUserId: updatedUser.userId,
          role: updatedUser.role,
        }
      );
    } catch (auditErr) {
      // Non-fatal audit log warning
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: 'Password successfully updated and saved in production database.',
        userId: updatedUser.userId,
      })
    );
  } catch (err: any) {
    console.error('Error during password reset in handler:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to reset password: ' + (err.message || 'Internal database error'),
      })
    );
  }
}
