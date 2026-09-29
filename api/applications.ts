import { parseRequestBody } from './auth/_authUtils.ts';
import { createApplicationRecord, HostApplicantRecord } from './_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const body = await parseRequestBody(req);
    const name = (body.name || '').toString().trim();
    const phone = (body.phone || body.mobile || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const age = parseInt(body.age, 10);
    const dateOfBirth = (body.dateOfBirth || '').toString().trim();
    const bio = (body.bio || '').toString().trim();
    const profilePhoto = (body.profilePhoto || body.avatar || '').toString().trim();
    const aadhaarImage = (body.aadhaarImage || '').toString().trim();
    const selfieImage = (body.selfieImage || '').toString().trim();

    // Field-level validations
    if (!name) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Name is required.' }));
    }

    if (!profilePhoto) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Please upload your profile photo to continue.' }));
    }

    if (!aadhaarImage) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Government ID / Age Verification document is required.' }));
    }

    if (!selfieImage) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Live selfie with ID is required for verification.' }));
    }

    if (isNaN(age) || age < 18) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'You must be at least 18 years old to register.' }));
    }

    if (!bio || bio.length < 10) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, errorMessage: 'Bio must be at least 10 characters long.' }));
    }

    const newApp: HostApplicantRecord = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: body.userId || `host_${Date.now()}`,
      name,
      age,
      dateOfBirth: dateOfBirth || undefined,
      city: body.city || 'Ahmedabad',
      area: body.area || 'Central',
      localityArea: body.localityArea || body.area || 'Central',
      garbaStyle: body.garbaStyle || 'Traditional 2-Taali & 3-Taali',
      appliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      idDocument: body.idDocument || body.aadhaarNumber || 'Govt ID Proof',
      aadhaarImage,
      selfieImage,
      profilePhoto,
      avatar: profilePhoto,
      registrationFeePaid: false,
      faceMatchScore: 'Not performed',
      status: 'pending_review',
      phone,
      email,
      experienceYears: body.experienceYears || '2',
      bio,
      languages: body.languages || 'Gujarati, Hindi, English',
      hourlyRate: Number(body.hourlyRate) || 1200,
      phoneVerified: false,
      reviewStatus: 'Pending Review',
    };

    const saved = await createApplicationRecord(newApp);

    res.statusCode = 201;
    return res.end(
      JSON.stringify({
        success: true,
        message: 'Companion application submitted successfully.',
        application: saved,
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Failed to submit application.',
      })
    );
  }
}
