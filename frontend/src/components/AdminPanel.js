import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const AdminPanel = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [isPoolLocked, setIsPoolLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // In a real app, you would fetch the actual pool status
  useEffect(() => {
    // This is just a placeholder - replace with your actual status fetching logic
    const fetchPoolStatus = async () => {
      try {
        // Example: const config = await program.account.config.fetch(configPubkey);
        // setIsPoolLocked(config.locked);
      } catch (error) {
        console.error('Error fetching pool status:', error);
      }
    };

    fetchPoolStatus();
  }, [connection]);

  const handleToggleLock = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would create and send a transaction to your program
      // Example:
      // const tx = new Transaction();
      // tx.add(program.instruction.lock/unlock(...));
      // const signature = await sendTransaction(tx, connection);
      // await connection.confirmTransaction(signature);
      
      // Simulate successful toggle for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsPoolLocked(!isPoolLocked);
      setSuccess(`Pool successfully ${!isPoolLocked ? 'locked' : 'unlocked'}`);
    } catch (err) {
      console.error('Toggle error:', err);
      setError(`Failed to ${isPoolLocked ? 'unlock' : 'lock'} pool: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div>
      <h2>Admin Panel</h2>
      
      <div className="card">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <strong>Pool Status:</strong> 
              <span className={isPoolLocked ? 'text-error' : 'text-success'}>
                {' '}{isPoolLocked ? 'Locked' : 'Active'}
              </span>
            </div>
            
            <button 
              className={`button ${isPoolLocked ? 'button-secondary' : ''}`}
              onClick={handleToggleLock}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isPoolLocked ? 'Unlock Pool' : 'Lock Pool'}
            </button>
          </div>
        </div>
        
        {error && <div className="text-error mb-4">{error}</div>}
        {success && <div className="text-success mb-4">{success}</div>}
        
        <div className="text-secondary mt-4">
          <p>
            <strong>Note:</strong> As an admin, you can lock or unlock the pool. 
            When locked, users cannot swap tokens or withdraw liquidity.
          </p>
        </div>
      </div>
    </div>
  );
};


export default AdminPanel;
