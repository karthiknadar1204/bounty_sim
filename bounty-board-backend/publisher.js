// publisher.js
require('dotenv').config();
const { Pool } = require('pg');
const Redis = require('ioredis');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const publisher = new Redis(process.env.REDIS_URL);

async function claimBounty(bountyId, hackathonId) {
  // Simulate DB update
  await pool.query(
    'UPDATE bounties SET status = $1, updated_at = NOW() WHERE id = $2 AND hackathon_id = $3',
    ['claimed', bountyId, hackathonId]
  );

  // Publish delta
  const delta = { id: bountyId, status: 'claimed', updated_at: new Date().toISOString() };
  await publisher.publish(`bounty:${hackathonId}`, JSON.stringify(delta));
  console.log(`Published delta for bounty ${bountyId}:`, delta);
}

// Example: Claim bounty 1 in 'ethindia-2024'
claimBounty(1, 'ethindia-2024');