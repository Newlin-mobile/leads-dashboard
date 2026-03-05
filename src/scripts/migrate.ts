#!/usr/bin/env tsx

import 'dotenv/config';
import db from '../lib/db';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // The database initialization happens automatically when importing db
    // This script can be extended to add more migration logic
    
    // Check if admin user exists
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    
    if (!existingAdmin) {
      console.log('No admin user found. Run seed script to create one.');
    } else {
      console.log('Admin user already exists.');
    }
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();