import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const PoolInfo = () => {
  const { connection } = useConnection();
  const [poolInfo, setPoolInfo] = useState({
    tokenX: 'SOL',
    tokenY: 'USDC',
    reserveX: '100',
    reserveY: '10000',
    fee: '0.3%',
    status: 'Active'
  });

  // In a real app, you would fetch the actual pool info from your program
  useEffect(() => {
    // This is just a placeholder - replace with your actual pool info fetching logic
    const fetchPoolInfo = async () => {
      try {
        // Fetch pool info from your program
        // Example: const info = await program.account.config.fetch(configPubkey);
        // setPoolInfo(info);
      } catch (error) {
        console.error('Error fetching pool info:', error);
      }
    };

    fetchPoolInfo();
  }, [connection]);

  return (
    <div className="mb-4">
      <h2>Pool Information</h2>
      <div className="flex justify-between mb-4">
        <div>
          <div><strong>Pair:</strong> {poolInfo.tokenX}/{poolInfo.tokenY}</div>
          <div><strong>Fee:</strong> {poolInfo.fee}</div>
        </div>
        <div>
          <div><strong>Reserve X:</strong> {poolInfo.reserveX} {poolInfo.tokenX}</div>
          <div><strong>Reserve Y:</strong> {poolInfo.reserveY} {poolInfo.tokenY}</div>
        </div>
        <div>
          <div>
            <strong>Status:</strong> 
            <span className={poolInfo.status === 'Active' ? 'text-success' : 'text-error'}>
              {' '}{poolInfo.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolInfo;
