import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import db, { generateId } from './db';
import { validateApiKey } from './api-keys';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Generate one with: openssl rand -hex 32');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'leads_session';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  // Try session cookie first
  const session = await getSession();
  if (session) {
    const user = db.prepare(`
      SELECT id, email, name, role, is_active, created_at
      FROM users WHERE id = ? AND is_active = 1
    `).get(session.userId) as User | undefined;
    
    if (user) return user;
  }
  
  // Try Bearer token (API key)
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const apiKeyData = validateApiKey(token);
      
      if (apiKeyData) {
        const user = db.prepare(`
          SELECT id, email, name, role, is_active, created_at
          FROM users WHERE id = ? AND is_active = 1
        `).get(apiKeyData.userId) as User | undefined;
        
        return user || null;
      }
    }
  } catch {
    // Headers not available (not in request context)
  }
  
  return null;
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<{ user?: User; error?: string }> {
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return { error: 'Email is already in use' };
    }

    const passwordHash = await hashPassword(password);
    const userId = generateId();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email.toLowerCase(), passwordHash, name || null);

    const user = db.prepare(`
      SELECT id, email, name, role, is_active, created_at
      FROM users WHERE id = ?
    `).get(userId) as User;

    return { user };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to create account' };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  try {
    const user = db.prepare(`
      SELECT id, email, name, role, is_active, created_at, password_hash
      FROM users WHERE email = ? AND is_active = 1
    `).get(email.toLowerCase()) as (User & { password_hash: string }) | undefined;

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return { error: 'Invalid email or password' };
    }

    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...safeUser } = user;
    return { user: safeUser };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed' };
  }
}

export async function logoutUser(): Promise<void> {
  await clearSession();
}
