import { clearSessionCookie } from './_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  clearSessionCookie(res);

  res.statusCode = 200;
  return res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
}
