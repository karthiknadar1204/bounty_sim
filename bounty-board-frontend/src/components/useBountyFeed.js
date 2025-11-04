// src/hooks/useBountyFeed.js
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export default function useBountyFeed(hackathonId) {
  const [bounties, setBounties] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.io');
      setIsConnected(true);
      socketRef.current.emit('join-hackathon', hackathonId);  // Join room
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Initial full state
    socketRef.current.on('bounty:initial', (initialBounties) => {
      setBounties(initialBounties);  // Set full list
    });

    // Delta updates
    socketRef.current.on('bounty:updated', (delta) => {
      setBounties((prev) =>
        prev.map((b) => (b.id === delta.id ? { ...b, ...delta } : b))  // Merge delta
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [hackathonId]);

  const claimBounty = async (bountyId) => {
    // Simulate API call to claim (triggers publisher/Pub/Sub)
    fetch(`http://localhost:3001/claim/${bountyId}`, { method: 'POST' })
      .then(() => console.log(`Claimed bounty ${bountyId}`))
      .catch((err) => console.error(err));
  };

  return { bounties, isConnected, claimBounty };
}