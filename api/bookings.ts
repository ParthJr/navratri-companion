import { getAllBookings, createBookingRecord, updateBookingRecord, createPayoutRecord, type BookingRecord } from './_db.ts';
import { parseRequestBody } from './auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const customerId = url.searchParams.get('customerId') || undefined;
      const companionId = url.searchParams.get('companionId') || undefined;

      const bookings = await getAllBookings({ customerId, companionId });
      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, bookings, total: bookings.length }));
    } catch (e: any) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Failed to retrieve bookings' }));
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);

      // Handle OTP verification action
      if (body.action === 'verify_otp') {
        const { bookingId, otp } = body;
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

        if (found.completionOtp !== otp.trim()) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, errorMessage: 'Invalid Completion OTP. Please check the 4-digit code provided by the customer.' }));
        }

        // Verified! Update booking
        const updated = await updateBookingRecord(found.id, {
          status: 'completed',
          otpVerified: true,
          completedAt: new Date().toISOString(),
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
          createdAt: new Date().toISOString(),
        });

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: 'Completion OTP verified successfully! Booking completed. Payout queued for Platform Operations approval.',
            booking: updated,
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
