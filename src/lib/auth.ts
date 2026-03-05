import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import db, { generateId, generateApiKey } from './db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Generate one with: openssl rand -hex 32');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = process.env.APP_NAME?.toLowerCase().replace(/\s+/g, '_') + '_session' || 'app_session';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  api_key: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  plan: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Set session cookie
export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

// Get current session
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

// Clear session
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  
  const user = db.prepare(`
    SELECT id, email, name, role, plan, api_key, is_active, created_at 
    FROM users WHERE id = ? AND is_active = 1
  `).get(session.userId) as User | undefined;
  
  return user || null;
}

// Register new user
export async function registerUser(
  email: string, 
  password: string, 
  name?: string
): Promise<{ user?: User; error?: string }> {
  try {
    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return { error: 'Email is already in use' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = generateId();
    const apiKey = generateApiKey();

    // Create user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, api_key) 
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email.toLowerCase(), passwordHash, name || null, apiKey);

    // Get the created user
    const user = db.prepare(`
      SELECT id, email, name, role, plan, api_key, is_active, created_at 
      FROM users WHERE id = ?
    `).get(userId) as User;

    return { user };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to create account' };
  }
}

// Login user
export async function loginUser(
  email: string, 
  password: string
): Promise<{ user?: User; error?: string }> {
  try {
    const user = db.prepare(`
      SELECT id, email, name, role, plan, api_key, is_active, created_at, password_hash 
      FROM users WHERE email = ? AND is_active = 1
    `).get(email.toLowerCase()) as (User & { password_hash: string }) | undefined;

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return { error: 'Invalid email or password' };
    }

    // Set session
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    // Return user without password
    const { password_hash, ...safeUser } = user;
    return { user: safeUser };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed' };
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  await clearSession();
}

// Change password
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = db.prepare(`
      SELECT password_hash FROM users WHERE id = ? AND is_active = 1
    `).get(userId) as { password_hash: string } | undefined;

    if (!user) {
      return { error: 'User not found' };
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return { error: 'Current password is incorrect' };
    }

    const newPasswordHash = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, userId);

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Failed to change password' };
  }
}

// Create password reset token
export async function createPasswordResetToken(email: string): Promise<string> {
  return new SignJWT({ email, type: 'password_reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'password_reset') return null;
    return payload.email as string;
  } catch {
    return null;
  }
}

// Reset password with token
export async function resetPassword(
  token: string, 
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const email = await verifyPasswordResetToken(token);
    if (!email) {
      return { error: 'Invalid or expired reset link' };
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1').get(email.toLowerCase());
    if (!user) {
      return { error: 'User not found' };
    }

    const passwordHash = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email.toLowerCase());

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Failed to reset password' };
  }
}

// Generate new API key for user
export async function regenerateApiKey(userId: string): Promise<{ apiKey?: string; error?: string }> {
  try {
    const newApiKey = generateApiKey();
    db.prepare('UPDATE users SET api_key = ? WHERE id = ?').run(newApiKey, userId);
    return { apiKey: newApiKey };
  } catch (error) {
    console.error('Regenerate API key error:', error);
    return { error: 'Failed to regenerate API key' };
  }
}

// Verify API key and get user
export async function getUserByApiKey(apiKey: string): Promise<User | null> {
  const user = db.prepare(`
    SELECT id, email, name, role, plan, api_key, is_active, created_at 
    FROM users WHERE api_key = ? AND is_active = 1
  `).get(apiKey) as User | undefined;
  
  return user || null;
}

// Plan limits
export const PLAN_LIMITS: Record<string, { projects: number; features: string[] }> = {
  free: { projects: 1, features: ['basic_monitoring'] },
  pro: { projects: 10, features: ['basic_monitoring', 'advanced_analytics'] },
  business: { projects: 100, features: ['basic_monitoring', 'advanced_analytics', 'priority_support'] },
};

// Check if user can create more projects
export function canCreateProject(user: User): boolean {
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND is_active = 1').get(user.id) as { count: number };
  const limit = PLAN_LIMITS[user.plan]?.projects || 1;
  return projectCount.count < limit;
}

// Role checks
export function isAdmin(user: User): boolean {
  return user.role === 'admin' || user.role === 'super_admin';
}

export function isSuperAdmin(user: User): boolean {
  return user.role === 'super_admin';
}