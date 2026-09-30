import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Build revision: 2026-09-30-prod-server-ready

// Import all API route handlers
import healthHandler from './api/health.ts';
import uploadHandler, { serveUpload } from './api/upload.ts';
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
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for API routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Adapt Vercel-style (req, res) handlers for Express
const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    // Preserve full pathname and search query for URL parsers
    req.url = req.originalUrl || req.url;
    // Merge URL route params into req.query if not already present
    if (req.params && typeof req.params === 'object') {
      req.query = { ...req.params, ...(req.query || {}) };
    }
    await handler(req, res);
  } catch (err: any) {
    console.error(`API Error on ${req.method} ${req.originalUrl || req.url}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, errorMessage: err.message || 'Internal Server Error' });
    }
  }
};

// Static uploads handler fallback
app.use('/api/uploads', (req, res, next) => {
  if (serveUpload(req, res)) return;
  next();
});

// Register all API routes
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
app.all('/api/admin/users/:userId/generate-password', adapt(adminGeneratePasswordHandler));
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

// Serve Vite production build static assets if present
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA catch-all fallback: send index.html for all non-API GET routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Navratri Companion</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; text-align: center; background: #12001f; color: #fff; }
            h1 { color: #ff8c42; }
            p { color: #cbd5e1; }
            code { background: #201033; padding: 4px 8px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <h1>Navratri Companion Server is Active</h1>
          <p>API endpoints are live. Production assets are compiling.</p>
          <p>Health probe: <a href="/api/health" style="color:#ff8c42">/api/health</a></p>
        </body>
      </html>
    `);
  }
});

// Process-level exception handling to prevent unexpected server terminations
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Navratri Companion server running at http://0.0.0.0:${PORT}`);
  console.log(`Database target: ${process.env.SUPABASE_URL || 'Local / Not set'}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('Server terminated cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
