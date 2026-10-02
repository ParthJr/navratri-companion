import { getUserByIdentifier, getUserProfile, upsertUserProfile } from '../_db.ts';
import { parseRequestBody, getTokenFromRequest, verifySessionToken } from '../auth/_authUtils.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const identifier = url.searchParams.get('userId') || url.searchParams.get('identifier') || '';

      if (!identifier) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'User ID is required' }));
      }

      // Check if extended profile exists
      const profile = await getUserProfile(identifier);
      const user = await getUserByIdentifier(identifier);

      if (!user && !profile) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, errorMessage: 'User not found' }));
      }

      // Verify caller authorization
      const token = getTokenFromRequest(req);
      const auth = token ? verifySessionToken(token) : { valid: false };
      const authUserId = auth.valid && auth.payload ? auth.payload.userId.toLowerCase().trim() : null;
      const authRole = auth.valid && auth.payload ? (auth.payload.role || '').toLowerCase().trim() : null;
      const adminRole = auth.valid && auth.payload ? (auth.payload.adminRole || '').toLowerCase().trim() : null;
      const isAdmin = authRole === 'owner' || authRole === 'admin' || (adminRole ? adminRole.includes('admin') : false);
      const isOwner = authUserId && authUserId === (user?.userId || identifier).toLowerCase().trim();

      const canViewPii = isAdmin || isOwner;

      const mergedProfile = {
        userId: user?.userId || profile?.userId || identifier,
        name: profile?.name || user?.name || '',
        email: canViewPii ? (profile?.email || user?.email || '') : undefined,
        phone: canViewPii ? (profile?.phone || user?.phone || '') : undefined,
        city: profile?.city || user?.city || 'Ahmedabad',
        age: profile?.age,
        gender: profile?.gender,
        bio: profile?.bio || '',
        emergencyContactName: canViewPii ? profile?.emergencyContactName : undefined,
        emergencyContactPhone: canViewPii ? profile?.emergencyContactPhone : undefined,
        emergencyContactRelation: canViewPii ? profile?.emergencyContactRelation : undefined,
        preferredLocations: profile?.preferredLocations || [],
        preferredGarbaStyle: profile?.preferredGarbaStyle,
        avatarUrl: profile?.avatarUrl || user?.selfieImage,
        hasCompletedProfile: Boolean(profile?.age && profile?.gender),
        accountStatus: canViewPii ? (user?.accountStatus || 'active') : undefined,
        paymentStatus: canViewPii ? (user?.paymentStatus || 'approved') : undefined,
        feePaid: canViewPii ? (user?.feePaid ?? true) : undefined,
      };

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          profile: mergedProfile,
        })
      );
    } catch (err: any) {
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to retrieve profile from database.',
        })
      );
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = await parseRequestBody(req);
      const userId = (body.userId || '').toString().trim();

      if (!userId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, errorMessage: 'User ID is required' }));
      }

      const savedProfile = await upsertUserProfile({
        userId,
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        city: body.city || 'Ahmedabad',
        area: body.area,
        age: body.age ? parseInt(body.age, 10) : undefined,
        gender: body.gender,
        bio: body.bio || '',
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelation: body.emergencyContactRelation,
        preferredLocations: body.preferredLocations || [],
        preferredGarbaStyle: body.preferredGarbaStyle || body.garbaStyle,
        garbaStyle: body.garbaStyle || body.preferredGarbaStyle,
        languages: body.languages,
        hourlyRate: body.hourlyRate ? Number(body.hourlyRate) : (body.price2h ? Number(body.price2h) : undefined),
        avatarUrl: body.avatarUrl,
      });

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: 'Profile saved successfully to central database.',
          profile: savedProfile,
        })
      );
    } catch (err: any) {
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to save profile to database.',
        })
      );
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
