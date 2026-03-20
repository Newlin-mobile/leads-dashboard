#!/usr/bin/env tsx

import 'dotenv/config';
import db from '../lib/db';

async function addFollowUpColumn() {
  try {
    console.log('Checking if follow_up_date column exists...');
    
    // Check if column exists
    const tableInfo = db.prepare("PRAGMA table_info(leads)").all() as { name: string }[];
    const hasFollowUpDate = tableInfo.some(col => col.name === 'follow_up_date');
    
    if (hasFollowUpDate) {
      console.log('Column follow_up_date already exists. Skipping migration.');
      return;
    }
    
    console.log('Adding follow_up_date column to leads table...');
    db.prepare('ALTER TABLE leads ADD COLUMN follow_up_date DATETIME').run();
    
    console.log('Creating index on follow_up_date...');
    db.prepare('CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(follow_up_date)').run();
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addFollowUpColumn();
