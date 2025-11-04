// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },  // React dev server
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();  // Separate sub for adapter

// Redis Adapter for multi-server scaling (Pub/Sub magic)
io.adapter(createAdapter(pubClient, subClient));

// Global subscriber for bounty updates (shared across all sockets)
const bountySubscriber = new Redis(process.env.REDIS_URL);
bountySubscriber.psubscribe('bounty:*');  // Subscribe to all bounty channels

bountySubscriber.on('pmessage', (pattern, channel, message) => {
  const hackathonId = channel.replace('bounty:', '');  // Extract hackathon ID from channel
  const delta = JSON.parse(message);
  io.to(hackathonId).emit('bounty:updated', delta);  // Broadcast to all sockets in the room
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React build (in prod)
app.use(express.static('../bounty-board-frontend/build'));

// Initial bounties on connect (for new users)
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-hackathon', async (hackathonId) => {
    socket.join(hackathonId);  // Room per hackathon
    console.log(`Socket ${socket.id} joined room: ${hackathonId}`);

    // Send full initial state (delta from empty)
    const res = await pool.query(
      'SELECT * FROM bounties WHERE hackathon_id = $1 ORDER BY id',
      [hackathonId]
    );
    socket.emit('bounty:initial', res.rows);  // Send to current socket
    // Delta updates are handled by the global subscriber above
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Add to app
app.post('/claim/:id', async (req, res) => {
  const { id } = req.params;

  await pool.query('UPDATE bounties SET status = $1 WHERE id = $2', ['claimed', id]);

  // This triggers Pub/Sub via a listener or manual publish
  const delta = { id: parseInt(id), status: 'claimed' };

  pubClient.publish(`bounty:ethindia-2024`, JSON.stringify(delta));

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server on :${PORT}`));