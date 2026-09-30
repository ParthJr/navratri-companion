import { getAllApplications, getAllUsers } from '../_db.ts';
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
    const [rawApplications, users] = await Promise.all([
      getAllApplications(),
      getAllUsers(),
    ]);

    const userMap = new Map<string, any>();
    users.forEach((u) => {
      userMap.set(u.userId.toLowerCase(), u);
    });

    // Customer accounts must NOT appear in Super Admin approval applications
    const applications = rawApplications.filter((app) => {
      const u = userMap.get(app.userId.toLowerCase());
      if (u && u.role === 'customer') {
        return false;
      }
      return true;
    });

    const pendingCount = applications.filter((a) => a.status === 'pending_review' || a.status === 'pending').length;
    const approvedCount = applications.filter((a) => a.status === 'approved').length;
    const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        applications,
        pendingCount,
        approvedCount,
        rejectedCount,
        total: applications.length,
      })
    );
  } catch (err: any) {
    console.error('Error fetching applications:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to fetch host applications from database: ' + (err.message || 'Database error'),
      })
    );
  }
}
