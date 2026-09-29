import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Build revision: 2026-09-29-supa-srk

// Import all API route handlers
import healthHandler from './api/health.ts';
import uploadHandler from './api/upload.ts';
import applicationsHandler from './api/applications.ts';
import bookingsHandler from './api/bookings.ts';
import companionsHandler from './api/companions.ts';
import complaintsHandler from './api/complaints.ts';
import payoutsHandler from './api/payouts.ts';
import adminApplicationsHandler from './api/admin/applications.ts';
import adminApproveApplicationHandler from './api/admin/approve-application.ts';
import adminApprovePaymentHandler from './api/admin/approve-payment.ts';
import adminPaymentApprovalsHandler from './api/admin/payment-approvals.ts';
import adminRejectApplicationHandler from './api/admin/reject-application.ts';
import adminRejectPaymentHandler from './api/admin/reject-payment.ts';
import adminUsersHandler from './api/admin/users.ts';
import authLoginHandler from './api/auth/login.ts';
import authLogoutHandler from './api/auth/logout.ts';
import authRegisterHandler from './api/auth/register.ts';
import authVerifyHandler from './api/auth/verify.ts';
import paymentsSubmitRegistrationHandler from './api/payments/submit-registration.ts';
import usersProfileHandler from './api/users/profile.ts';
import feesConfigHandler from './api/fees/config.ts';
import paymentsCreateOrderHandler from './api/payments/create-order.ts';
import paymentsVerifyHandler from './api/payments/verify.ts';
import paymentsWebhookHandler from './api/payments/webhook.ts';
import adminTransactionsHandler from './api/admin/transactions.ts';
import adminWaiveFeeHandler from './api/admin/waive-fee.ts';
import adminGeneratePasswordHandler from './api/admin/generate-password.ts';
import authChangePasswordHandler from './api/auth/change-password.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Adapt Vercel-style (req, res) handlers for Express
const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    await handler(req, res);
  } catch (err: any) {
    console.error(`API Error on ${req.method} ${req.path}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, errorMessage: err.message || 'Internal Server Error' });
    }
  }
};

// Register API routes
app.all('/api/health', adapt(healthHandler));
app.all('/api/upload', adapt(uploadHandler));
app.all('/api/applications', adapt(applicationsHandler));
app.all('/api/bookings', adapt(bookingsHandler));
app.all('/api/companions', adapt(companionsHandler));
app.all('/api/complaints', adapt(complaintsHandler));
app.all('/api/payouts', adapt(payoutsHandler));
app.all('/api/admin/applications', adapt(adminApplicationsHandler));
app.all('/api/admin/approve-application', adapt(adminApproveApplicationHandler));
app.all('/api/admin/approve-payment', adapt(adminApprovePaymentHandler));
app.all('/api/admin/payment-approvals', adapt(adminPaymentApprovalsHandler));
app.all('/api/admin/reject-application', adapt(adminRejectApplicationHandler));
app.all('/api/admin/reject-payment', adapt(adminRejectPaymentHandler));
app.all('/api/admin/users', adapt(adminUsersHandler));
app.all('/api/admin/transactions', adapt(adminTransactionsHandler));
app.all('/api/admin/waive-fee', adapt(adminWaiveFeeHandler));
app.all('/api/admin/generate-password', adapt(adminGeneratePasswordHandler));
app.all('/api/admin/users/generate-password', adapt(adminGeneratePasswordHandler));
app.all('/api/auth/login', adapt(authLoginHandler));
app.all('/api/auth/logout', adapt(authLogoutHandler));
app.all('/api/auth/register', adapt(authRegisterHandler));
app.all('/api/auth/verify', adapt(authVerifyHandler));
app.all('/api/auth/change-password', adapt(authChangePasswordHandler));
app.all('/api/fees/config', adapt(feesConfigHandler));
app.all('/api/payments/create-order', adapt(paymentsCreateOrderHandler));
app.all('/api/payments/verify', adapt(paymentsVerifyHandler));
app.all('/api/payments/webhook', adapt(paymentsWebhookHandler));
app.all('/api/payments/submit-registration', adapt(paymentsSubmitRegistrationHandler));
app.all('/api/users/profile', adapt(usersProfileHandler));

// Serve Vite production build static assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// SPA catch-all fallback: send index.html for all non-API GET routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
