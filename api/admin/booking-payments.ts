import { getAllBookings, updateBookingRecord } from '../_db.ts';
import { requireAdminAuth } from '../auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // Require admin auth
  if (!requireAdminAuth(req, res)) {
    return;
  }

  // GET: Fetch all booking payments (Pending Confirmation, Confirmed, Rejected)
  if (req.method === 'GET') {
    try {
      const allBookings = await getAllBookings();
      
      const payments = allBookings.map((b) => {
        const rawStatus = (b.paymentStatus || 'PENDING').toUpperCase();
        let displayStatus: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' = 'PENDING_CONFIRMATION';
        if (rawStatus === 'PAID' || rawStatus === 'CONFIRMED') {
          displayStatus = 'CONFIRMED';
        } else if (rawStatus === 'REJECTED') {
          displayStatus = 'REJECTED';
        }

        return {
          id: b.id,
          bookingId: b.id,
          bookingReference: b.bookingReference,
          customerId: b.customerId,
          customerName: b.customerName,
          customerPhone: b.customerPhone || '',
          companionId: b.companionId,
          companionName: b.companionName,
          companionPhone: b.companionPhone || '',
          date: b.date,
          rawDate: b.rawDate,
          timeSlot: b.timeSlot,
          venue: b.venue,
          basePrice: b.basePrice,
          platformFee: b.platformFee,
          totalPrice: b.totalPrice,
          paymentType: 'BOOKING_PAYMENT',
          paymentStatus: displayStatus,
          escrowStatus: b.escrowStatus || 'Held in Escrow',
          paymentReference: b.paymentReference || `UPI-${b.bookingReference}`,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      });

      const pendingCount = payments.filter((p) => p.paymentStatus === 'PENDING_CONFIRMATION').length;
      const confirmedCount = payments.filter((p) => p.paymentStatus === 'CONFIRMED').length;
      const rejectedCount = payments.filter((p) => p.paymentStatus === 'REJECTED').length;

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          payments,
          pendingCount,
          confirmedCount,
          rejectedCount,
          total: payments.length,
        })
      );
    } catch (err: any) {
      console.error('Error fetching booking payments:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to fetch booking payments from database: ' + (err.message || 'Database error'),
        })
      );
    }
  }

  // POST: Confirm or Reject booking payment
  if (req.method === 'POST') {
    try {
      const chunks: any[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf8');
      const body = rawBody ? JSON.parse(rawBody) : {};

      const action = (body.action || '').toString().trim(); // 'confirm' | 'reject'
      const bookingId = (body.bookingId || '').toString().trim();

      if (!bookingId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'Booking ID is required.' }));
      }

      const allBookings = await getAllBookings();
      const existing = allBookings.find((b) => b.id === bookingId || b.bookingReference === bookingId);
      if (!existing) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, errorMessage: 'Booking record not found in database.' }));
      }

      if (action === 'confirm') {
        const updated = await updateBookingRecord(existing.id, {
          status: 'confirmed',
          paymentStatus: 'PAID',
          escrowStatus: 'LOCKED',
        });

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: `Booking payment of ₹${existing.totalPrice} confirmed! Escrow locked.`,
            booking: updated,
          })
        );
      } else if (action === 'reject') {
        const reason = (body.reason || 'Payment could not be confirmed').toString().trim();
        const updated = await updateBookingRecord(existing.id, {
          status: 'cancelled',
          paymentStatus: 'REJECTED',
          escrowStatus: 'Refunded',
        });

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: `Booking payment rejected for #${existing.bookingReference}.`,
            booking: updated,
            reason,
          })
        );
      } else {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'Invalid action. Expected "confirm" or "reject".' }));
      }
    } catch (err: any) {
      console.error('Error updating booking payment:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to update booking payment: ' + (err.message || 'Database error'),
        })
      );
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
