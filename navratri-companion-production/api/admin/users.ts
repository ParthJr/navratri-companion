import { getAllUsers } from '../_db.ts';
import { requireAdminAuth } from '../auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  // Require server-side admin authentication
  if (!requireAdminAuth(req, res)) {
    return;
  }

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
