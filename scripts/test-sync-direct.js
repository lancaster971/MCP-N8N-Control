#!/usr/bin/env node

// IMPORTANTE: Carica .env PRIMA di qualsiasi import
import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL presente?', process.env.DATABASE_URL ? 'Sì' : 'No');

// Ora importa i moduli
import { DatabaseConnection } from '../build/database/connection.js';

async function test() {
  try {
    console.log('Test connessione database...');
    const db = DatabaseConnection.getInstance();
    await db.connect();
    
    const result = await db.query('SELECT COUNT(*) as count FROM workflows');
    console.log('✅ Database connesso!');
    console.log('   Workflows nel database:', result.rows[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

test();