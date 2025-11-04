// src/components/BountyList.js
import React from 'react';

const BountyList = ({ bounties, onClaim }) => (
  <ul>
    {bounties.map((bounty) => (
      <li key={bounty.id} className={bounty.status === 'claimed' ? 'claimed' : 'open'}>
        <h3>{bounty.title} - ${bounty.amount}</h3>
        <p>Status: {bounty.status.toUpperCase()}</p>
        {bounty.status === 'open' && <button onClick={() => onClaim(bounty.id)}>Claim!</button>}
      </li>
    ))}
  </ul>
);

export default BountyList;