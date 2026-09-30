import { parseRequestBody, hashPassword } from './_authUtils.ts';
import {
  createUser,
  getUserByIdentifier,
  createApplicationRecord,
  type UserRecord,
  type HostApplicantRecord,
} from '../_db.ts';

// Helper to calculate age from Date of Birth
function calculateAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

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
    const userId = (body.userId || '').toString().trim();
    const password = (body.password || '').toString().trim();
    const city = (body.city || 'Ahmedabad, Gujarat').toString().trim();
    const roleInput = (body.role || '').toString().trim().toLowerCase();
    const role: 'customer' | 'companion' = roleInput === 'companion' ? 'companion' : 'customer';
    const policyConsent = body.policyConsent || null;
    const profilePhoto = (body.profilePhoto || '').toString().trim();
    const dateOfBirth = (body.dateOfBirth || '').toString().trim();
    let age = body.age ? parseInt(String(body.age), 10) : null;

    // 1. Basic Fields Validation
    if (!name || !phone || !email || !userId || !password) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'All fields (Name, Phone, Email, User ID, Password) are required.',
        })
      );
    }

    if (userId.length < 3) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'User ID must be at least 3 characters long.',
        })
      );
    }

    if (password.length < 4) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Password must be at least 4 characters long.',
        })
      );
    }

    // 2. Profile Photo is Mandatory for EVERY person registering
    if (!profilePhoto) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Please upload your profile photo to continue.',
        })
      );
    }

    // 3. Age Verification: Date of Birth OR Age >= 18
    if (dateOfBirth) {
      const calculated = calculateAge(dateOfBirth);
      if (calculated !== null) {
        age = calculated;
      }
    }

    if (age === null || isNaN(age)) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Date of Birth or Age is required to register.',
        })
      );
    }

    if (age < 18) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'You must be at least 18 years old to register.',
        })
      );
    }

    // 4. Companion Specific Mandatory Validations
    let bio = (body.bio || '').toString().trim();
    let languages = (body.languages || '').toString().trim();
    let garbaStyle = (body.garbaStyle || '').toString().trim();
    let availableCities = (body.availableCities || body.city || 'Ahmedabad').toString().trim();
    let hourlyRate = body.hourlyRate ? Number(body.hourlyRate) : null;
    let aadhaarImage = (body.aadhaarImage || '').toString().trim();
    let selfieImage = (body.selfieImage || '').toString().trim();
    let idDocument = (body.idDocument || body.aadhaarNumber || 'Govt ID Proof').toString().trim();

    if (role === 'companion') {
      if (!aadhaarImage) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Government ID / Age Verification document upload is required for companions.',
          })
        );
      }

      if (!selfieImage) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Live Selfie with ID is required for face verification.',
          })
        );
      }

      if (!bio || bio.length < 10) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Bio / About Me must be at least 10 characters long.',
          })
        );
      }

      if (!hourlyRate || hourlyRate <= 0) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Hourly or session rate is required for companions.',
          })
        );
      }

      if (!languages) {
        languages = 'Gujarati, Hindi, English';
      }
      if (!garbaStyle) {
        garbaStyle = 'Traditional 2-Taali & 3-Taali';
      }
    }

    // Check if user already exists in Central Database
    try {
      const existing = await getUserByIdentifier(userId);
      if (existing) {
        res.statusCode = 409;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: `User ID "${userId}" is already registered. Please choose another User ID.`,
          })
        );
      }
    } catch (dbErr: any) {
      console.error('Error checking existing user in database:', dbErr);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Unable to verify User ID availability with the database. Please try again.',
        })
      );
    }

    const now = new Date().toISOString();

    const isCustomer = role === 'customer';

    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: userId,
      name: name,
      email: email,
      mobile: phone,
      phone: phone,
      password: hashPassword(password),
      role: role,
      city: city,
      // Customers: Free (₹0), active immediately, no Super Admin approval needed.
      // Companions: Paid (₹499), pending payment/approval, requires Admin verification.
      accountStatus: isCustomer ? 'active' : 'pending_payment',
      paymentStatus: isCustomer ? 'approved' : 'pending',
      feePaid: isCustomer ? true : false,
      profileStatus: isCustomer ? 'completed' : 'created',
      verificationStatus: isCustomer ? 'verified' : (aadhaarImage && selfieImage ? 'id_submitted' : 'unverified'),
      loginEnabled: isCustomer ? true : false,
      profilePhoto: profilePhoto,
      dateOfBirth: dateOfBirth || undefined,
      age: age,
      bio: bio || undefined,
      languages: languages || undefined,
      garbaStyle: garbaStyle || undefined,
      availableCities: availableCities || undefined,
      hourlyRate: hourlyRate || undefined,
      idDocument: idDocument || undefined,
      faceMatchScore: 'Not performed',
      phoneVerified: isCustomer ? true : false,
      reviewStatus: isCustomer ? 'Approved' : 'Pending Review',
      aadhaarImage: aadhaarImage || '',
      selfieImage: selfieImage || '',
      policyConsent: policyConsent,
      paymentReference: '',
      createdAt: now,
      updatedAt: now,
    };

    // Save strictly to Central Persistent Database
    let savedUser: UserRecord;
    try {
      savedUser = await createUser(newUser);
    } catch (saveErr: any) {
      console.error('Database write error during registration:', saveErr);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Unable to save your registration in the central database. Please try again.',
        })
      );
    }

    // If companion, create real host application record in database
    if (role === 'companion') {
      try {
        const companionApp: HostApplicantRecord = {
          id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: savedUser.userId,
          name: savedUser.name,
          age: savedUser.age || 22,
          dateOfBirth: savedUser.dateOfBirth,
          city: savedUser.city,
          area: body.area || 'Central',
          localityArea: body.area || 'Central',
          garbaStyle: savedUser.garbaStyle || 'Traditional 2-Taali & 3-Taali',
          appliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          idDocument: savedUser.idDocument || 'Govt ID Proof',
          aadhaarImage: savedUser.aadhaarImage,
          selfieImage: savedUser.selfieImage,
          profilePhoto: savedUser.profilePhoto,
          avatar: savedUser.profilePhoto,
          registrationFeePaid: false,
          faceMatchScore: 'Not performed',
          status: 'pending_review',
          phone: savedUser.phone,
          email: savedUser.email,
          experienceYears: body.experienceYears || '2',
          bio: savedUser.bio,
          languages: savedUser.languages,
          hourlyRate: savedUser.hourlyRate,
          phoneVerified: false,
          reviewStatus: 'Pending Review',
          createdAt: now,
          updatedAt: now,
        };
        await createApplicationRecord(companionApp);
      } catch (appErr) {
        console.error('Companion application database error:', appErr);
        // Note: user was registered, but host_applications failed - log for attention
      }
    }

    res.statusCode = 201;
    return res.end(
      JSON.stringify({
        success: true,
        user: {
          id: savedUser.id,
          userId: savedUser.userId,
          name: savedUser.name,
          email: savedUser.email,
          phone: savedUser.phone,
          role: savedUser.role,
          accountStatus: savedUser.accountStatus,
          paymentStatus: savedUser.paymentStatus,
          feePaid: savedUser.feePaid,
          loginEnabled: savedUser.loginEnabled,
          city: savedUser.city,
          profilePhoto: savedUser.profilePhoto,
          dateOfBirth: savedUser.dateOfBirth,
          age: savedUser.age,
          paymentReference: savedUser.paymentReference || '',
        },
      })
    );
  } catch (err: any) {
    console.error('Registration handler fatal error:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Registration failed due to a server error. Please try again.',
      })
    );
  }
}
