import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'chuadanga24-super-secret-key-prod-092026';

// Password hashing with scrypt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

// Simple, self-contained secure session token with HMAC-SHA256
export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  expiresAt: number;
}

export function createToken(payload: Omit<SessionPayload, 'expiresAt'>, expiresInHours = 24): string {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const fullPayload: SessionPayload = { ...payload, expiresAt };
  const encodedData = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedData)
    .digest('base64url');
  return `${encodedData}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [encodedData, signature] = token.split('.');
    if (!encodedData || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(encodedData)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(encodedData, 'base64url').toString('utf8'),
    );

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Rate Limiting & Account Lockout
interface LoginAttempt {
  count: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) return { allowed: true };

  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const waitMinutes = Math.ceil((attempt.lockedUntil - now) / (60 * 1000));
    return { allowed: false, waitMinutes };
  }

  // Reset if past 15 minute window
  if (now - attempt.firstAttemptTime > 15 * 60 * 1000) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): { locked: boolean; waitMinutes?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier) || { count: 0, firstAttemptTime: now };
  attempt.count += 1;

  if (attempt.count >= 5) {
    // Lock for 15 minutes
    attempt.lockedUntil = now + 15 * 60 * 1000;
    loginAttempts.set(identifier, attempt);
    return { locked: true, waitMinutes: 15 };
  }

  loginAttempts.set(identifier, attempt);
  return { locked: false };
}

export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Input sanitizer to prevent XSS
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '')
    .trim();
}

// Slug generator for Bengali & English URLs
export function generateSlug(text: string): string {
  const cleaned = text
    .trim()
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return cleaned || `news-${Date.now()}`;
}
