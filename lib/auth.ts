import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'harmonics-secure-jwt-secret-key-2026';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER';
  emailVerified: Date | null;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('harmonics_session')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }
  return user;
}

export async function requireRole(allowedRoles: ('OWNER' | 'ADMIN' | 'MODERATOR' | 'USER')[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions.');
  }
  return user;
}

export async function ensureOwnerAccountExists() {
  try {
    if (!db) return;
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@harmonics.app';
    const existingOwner = await db.user.findFirst({
      where: { role: 'OWNER' }
    });

    if (!existingOwner) {
      const defaultPasswordHash = await bcrypt.hash(process.env.OWNER_INITIAL_PASSWORD || 'HarmonicsOwner2026!', 10);
      await db.user.upsert({
        where: { email: ownerEmail },
        update: { role: 'OWNER' },
        create: {
          email: ownerEmail,
          name: 'Platform Owner',
          role: 'OWNER',
          passwordHash: defaultPasswordHash,
          emailVerified: new Date(),
          termsAccepted: true
        }
      });
    }
  } catch (err) {
    console.error('Owner provisioning check note:', err);
  }
}
