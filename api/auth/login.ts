import { generateSessionToken, parseRequestBody, verifyPassword, setSessionCookie } from './_authUtils.ts';
import { getUserByIdentifier, updateUser, getSuperAdminUser, SUPER_ADMIN_IDENTIFIERS } from '../_db.ts';

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

    // 1. Production Database Authentication for Super Admin / Platform Owner
    const isMasterAdminId = SUPER_ADMIN_IDENTIFIERS.includes(cleanIdentifierLower);

    if (isMasterAdminId) {
      let adminRecord;
      try {
        adminRecord = await getSuperAdminUser();
      } catch (adminErr: any) {
        console.error('Error fetching Super Admin record from DB:', adminErr);
      }

      if (!adminRecord) {
        res.statusCode = 503;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Authentication service temporarily unavailable. Please try again.',
          })
        );
      }

      const isPasswordMatch = verifyPassword(rawPassword, adminRecord.password || '');

      if (isPasswordMatch) {
        const account = {
          id: adminRecord.id || 'adm-master-owner',
          userId: adminRecord.userId || 'superadmin',
          name: adminRecord.name || 'Master Platform Administrator',
          email: adminRecord.email || 'owner@navratricompanion.com',
          phone: adminRecord.phone || '+91 99000 00000',
          role: 'owner' as const,
          adminRole: 'super_admin' as const,
          status: 'active' as const,
          avatarUrl:
            adminRecord.profilePhoto ||
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

      // Check temporary password expiration (strictly 24 hours validity)
      if (dbUser.temporaryPassword && dbUser.passwordExpiresAt) {
        const expiryTime = new Date(dbUser.passwordExpiresAt).getTime();
        if (Date.now() > expiryTime) {
          res.statusCode = 403;
          return res.end(
            JSON.stringify({
              success: false,
              passwordExpired: true,
              errorMessage: 'Your temporary password has expired. Please contact Super Admin to generate a new password.',
            })
          );
        }
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
      // ONLY enforce registration fee approval for COMPANIONS! Customers are free (₹0) and active immediately.
      const isCompanion = (dbUser.role || '').toLowerCase() === 'companion';
      if (isCompanion) {
        if (!dbUser.feePaid || pStatus !== 'approved' || aStatus !== 'active') {
          // Check if companion has already submitted ₹499 payment / transaction ID
          const hasSubmittedPayment = Boolean(
            dbUser.transactionId ||
            dbUser.paymentSubmittedAt ||
            pStatus === 'payment_submitted' ||
            aStatus === 'pending_approval' ||
            (dbUser.paymentReference && dbUser.paymentReference.length > 5)
          );

          if (hasSubmittedPayment) {
            // Already paid ₹499, waiting for Super Admin approval
            // Do NOT ask them to pay ₹499 again! Show their pending approval status.
            res.statusCode = 403;
            return res.end(
              JSON.stringify({
                success: false,
                paymentPendingApproval: true,
                role: 'companion',
                status: 'pending_approval',
                errorMessage: `Your ₹499 Companion Registration payment (${dbUser.transactionId ? `Transaction ID: ${dbUser.transactionId}` : 'submitted'}) is waiting for Super Admin approval. Please do not submit payment again. Your profile will be activated once verified.`,
              })
            );
          } else {
            // Has not completed ₹499 registration fee
            // Show the companion registration/payment continuation. Show "Continue to Registration Fee".
            res.statusCode = 403;
            return res.end(
              JSON.stringify({
                success: false,
                requiresPayment: true,
                role: 'companion',
                status: 'pending_payment',
                account: {
                  userId: dbUser.userId,
                  name: dbUser.name,
                  email: dbUser.email,
                  phone: dbUser.phone || dbUser.mobile,
                  role: 'companion',
                  city: dbUser.city || 'Ahmedabad',
                  status: 'pending_payment',
                  feePaid: false,
                },
                errorMessage: 'Companion registration fee (₹499) payment is required to complete your registration.',
              })
            );
          }
        }
      } else {
        // Customer account: auto-heal any legacy records where customer had pending_payment
        if (!dbUser.feePaid || aStatus !== 'active' || pStatus !== 'approved') {
          dbUser.feePaid = true;
          dbUser.accountStatus = 'active';
          dbUser.paymentStatus = 'approved';
          dbUser.loginEnabled = true;
          updateUser(dbUser.userId, {
            accountStatus: 'active',
            paymentStatus: 'approved',
            feePaid: true,
          }).catch((err) => console.warn('Customer auto-heal update warning:', err));
        }
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
        mustChangePassword: Boolean(dbUser.mustChangePassword),
        temporaryPassword: Boolean(dbUser.temporaryPassword),
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
          mustChangePassword: Boolean(dbUser.mustChangePassword),
          temporaryPassword: Boolean(dbUser.temporaryPassword),
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
