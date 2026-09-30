import { getAllPayments, getAllUsers } from '../_db.ts';
import { requireAdminAuth } from '../auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  // Server-side Admin Authorization Verification
  if (!requireAdminAuth(req, res)) {
    return;
  }

  try {
    const [payments, users] = await Promise.all([
      getAllPayments(),
      getAllUsers(),
    ]);

    // Build user map for fast O(1) enrichment
    const userMap = new Map<string, any>();
    users.forEach((u) => {
      userMap.set(u.userId.toLowerCase(), u);
    });

    // Registration payment approval requests are strictly for COMPANION registration fee verification (₹499).
    // Customers have free registration, never pay ₹499, and never require Super Admin payment approval.
    const companionPayments = payments.filter((p) => {
      const u = userMap.get(p.userId.toLowerCase());
      const role = (p.role || u?.role || '').toLowerCase();
      // Must not be a customer
      if (role === 'customer' || u?.role === 'customer') {
        return false;
      }
      // Must not be a customer booking payment
      if (p.feeType === 'BOOKING_PAYMENT') {
        return false;
      }
      return true;
    });

    // Query registration_payments directly from central Supabase PostgreSQL
    const approvalRequests = companionPayments.map((p) => {
      const u = userMap.get(p.userId.toLowerCase());
      const pStatus = (p.paymentStatus || 'PENDING').toUpperCase();

      let displayStatus: 'Pending Verification' | 'Approved' | 'Rejected' = 'Pending Verification';
      if (pStatus === 'APPROVED') {
        displayStatus = 'Approved';
      } else if (pStatus === 'REJECTED') {
        displayStatus = 'Rejected';
      }

      return {
        id: p.id,
        userId: p.userId,
        name: u?.name || p.userId,
        email: u?.email || '',
        phone: u?.phone || u?.mobile || '',
        role: u?.role || 'customer',
        city: u?.city || 'Ahmedabad',
        amount: p.amount || 499,
        paymentReference: p.paymentReference || '',
        transactionId: p.transactionId || u?.transactionId || '',
        paymentMethod: p.paymentMethod || 'UPI',
        feeType: p.feeType || 'REGISTRATION_FEE',
        submittedAt: p.submittedAt || p.createdAt,
        approvedAt: p.approvedAt,
        approvedBy: p.approvedBy,
        rejectedAt: p.rejectedAt,
        rejectionReason: p.rejectionReason || '',
        status: displayStatus,
        paymentStatus: pStatus,
        accountStatus: u?.accountStatus || (pStatus === 'APPROVED' ? 'active' : 'pending_approval'),
        feePaid: pStatus === 'APPROVED',
        loginEnabled: pStatus === 'APPROVED',
        profilePhoto: u?.profilePhoto || '',
        aadhaarImage: u?.aadhaarImage,
        selfieImage: u?.selfieImage,
        policyConsent: u?.policyConsent,
        registrationDate: u?.createdAt || p.createdAt,
      };
    });

    // Pending count must be strictly: COUNT(payment_status = PENDING)
    const pendingCount = approvalRequests.filter((r) => r.paymentStatus === 'PENDING').length;
    const approvedCount = approvalRequests.filter((r) => r.paymentStatus === 'APPROVED').length;
    const rejectedCount = approvalRequests.filter((r) => r.paymentStatus === 'REJECTED').length;

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        requests: approvalRequests,
        items: approvalRequests,
        pendingCount,
        approvedCount,
        rejectedCount,
        total: approvalRequests.length,
      })
    );
  } catch (err: any) {
    console.error('Error fetching payment approvals:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to fetch payment approvals from production database: ' + (err.message || 'Database error'),
      })
    );
  }
}
