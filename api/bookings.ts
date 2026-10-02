import { getAllBookings, createBookingRecord, updateBookingRecord, createPayoutRecord, type BookingRecord } from './_db.ts';
import { parseRequestBody, getTokenFromRequest, verifySessionToken } from './auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const customerId = (url.searchParams.get('customerId') || '').trim();
      const companionId = (url.searchParams.get('companionId') || '').trim();

      // Check caller's authentication and role from session token
      const token = getTokenFromRequest(req);
      const auth = token ? verifySessionToken(token) : { valid: false };
      const authUserId = auth.valid && auth.payload ? auth.payload.userId.toLowerCase().trim() : null;
      const authRole = auth.valid && auth.payload ? (auth.payload.role || '').toLowerCase().trim() : null;
      const adminRole = auth.valid && auth.payload ? (auth.payload.adminRole || '').toLowerCase().trim() : null;
      const isAdmin = authRole === 'owner' || authRole === 'admin' || (adminRole ? adminRole.includes('admin') : false);
      const isCompanionCaller = authRole === 'companion' || Boolean(companionId && !customerId);

      const allBookings = await getAllBookings({
        customerId: customerId || undefined,
        companionId: companionId || undefined,
      });

      // Role-based redaction: COMPANIONS must NEVER receive customer Completion OTP
      const sanitizedBookings = allBookings.map((b) => {
        const bCustId = (b.customerId || '').toLowerCase().trim();

        // Customer who owns this booking can view their own completion OTP
        const isCustomerOwner =
          !isCompanionCaller &&
          ((authUserId && authUserId === bCustId) ||
           (customerId && customerId.toLowerCase().trim() === bCustId));

        const canViewOtp = isAdmin || isCustomerOwner;

        return {
          ...b,
          completionOtp: canViewOtp ? b.completionOtp : undefined,
        };
      });

      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, bookings: sanitizedBookings, total: sanitizedBookings.length }));
    } catch (e: any) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: `Failed to retrieve bookings: ${e.message || e}` }));
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);

      // Handle OTP verification action (Companion completes session)
      if (body.action === 'verify_otp') {
        const { bookingId, otp, companionId: claimedCompanionId } = body;
        if (!bookingId || !otp) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, errorMessage: 'Booking ID and 4-digit OTP are required.' }));
        }

        const allBookings = await getAllBookings();
        const found = allBookings.find((b) => b.id === bookingId || b.bookingReference === bookingId);
        if (!found) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, errorMessage: 'Booking not found.' }));
        }

        // Prevent cross-account verification:
        const token = getTokenFromRequest(req);
        const auth = token ? verifySessionToken(token) : { valid: false };
        const authUserId = auth.valid && auth.payload ? auth.payload.userId.toLowerCase().trim() : null;
        const authRole = auth.valid && auth.payload ? (auth.payload.role || '').toLowerCase().trim() : null;
        const adminRole = auth.valid && auth.payload ? (auth.payload.adminRole || '').toLowerCase().trim() : null;
        const isAdmin = authRole === 'owner' || authRole === 'admin' || (adminRole ? adminRole.includes('admin') : false);

        // Customers CANNOT verify their own OTP! Companion must verify it.
        if (authRole === 'customer' && !isAdmin) {
          res.statusCode = 403;
          return res.end(
            JSON.stringify({
              success: false,
              errorMessage: 'Customers cannot verify completion OTP. Please provide this OTP to your companion.',
            })
          );
        }

        // Check companion ownership: companion must match the booking
        const effectiveCompanionId = authRole === 'companion' ? authUserId : (claimedCompanionId || '').toLowerCase().trim();
        if (effectiveCompanionId && !isAdmin) {
          const bookingCompId = (found.companionId || '').toLowerCase().trim();
          if (bookingCompId && effectiveCompanionId !== bookingCompId) {
            res.statusCode = 403;
            return res.end(
              JSON.stringify({
                success: false,
                errorMessage: 'Unauthorized: You are not the assigned companion for this booking.',
              })
            );
          }
        }

        // Check if OTP was already verified / session already completed
        if (found.status === 'completed' || found.otpVerified === true) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              success: false,
              errorMessage: 'This session has already been completed and verified. OTP cannot be reused.',
            })
          );
        }

        if (found.status === 'cancelled') {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              success: false,
              errorMessage: 'Cannot complete a cancelled booking.',
            })
          );
        }

        const cleanInputOtp = String(otp).trim();
        const cleanActualOtp = String(found.completionOtp || '').trim();

        if (!cleanActualOtp || cleanInputOtp !== cleanActualOtp) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              success: false,
              errorMessage: 'Invalid Completion OTP. Please check the 4-digit code provided by the customer.',
            })
          );
        }

        // Verified! Update booking
        const now = new Date().toISOString();
        const updated = await updateBookingRecord(found.id, {
          status: 'completed',
          otpVerified: true,
          completionOtp: found.completionOtp,
          completedAt: now,
          payoutStatus: 'PENDING_ADMIN_APPROVAL',
        });

        // Queue payout for super admin approval
        await createPayoutRecord({
          id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          bookingId: found.id,
          companionId: found.companionId,
          companionName: found.companionName,
          companionUpi: found.companionUpi || `${found.companionName.toLowerCase().replace(/\s+/g, '')}@upi`,
          amount: found.companionEarnings,
          platformFee: found.platformFee,
          grossAmount: found.totalPrice,
          status: 'PENDING_ADMIN_APPROVAL',
          createdAt: now,
        });

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: 'Completion OTP verified successfully! Session completed.',
            booking: updated,
            completion_otp_status: 'VERIFIED',
            booking_status: 'COMPLETED',
          })
        );
      }

      // Handle Admin Payment Verification action
      if (body.action === 'verify_payment') {
        const { bookingId } = body;
        if (!bookingId) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, errorMessage: 'Booking ID is required' }));
        }

        const updated = await updateBookingRecord(bookingId, {
          status: 'confirmed',
          paymentStatus: 'PAID',
          escrowStatus: 'Held in Escrow',
        });

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Booking payment verified and confirmed!', booking: updated }));
      }

      // Normal New Booking Creation
      const {
        companionId,
        companionName,
        companionPhone,
        companionUpi,
        companionAge,
        companionCity,
        companionAvatar,
        customerId,
        customerName,
        customerPhone,
        date,
        rawDate,
        timeSlot,
        durationPackage = '2 Hours',
        venue,
        city = 'Ahmedabad',
        basePrice = 1200,
        platformFee = 50,
        paymentReference,
      } = body;

      if (!companionId || !companionName || !customerName || !date || !timeSlot || !venue) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'All booking fields are required.' }));
      }

      const numBase = Number(basePrice) || 1200;
      const numFee = Number(platformFee) || 70;
      const total = numBase + numFee;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingRef = `NC-2026-${randomSuffix}`;
      const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const newBooking: BookingRecord = {
        id: `book_${Date.now()}_${randomSuffix}`,
        bookingReference: bookingRef,
        customerId: customerId || 'guest',
        customerName: customerName.trim(),
        customerPhone: customerPhone || '',
        companionId,
        companionName,
        companionPhone: companionPhone || '',
        companionUpi: companionUpi || '',
        companionAge: companionAge ? Number(companionAge) : 22,
        companionCity: companionCity || city,
        companionAvatar: companionAvatar || '',
        date,
        rawDate: rawDate || date,
        timeSlot,
        durationPackage,
        venue,
        city,
        basePrice: numBase,
        platformFee: numFee,
        totalPrice: total,
        companionEarnings: numBase,
        status: 'pending',
        paymentStatus: 'PENDING_CONFIRMATION',
        paymentReference: paymentReference || `UPI-${bookingRef}`,
        escrowStatus: 'Held in Escrow',
        completionOtp: completionOtp,
        otpVerified: false,
        payoutStatus: 'escrow_held',
        createdAt: new Date().toISOString(),
      };

      const saved = await createBookingRecord(newBooking);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: 'Booking request created successfully. Platform Admin will verify payment.',
          booking: saved,
        })
      );
    } catch (err: any) {
      console.error('Booking error:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Failed to process booking request.' }));
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
