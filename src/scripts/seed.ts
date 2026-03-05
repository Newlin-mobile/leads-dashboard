#!/usr/bin/env tsx

import 'dotenv/config';
import { hashPassword } from '../lib/auth';
import db, { generateId, generateApiKey } from '../lib/db';

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Create admin user
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    
    if (!existingAdmin) {
      const adminId = generateId();
      const adminApiKey = generateApiKey();
      const passwordHash = await hashPassword(adminPassword);
      
      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, role, plan, api_key)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(adminId, adminEmail, 'Admin User', passwordHash, 'super_admin', 'business', adminApiKey);
      
      console.log(`✅ Created admin user: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   API Key: ${adminApiKey}`);
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create demo user
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123';
    
    const existingDemo = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail);
    
    if (!existingDemo) {
      const demoId = generateId();
      const demoApiKey = generateApiKey();
      const passwordHash = await hashPassword(demoPassword);
      
      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, role, plan, api_key)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(demoId, demoEmail, 'Demo User', passwordHash, 'user', 'free', demoApiKey);
      
      // Create demo project
      const projectId = generateId();
      const projectApiKey = generateApiKey();
      
      db.prepare(`
        INSERT INTO projects (id, user_id, name, domain, api_key)
        VALUES (?, ?, ?, ?, ?)
      `).run(projectId, demoId, 'Demo Project', 'https://example.com', projectApiKey);
      
      console.log(`✅ Created demo user: ${demoEmail}`);
      console.log(`   Password: ${demoPassword}`);
      console.log(`   API Key: ${demoApiKey}`);
      console.log(`✅ Created demo project`);
    } else {
      console.log('✅ Demo user already exists');
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log(`- Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`- Demo: ${demoEmail} / ${demoPassword}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();