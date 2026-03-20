import crypto from 'crypto';
import db from './db';

const API_KEY_PREFIX = 'lds_'; // Leads Dashboard Secret

export function generateApiKey(): { key: string; hash: string } {
  // Generate random 32 bytes = 256 bits
  const randomBytes = crypto.randomBytes(32);
  const key = API_KEY_PREFIX + randomBytes.toString('base64url');
  
  // Hash for storage (SHA-256)
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  
  return { key, hash };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function validateApiKey(key: string): { userId: string; scopes: string[] } | null {
  if (!key || !key.startsWith(API_KEY_PREFIX)) {
    return null;
  }
  
  const hash = hashApiKey(key);
  
  const apiKey = db.prepare(`
    SELECT user_id, scopes, is_active 
    FROM api_keys 
    WHERE key_hash = ?
  `).get(hash) as { user_id: string; scopes: string; is_active: number } | undefined;
  
  if (!apiKey || !apiKey.is_active) {
    return null;
  }
  
  // Update last_used_at
  db.prepare(`
    UPDATE api_keys 
    SET last_used_at = CURRENT_TIMESTAMP 
    WHERE key_hash = ?
  `).run(hash);
  
  return {
    userId: apiKey.user_id,
    scopes: apiKey.scopes.split(','),
  };
}

export function createApiKey(userId: string, name: string, scopes: string[] = ['read']): { id: string; key: string } {
  const { key, hash } = generateApiKey();
  const id = crypto.randomBytes(16).toString('hex');
  
  db.prepare(`
    INSERT INTO api_keys (id, user_id, name, key_hash, scopes)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, name, hash, scopes.join(','));
  
  return { id, key };
}

export function deleteApiKey(id: string, userId: string): boolean {
  const result = db.prepare(`
    DELETE FROM api_keys 
    WHERE id = ? AND user_id = ?
  `).run(id, userId);
  
  return result.changes > 0;
}

export function listApiKeys(userId: string) {
  return db.prepare(`
    SELECT id, name, scopes, is_active, last_used_at, created_at
    FROM api_keys
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);
}
