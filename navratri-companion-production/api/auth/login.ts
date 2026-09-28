import { generateSessionToken, parseRequestBody, verifyPassword, setSessionCookie } from './_authUtils.ts';
import { getUserByIdentifier } from '../_db.ts';

export default async function handler(req: any, res: any) {
  // Set security and CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const body = await parseRequestBody(req);
    const rawIdentifier = (body.identifier || body.userId || body.email || '').toString().trim();
    const rawPassword = (body.password || '').toString().trim();

    if (!rawIdentifier || !rawPassword) {
      res.statusCode = 401;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Invalid User ID or Password.',
        })
      );
    }

    const cleanIdentifierLower = rawIdentifier.toLowerCase();

    // 1. Read Server-Side Environment Variables for Master Admin
    const masterAdminUserId = (
      process.env.MASTER_ADMIN_USER_ID ||
      process.env.VITE_PLATFORM_OWNER_ID ||
      'parthjunior23'
    ).trim();

    const masterAdminEmail = (
      process.env.MASTER_ADMIN_EMAIL ||
      'owner@navratricompanion.com'
    ).trim();

    const masterAdminPassword = (process.env.MASTER_ADMIN_PASSWORD || '').trim();

    // Check identifier against Master Admin User ID, Email, or standard aliases
    const isMasterAdminId =
      cleanIdentifierLower === masterAdminUserId.toLowerCase() ||
      cleanIdentifierLower === masterAdminEmail.toLowerCase() ||
      cleanIdentifierLower === 'admin@navratricompanion.com' ||
      cleanIdentifierLower === 'owner_admin' ||
      cleanIdentifierLower === 'owner' ||
      cleanIdentifierLower === 'superadmin' ||
      cleanIdentifierLower === 'admin';

    if (isMasterAdminId) {
      // Require configured master password on the server
      if (!masterAdminPassword) {
        console.error('CRITICAL: MASTER_ADMIN_PASSWORD is not set on the server.');
        res.statusCode = 500;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Server configuration error: Master Admin credentials unconfigured.',
          })
        );
      }

      const isPasswordMatch = rawPassword === masterAdminPassword;

      if (isPasswordMatch) {
        const account = {
          id: 'adm-master-owner',
          userId: masterAdminUserId,
          name: 'Master Platform Administrator',
          email: masterAdminEmail,
          phone: '+91 99000 00000',
          role: 'owner' as const,
          adminRole: 'super_admin' as const,
          status: 'active' as const,
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        };

        const token = generateSessionToken({
          userId: account.userId,
          role: account.role,
          adminRole: account.adminRole,
        });

        // Set secure HttpOnly session cookie
        setSessionCookie(res, token);

        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            account,
            user: account,
            token,
          })
        );
      } else {
        res.statusCode = 401;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Invalid User ID or Password.',
          })
        );
      }
    }

    // 2. Check Central Persistent Production Database for Registered Users
    let dbUser;
    try {
      dbUser = await getUserByIdentifier(rawIdentifier);
    } catch (dbErr: any) {
      console.error('Database connection error during login:', dbErr);
      res.statusCode = 503;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Authentication service is temporarily unavailable. Please try again.',
        })
      );
    }

    if (dbUser) {
      // Check password using secure hash verification
      const isUserPasswordMatch = verifyPassword(rawPassword, dbUser.password || '');

      if (!isUserPasswordMatch) {
        res.statusCode = 401;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Invalid User ID or Password.',
          })
        );
      }

      const pStatus = (dbUser.paymentStatus || '').toLowerCase();
      const aStatus = (dbUser.accountStatus || '').toLowerCase();

      // Check account & payment verification status
      if (pStatus === 'rejected' || aStatus === 'payment_rejected') {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: `Payment verification was rejected by Platform Operations Admin. Reason: ${
              dbUser.rejectionReason || 'Invalid payment reference number.'
            }`,
            status: 'rejected',
          })
        );
      }

      if (aStatus === 'suspended' || aStatus === 'blocked') {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Account is suspended or blocked. Please contact platform operations.',
          })
        );
      }

      // Check if awaiting payment submission or approval
      if (!dbUser.feePaid || pStatus !== 'approved' || aStatus !== 'active') {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage:
              'Payment verification is pending. Your account will be activated after the Platform Operations Admin confirms your payment.',
            status: dbUser.paymentStatus,
          })
        );
      }

      // Account is approved and active!
      const userAccount = {
        id: dbUser.id || dbUser.userId,
        userId: dbUser.userId,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || dbUser.mobile,
        role: dbUser.role || 'customer',
        city: dbUser.city || 'Ahmedabad',
        status: 'active',
        feePaid: true,
        aadhaarImage: dbUser.aadhaarImage,
        selfieImage: dbUser.selfieImage,
        profilePhoto: dbUser.profilePhoto,
      };

      const token = generateSessionToken({
        userId: userAccount.userId,
        role: userAccount.role,
      });

      setSessionCookie(res, token);

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          account: userAccount,
          user: userAccount,
          token,
        })
      );
    }

    // Invalid credentials: return standard generic error
    res.statusCode = 401;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Invalid User ID or Password.',
      })
    );
  } catch (error) {
    console.error('Fatal error in login handler:', error);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Authentication service temporarily unavailable.',
      })
    );
  }
}
