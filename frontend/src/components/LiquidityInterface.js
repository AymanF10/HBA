import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BN from 'bn.js';

const LiquidityInterface = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [activeTab, setActiveTab] = useState('deposit');
  const [amountX, setAmountX] = useState('');
  const [amountY, setAmountY] = useState('');
  const [lpAmount, setLpAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const tokenX = 'SOL';
  const tokenY = 'USDC';
  
  // Calculate the paired amount based on the current pool ratio
  // In a real app, you would use actual reserves
  useEffect(() => {
    if (activeTab === 'deposit') {
      if (amountX && !isNaN(parseFloat(amountX))) {
        // Simplified calculation for demo purposes
        // In a real app, you would use the actual pool ratio
        const x = parseFloat(amountX);
        const y = x * 100; // Simplified price ratio
        setAmountY(y.toFixed(6));
      } else if (amountY && !isNaN(parseFloat(amountY))) {
        const y = parseFloat(amountY);
        const x = y / 100; // Simplified price ratio
        setAmountX(x.toFixed(6));
      }
    }
  }, [amountX, amountY, activeTab]);

  const handleDeposit = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amountX || !amountY || isNaN(parseFloat(amountX)) || isNaN(parseFloat(amountY)) || 
        parseFloat(amountX) <= 0 || parseFloat(amountY) <= 0) {
      setError('Please enter valid amounts');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would create and send a transaction to your program
      // Example:
      // const tx = new Transaction();
      // tx.add(program.instruction.deposit(...));
      // const signature = await sendTransaction(tx, connection);
      // await connection.confirmTransaction(signature);
      
      // Simulate successful deposit for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(`Successfully deposited ${amountX} ${tokenX} and ${amountY} ${tokenY}`);
      setAmountX('');
      setAmountY('');
    } catch (err) {
      console.error('Deposit error:', err);
      setError(`Deposit failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!lpAmount || isNaN(parseFloat(lpAmount)) || parseFloat(lpAmount) <= 0) {
      setError('Please enter a valid LP amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would create and send a transaction to your program
      // Example:
      // const tx = new Transaction();
      // tx.add(program.instruction.withdraw(...));
      // const signature = await sendTransaction(tx, connection);
      // await connection.confirmTransaction(signature);
      
      // Simulate successful withdrawal for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate estimated amounts for demo
      const estimatedX = parseFloat(lpAmount) * 0.01;
      const estimatedY = parseFloat(lpAmount) * 1;
      
      setSuccess(`Successfully withdrew ${estimatedX.toFixed(6)} ${tokenX} and ${estimatedY.toFixed(6)} ${tokenY}`);
      setLpAmount('');
    } catch (err) {
      console.error('Withdraw error:', err);
      setError(`Withdraw failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Liquidity</h2>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('deposit');
            setAmountX('');
            setAmountY('');
            setLpAmount('');
            setError('');
            setSuccess('');
          }}
        >
          Deposit
        </div>
        <div 
          className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('withdraw');
            setAmountX('');
            setAmountY('');
            setLpAmount('');
            setError('');
            setSuccess('');
          }}
        >
          Withdraw
        </div>
      </div>
      
      <div className="card">
        {activeTab === 'deposit' ? (
          <>
            <div className="input-group">
              <label>{tokenX} Amount</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={amountX}
                  onChange={(e) => {
                    setAmountX(e.target.value);
                    setAmountY(''); // Clear Y when X is changed
                  }}
                  placeholder={`Enter ${tokenX} amount`}
                  disabled={isLoading}
                />
                <div style={{ marginLeft: '1rem', fontWeight: 'bold' }}>{tokenX}</div>
              </div>
            </div>
            
            <div className="input-group">
              <label>{tokenY} Amount</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={amountY}
                  onChange={(e) => {
                    setAmountY(e.target.value);
                    setAmountX(''); // Clear X when Y is changed
                  }}
                  placeholder={`Enter ${tokenY} amount`}
                  disabled={isLoading}
                />
                <div style={{ marginLeft: '1rem', fontWeight: 'bold' }}>{tokenY}</div>
              </div>
            </div>
            
            {error && <div className="text-error mb-4">{error}</div>}
            {success && <div className="text-success mb-4">{success}</div>}
            
            <button 
              className="button w-full"
              onClick={handleDeposit}
              disabled={isLoading || !publicKey || !amountX || !amountY}
            >
              {isLoading ? 'Processing...' : publicKey ? 'Deposit' : 'Connect Wallet to Deposit'}
            </button>
          </>
        ) : (
          <>
            <div className="input-group">
              <label>LP Token Amount</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={lpAmount}
                  onChange={(e) => setLpAmount(e.target.value)}
                  placeholder="Enter LP token amount"
                  disabled={isLoading}
                />
                <div style={{ marginLeft: '1rem', fontWeight: 'bold' }}>LP</div>
              </div>
            </div>
            
            {lpAmount && !isNaN(parseFloat(lpAmount)) && parseFloat(lpAmount) > 0 && (
              <div className="mt-4 mb-4">
                <div className="text-secondary">You will receive approximately:</div>
                <div className="flex justify-between mt-2">
                  <div>{(parseFloat(lpAmount) * 0.01).toFixed(6)} {tokenX}</div>
                  <div>{(parseFloat(lpAmount) * 1).toFixed(6)} {tokenY}</div>
                </div>
              </div>
            )}
            
            {error && <div className="text-error mb-4">{error}</div>}
            {success && <div className="text-success mb-4">{success}</div>}
            
            <button 
              className="button w-full"
              onClick={handleWithdraw}
              disabled={isLoading || !publicKey || !lpAmount}
            >
              {isLoading ? 'Processing...' : publicKey ? 'Withdraw' : 'Connect Wallet to Withdraw'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LiquidityInterface;
