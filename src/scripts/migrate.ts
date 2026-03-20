#!/usr/bin/env tsx

import 'dotenv/config';
import db from '../lib/db';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // The database initialization happens automatically when importing db
    // Check tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    console.log('Tables:', tables.map(t => t.name).join(', '));

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    console.log(`Users: ${userCount.count}`);

    const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    console.log(`Leads: ${leadCount.count}`);

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
