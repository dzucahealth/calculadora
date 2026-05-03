import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-memory token store
const tokenStore = new Map<string, { adminId: string; email: string; name: string; expiresAt: number }>();

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(adminId: string, email: string, name: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  tokenStore.set(token, { adminId, email, name, expiresAt });
  // Clean expired tokens periodically
  cleanExpiredTokens();
  return token;
}

export function validateToken(token: string): { adminId: string; email: string; name: string } | null {
  const data = tokenStore.get(token);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    tokenStore.delete(token);
    return null;
  }
  return { adminId: data.adminId, email: data.email, name: data.name };
}

export function revokeToken(token: string): void {
  tokenStore.delete(token);
}

function cleanExpiredTokens(): void {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}
