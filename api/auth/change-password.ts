import {
  parseRequestBody,
  verifyPassword,
  hashPassword,
} from './_authUtils.ts';
import {
  getUserByIdentifier,
  updateUser,
  logPaymentAuditRecord,
} from '../_db.ts';

// Strong password policy validation
function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one special character (!@#$%^&* etc.).' };
  }
  return { valid: true };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const body = await parseRequestBody(req);
    const userId = (body.userId || body.identifier || '').toString().trim();
    const currentPassword = (body.currentPassword || '').toString().trim();
    const newPassword = (body.newPassword || '').toString().trim();
    const confirmPassword = (body.confirmPassword || '').toString().trim();

    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'All fields (User ID, Current Password, New Password, Confirm Password) are required.',
        })
      );
    }

    if (newPassword !== confirmPassword) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'New password and confirmation password do not match.',
        })
      );
    }

    // 1. Lookup User
    const user = await getUserByIdentifier(userId);
    if (!user) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User account not found.',
        })
      );
    }

    // 2. Verify Current Password
    const isCurrentValid = verifyPassword(currentPassword, user.password || '');
    if (!isCurrentValid) {
      res.statusCode = 401;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Current temporary password is incorrect.',
        })
      );
    }

    // 3. Prevent Reusing Current / Temporary Password
    if (newPassword === currentPassword) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'New password cannot be identical to the temporary password. Please choose a new password.',
        })
      );
    }

    // 4. Validate Password Complexity
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: strengthCheck.reason || 'Password does not meet complexity requirements.',
        })
      );
    }

    // 5. Hash New Password
    const newHashedPassword = hashPassword(newPassword);

    // 6. Update User: Clear mustChangePassword and temporaryPassword
    await updateUser(user.userId, {
      password: newHashedPassword,
      mustChangePassword: false,
      temporaryPassword: false,
      passwordExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });

    // 7. Audit Log (Never logs password or hash!)
    const ipAddress =
      req.headers?.['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || 'unknown';

    await logPaymentAuditRecord(
      'PASSWORD_CHANGED',
      user.userId,
      user.userId,
      {
        user_role: user.role,
        ip_address: ipAddress,
        user_agent: userAgent,
      }
    );

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        message: 'Password changed successfully. You may now continue using your account.',
      })
    );
  } catch (err: any) {
    console.error('Error changing user password:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'An internal error occurred while updating your password.',
      })
    );
  }
}
