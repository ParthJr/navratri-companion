import { getAllPaymentTransactions } from '../_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const transactions = await getAllPaymentTransactions();
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        transactions,
        total: transactions.length,
      })
    );
  } catch (err: any) {
    console.error('Error fetching admin transactions:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: err.message || 'Failed to fetch transactions',
      })
    );
  }
}
