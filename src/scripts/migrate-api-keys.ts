#!/usr/bin/env tsx

import 'dotenv/config';
import db from '../lib/db';

async function addApiKeysTable() {
  try {
    console.log('Checking if api_keys table exists...');
    
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='api_keys'").get();
    
    if (tableInfo) {
      console.log('Table api_keys already exists. Skipping migration.');
      return;
    }
    
    console.log('Creating api_keys table...');
    db.exec(`
      CREATE TABLE api_keys (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        scopes TEXT NOT NULL DEFAULT 'read',
        is_active BOOLEAN DEFAULT true,
        last_used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
      CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
    `);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addApiKeysTable();
