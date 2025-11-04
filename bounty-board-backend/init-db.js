// init-db.js
// Run this script to initialize the database schema
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema initialized successfully!');
    
    // Optionally insert some sample data
    const sampleBounties = [
      {
        hackathon_id: 'ethindia-2024',
        title: 'Build a DeFi Dashboard',
        description: 'Create a beautiful dashboard for tracking DeFi protocols',
        amount: 5000,
        status: 'open'
      },
      {
        hackathon_id: 'ethindia-2024',
        title: 'NFT Marketplace Integration',
        description: 'Integrate NFT marketplace APIs into our platform',
        amount: 3000,
        status: 'open'
      },
      {
        hackathon_id: 'ethindia-2024',
        title: 'Smart Contract Audit',
        description: 'Perform security audit on our smart contracts',
        amount: 8000,
        status: 'open'
      }
    ];

    for (const bounty of sampleBounties) {
      await pool.query(
        `INSERT INTO bounties (hackathon_id, title, description, amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [bounty.hackathon_id, bounty.title, bounty.description, bounty.amount, bounty.status]
      );
    }
    
    console.log('✅ Sample bounties inserted!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();

