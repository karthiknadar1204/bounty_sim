// src/App.js
import React, { useState } from 'react';
import useBountyFeed from './components/useBountyFeed';
import BountyList from './components/BountyList';

function App() {
  const [hackathonId] = useState('ethindia-2024');  // Fixed for demo
  const { bounties, isConnected, claimBounty } = useBountyFeed(hackathonId);

  return (
    <div className="App">
      <h1>Live Bounty Board - {hackathonId}</h1>
      <p>Connection: {isConnected ? '🟢 Live' : '🔴 Offline'}</p>
      <BountyList bounties={bounties} onClaim={claimBounty} />
    </div>
  );
}

export default App;