import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';

import loginHandler from './api/auth/login.ts';
import verifyHandler from './api/auth/verify.ts';
import logoutHandler from './api/auth/logout.ts';
import registerHandler from './api/auth/register.ts';
import submitPaymentHandler from './api/payments/submit-registration.ts';
import paymentApprovalsHandler from './api/admin/payment-approvals.ts';
import approvePaymentHandler from './api/admin/approve-payment.ts';
import rejectPaymentHandler from './api/admin/reject-payment.ts';
import usersHandler from './api/admin/users.ts';
import profileHandler from './api/users/profile.ts';
import uploadHandler, { serveUpload } from './api/upload.ts';
import applicationsHandler from './api/admin/applications.ts';
import approveApplicationHandler from './api/admin/approve-application.ts';
import rejectApplicationHandler from './api/admin/reject-application.ts';
import submitApplicationHandler from './api/applications.ts';
import healthHandler from './api/health.ts';
import bookingsHandler from './api/bookings.ts';
import payoutsHandler from './api/payouts.ts';
import complaintsHandler from './api/complaints.ts';
import companionsHandler from './api/companions.ts';
import feesConfigHandler from './api/fees/config.ts';
import paymentsCreateOrderHandler from './api/payments/create-order.ts';
import paymentsVerifyHandler from './api/payments/verify.ts';
import paymentsWebhookHandler from './api/payments/webhook.ts';
import adminTransactionsHandler from './api/admin/transactions.ts';
import adminWaiveFeeHandler from './api/admin/waive-fee.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function apiPlugin(): Plugin {
  const router = async (req: any, res: any, next: any) => {
    const url = (req.url || '').split('?')[0];

    // Static uploads server
    if (url.startsWith('/api/uploads/')) {
      if (serveUpload(req, res)) return;
    }

    if (url === '/api/health') return healthHandler(req, res);
    if (url === '/api/upload') return uploadHandler(req, res);
    if (url === '/api/auth/login') return loginHandler(req, res);
    if (url === '/api/auth/verify') return verifyHandler(req, res);
    if (url === '/api/auth/logout') return logoutHandler(req, res);
    if (url === '/api/auth/register') return registerHandler(req, res);
    if (url === '/api/fees/config') return feesConfigHandler(req, res);
    if (url === '/api/payments/create-order') return paymentsCreateOrderHandler(req, res);
    if (url === '/api/payments/verify') return paymentsVerifyHandler(req, res);
    if (url === '/api/payments/webhook') return paymentsWebhookHandler(req, res);
    if (url === '/api/admin/transactions') return adminTransactionsHandler(req, res);
    if (url === '/api/admin/waive-fee') return adminWaiveFeeHandler(req, res);
    if (url === '/api/payments/submit-registration') return submitPaymentHandler(req, res);
    if (url === '/api/admin/payment-approvals') return paymentApprovalsHandler(req, res);
    if (url === '/api/admin/approve-payment') return approvePaymentHandler(req, res);
    if (url === '/api/admin/reject-payment') return rejectPaymentHandler(req, res);
    if (url === '/api/admin/users') return usersHandler(req, res);
    if (url === '/api/admin/applications') return applicationsHandler(req, res);
    if (url === '/api/admin/approve-application') return approveApplicationHandler(req, res);
    if (url === '/api/admin/reject-application') return rejectApplicationHandler(req, res);
    if (url === '/api/applications') return submitApplicationHandler(req, res);
    if (url === '/api/users/profile') return profileHandler(req, res);
    if (url === '/api/bookings') return bookingsHandler(req, res);
    if (url === '/api/payouts') return payoutsHandler(req, res);
    if (url === '/api/complaints') return complaintsHandler(req, res);
    if (url === '/api/companions') return companionsHandler(req, res);

    next();
  };

  return {
    name: 'unified-api-plugin',
    configureServer(server) {
      server.middlewares.use(router);
    },
    configurePreviewServer(server) {
      server.middlewares.use(router);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
          },
        },
      },
    },
  };
});
