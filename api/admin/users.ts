import { getAllUsers, updateUser, logPaymentAudit } from '../_db.ts';
import { requireAdminAuth, parseRequestBody } from '../auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // Require server-side admin authentication for all actions
  if (!requireAdminAuth(req, res)) {
    return;
  }

  if (req.method === 'GET') {
    try {
      const users = await getAllUsers();
      const safeUsers = users.map((u) => {
        const { password, ...rest } = u;
        return rest;
      });

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          users: safeUsers,
          total: safeUsers.length,
        })
      );
    } catch (err: any) {
      console.error('Error fetching users in admin handler:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to fetch users from database: ' + (err.message || 'Database error'),
        })
      );
    }
  }

  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const body = await parseRequestBody(req);
      const { userId, accountStatus, loginEnabled, role, notes } = body || {};

      if (!userId) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'User ID is required.',
          })
        );
      }

      const updates: any = {};
      if (accountStatus) {
        updates.accountStatus = accountStatus.toLowerCase();
        if (accountStatus.toLowerCase() === 'active') {
          updates.loginEnabled = true;
        } else if (accountStatus.toLowerCase() === 'suspended' || accountStatus.toLowerCase() === 'blocked') {
          updates.loginEnabled = false;
        }
      }
      if (loginEnabled !== undefined) {
        updates.loginEnabled = Boolean(loginEnabled);
      }
      if (role) {
        updates.role = role.toLowerCase();
      }

      const updatedUser = await updateUser(userId, updates);
      const { password, ...safeUser } = updatedUser;

      try {
        await logPaymentAudit(
          'USER_STATUS_UPDATED',
          (req as any).adminUser?.userId || 'superadmin',
          userId,
          { updates, notes, timestamp: new Date().toISOString() }
        );
      } catch (auditErr) {
        // Non-fatal
      }

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: `User ${userId} updated successfully.`,
          user: safeUser,
        })
      );
    } catch (err: any) {
      console.error('Error updating user in admin handler:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to update user in database: ' + (err.message || 'Database error'),
        })
      );
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
