import crypto from 'crypto';

// Secret key for HMAC token signing (uses server env or secure fallback)
const getAuthSecret = () => {
  return (
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.MASTER_ADMIN_PASSWORD ||
    'navratri-companion-master-admin-secure-vault-2026'
  );
};

export interface TokenPayload {
  userId: string;
  role: string;
  adminRole?: string;
  iat: number;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHashOrPlain: string): boolean {
  if (!password || !storedHashOrPlain) return false;
  if (storedHashOrPlain.startsWith('scrypt:')) {
    const parts = storedHashOrPlain.split(':');
    if (parts.length !== 3) return false;
    const [, salt, key] = parts;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }
  // Plain text fallback for initial migration
  return password === storedHashOrPlain;
}

export function setSessionCookie(res: any, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieVal = `navratri_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookieVal);
}

export function clearSessionCookie(res: any): void {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieVal = `navratri_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookieVal);
}

export function getTokenFromRequest(req: any): string | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = req.headers?.cookie;
  if (cookieHeader && typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/navratri_session=([^;]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

export function verifyAdminAuthorization(req: any): boolean {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  const verified = verifySessionToken(token);
  if (!verified.valid || !verified.payload) return false;
  const role = (verified.payload.role || '').toLowerCase();
  const adminRole = (verified.payload.adminRole || '').toLowerCase();
  return (
    role === 'owner' ||
    role === 'admin' ||
    adminRole === 'super_admin' ||
    adminRole.includes('admin')
  );
}

export function requireAdminAuth(req: any, res: any): boolean {
  if (!verifyAdminAuthorization(req)) {
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Unauthorized: Valid Platform Operations Admin authentication required.',
      })
    );
    return false;
  }
  return true;
}

export function generateSessionToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const iat = Date.now();
  const exp = iat + 7 * 24 * 60 * 60 * 1000; // 7 days validity
  const fullPayload: TokenPayload = { ...payload, iat, exp };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; payload?: TokenPayload } {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false };
  }

  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    );

    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (e) {
    return { valid: false };
  }
}

export async function parseRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}
