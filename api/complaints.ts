import { getAllComplaints, createComplaintRecord, updateComplaintRecord } from './_db.ts';
import { parseRequestBody } from './auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'GET') {
    try {
      const complaints = await getAllComplaints();
      const openCount = complaints.filter((c) => c.status === 'open' || c.status === 'investigating').length;
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          complaints,
          openCount,
          total: complaints.length,
        })
      );
    } catch (e: any) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Failed to fetch complaints' }));
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);

      // Status update by admin
      if (body.action === 'update_status') {
        const { complaintId, status, resolutionNotes, assignedAdmin } = body;
        if (!complaintId) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, errorMessage: 'Complaint ID is required' }));
        }

        const updated = await updateComplaintRecord(complaintId, {
          status,
          resolutionNotes: resolutionNotes || undefined,
          assignedAdmin: assignedAdmin || undefined,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
        });

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Complaint status updated', complaint: updated }));
      }

      // New complaint submission
      const {
        bookingId,
        reporterType = 'guest',
        reporterName,
        reporterPhone,
        targetName,
        category,
        severity = 'medium',
        subject,
        description,
      } = body;

      if (!reporterName || !targetName || !category || !subject || !description) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'Please complete all required complaint fields.' }));
      }

      const newComplaint = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        bookingId: bookingId || '',
        reporterType,
        reporterName,
        reporterPhone: reporterPhone || '',
        targetName,
        category,
        severity,
        status: 'open' as const,
        subject,
        description,
        createdAt: new Date().toISOString(),
      };

      const saved = await createComplaintRecord(newComplaint);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: 'Grievance ticket created. Dedicated officer will investigate.',
          complaint: saved,
        })
      );
    } catch (e: any) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Failed to process complaint' }));
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
