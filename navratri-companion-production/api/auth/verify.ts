import { verifySessionToken, parseRequestBody } from './_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    let token = '';

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // Check body or query params if not in header
    if (!token && req.method === 'POST') {
      const body = await parseRequestBody(req);
      token = (body.token || '').toString().trim();
    }

    if (!token && req.query?.token) {
      token = (req.query.token as string).trim();
    }

    if (!token) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ valid: false, errorMessage: 'No session token provided' }));
    }

    const verification = verifySessionToken(token);
    if (!verification.valid || !verification.payload) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ valid: false, errorMessage: 'Invalid or expired session' }));
    }

    const masterAdminUserId = (
      process.env.MASTER_ADMIN_USER_ID ||
      'parthjunior23'
    ).trim();

    const masterAdminEmail = (
      process.env.MASTER_ADMIN_EMAIL ||
      'owner@navratricompanion.com'
    ).trim();

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        valid: true,
        account: {
          id: 'adm-master-owner',
          userId: verification.payload.userId || masterAdminUserId,
          name: 'Master Platform Administrator',
          email: masterAdminEmail,
          role: verification.payload.role || 'owner',
          adminRole: verification.payload.adminRole || 'super_admin',
        },
      })
    );
  } catch (error) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ valid: false, errorMessage: 'Token verification error' }));
  }
}
