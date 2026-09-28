import { getUserByIdentifier, getUserProfile, upsertUserProfile } from '../_db.ts';
import { parseRequestBody } from '../auth/_authUtils.ts';

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

      const mergedProfile = {
        userId: user?.userId || profile?.userId || identifier,
        name: profile?.name || user?.name || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || user?.phone || '',
        city: profile?.city || user?.city || 'Ahmedabad',
        age: profile?.age,
        gender: profile?.gender,
        bio: profile?.bio || '',
        emergencyContactName: profile?.emergencyContactName,
        emergencyContactPhone: profile?.emergencyContactPhone,
        emergencyContactRelation: profile?.emergencyContactRelation,
        preferredLocations: profile?.preferredLocations || [],
        preferredGarbaStyle: profile?.preferredGarbaStyle,
        avatarUrl: profile?.avatarUrl || user?.selfieImage,
        hasCompletedProfile: Boolean(profile?.age && profile?.gender),
        accountStatus: user?.accountStatus || 'active',
        paymentStatus: user?.paymentStatus || 'approved',
        feePaid: user?.feePaid ?? true,
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
        age: body.age ? parseInt(body.age, 10) : undefined,
        gender: body.gender,
        bio: body.bio || '',
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelation: body.emergencyContactRelation,
        preferredLocations: body.preferredLocations || [],
        preferredGarbaStyle: body.preferredGarbaStyle,
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
