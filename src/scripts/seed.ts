#!/usr/bin/env tsx

import 'dotenv/config';
import { hashPassword } from '../lib/auth';
import db, { generateId } from '../lib/db';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create default user
    const userEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    const userPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(userEmail);

    let userId: string;

    if (!existingUser) {
      userId = generateId();
      const passwordHash = await hashPassword(userPassword);

      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, userEmail, 'Admin', passwordHash, 'user');

      console.log(`Created user: ${userEmail} / ${userPassword}`);
    } else {
      userId = (existingUser as { id: string }).id;
      console.log('User already exists');
    }

    // Create sample leads
    const existingLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE user_id = ?').get(userId) as { count: number };

    if (existingLeads.count === 0) {
      const sampleLeads = [
        { name: 'Acme Corp - Website Rebuild', source: 'hoofdkraan', status: 'go', value_type: 'eenmalig', value_amount: 15000 },
        { name: 'TechStart - API Development', source: 'freelancermap', status: 'gesprek', value_type: 'eenmalig', value_amount: 8500 },
        { name: 'CloudNine - DevOps Support', source: 'eigen-netwerk', status: 'go', value_type: 'recurring', value_amount: 3000 },
        { name: 'DataFlow - Dashboard Project', source: 'hoofdkraan', status: 'wacht', value_type: 'tbd', value_amount: 0 },
        { name: 'GreenTech - Mobile App', source: 'freelancermap', status: 'rejected', value_type: 'eenmalig', value_amount: 25000 },
        { name: 'FinServe - Integration Work', source: 'eigen-netwerk', status: 'geen-reactie', value_type: 'eenmalig', value_amount: 12000 },
        { name: 'MediaHouse - CMS Migration', source: 'hoofdkraan', status: 'gesprek', value_type: 'eenmalig', value_amount: 9500 },
        { name: 'LogiTrack - Maintenance Contract', source: 'eigen-netwerk', status: 'go', value_type: 'recurring', value_amount: 2500 },
      ];

      const insertLead = db.prepare(`
        INSERT INTO leads (id, user_id, name, source, status, value_type, value_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertNote = db.prepare(`
        INSERT INTO lead_notes (id, lead_id, note)
        VALUES (?, ?, ?)
      `);

      for (const lead of sampleLeads) {
        const leadId = generateId();
        insertLead.run(leadId, userId, lead.name, lead.source, lead.status, lead.value_type, lead.value_amount);

        // Add a sample note
        insertNote.run(generateId(), leadId, `Initial contact made for ${lead.name}.`);
      }

      console.log(`Created ${sampleLeads.length} sample leads with notes`);
    } else {
      console.log('Sample leads already exist');
    }

    console.log('\nDatabase seeding completed!');
    console.log(`\nLogin with: ${userEmail} / ${userPassword}`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
