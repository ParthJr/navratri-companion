import crypto from 'crypto';
import { parseRequestBody } from '../auth/_authUtils.ts';
import {
  getTransactionByOrderId,
  updatePaymentTransactionRecord,
  updateUser,
  updateApplicationRecord,
  logPaymentAuditRecord,
} from '../_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const rawBody = await parseRequestBody(req);
    const event = rawBody.event || 'payment.captured';
    const payload = rawBody.payload || rawBody;
    const paymentEntity = payload.payment?.entity || payload.payment || {};
    const orderId = paymentEntity.order_id || rawBody.orderId;
    const paymentId = paymentEntity.id || rawBody.paymentId;
    const transactionId = paymentEntity.acquirer_data?.rrn || paymentEntity.acquirer_data?.bank_transaction_id || paymentId;

    if (!orderId) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ status: 'ignored', reason: 'Missing order_id' }));
    }

    const transaction = await getTransactionByOrderId(orderId);
    if (!transaction) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ status: 'ignored', reason: 'Order not found' }));
    }

    // Idempotency: if already paid, return 200 immediately
    if (transaction.status === 'PAID') {
      res.statusCode = 200;
      return res.end(JSON.stringify({ status: 'success', message: 'Already processed' }));
    }

    const now = new Date().toISOString();

    if (event === 'payment.captured' || event === 'order.paid') {
      await updatePaymentTransactionRecord(orderId, {
        status: 'PAID',
        paymentId,
        transactionId: transactionId || paymentId,
        paidAt: now,
        notes: `Webhook confirmed payment: ${event}`,
      });

      await updateUser(transaction.userId, {
        accountStatus: 'active',
        paymentStatus: 'Approved',
        feePaid: true,
        loginEnabled: true,
        paymentReference: transactionId || paymentId,
        approvedAt: now,
        approvedBy: 'WEBHOOK',
      });

      try {
        await updateApplicationRecord(transaction.userId, {
          registrationFeePaid: true,
        });
      } catch (e) {}

      await logPaymentAuditRecord(
        'WEBHOOK_PAYMENT_CAPTURED',
        'GATEWAY_WEBHOOK',
        transaction.userId,
        { orderId, paymentId, transactionId, event },
        transaction.id
      );

      res.statusCode = 200;
      return res.end(JSON.stringify({ status: 'success', processed: true }));
    }

    if (event === 'payment.failed') {
      await updatePaymentTransactionRecord(orderId, {
        status: 'FAILED',
        notes: `Webhook payment failed: ${paymentEntity.error_description || 'Gateway reported failure'}`,
      });

      await logPaymentAuditRecord(
        'WEBHOOK_PAYMENT_FAILED',
        'GATEWAY_WEBHOOK',
        transaction.userId,
        { orderId, paymentId, error: paymentEntity.error_description },
        transaction.id
      );

      res.statusCode = 200;
      return res.end(JSON.stringify({ status: 'success', processed: true }));
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({ status: 'ignored', event }));
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.statusCode = 200; // Return 200 so gateways don't spam retries on non-recoverable errors
    return res.end(JSON.stringify({ status: 'error', message: err.message }));
  }
}
