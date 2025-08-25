import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BN from 'bn.js';

const SwapInterface = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [isXtoY, setIsXtoY] = useState(true);
  const [slippage, setSlippage] = useState(1); // 1%
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Token labels based on swap direction
  const inputToken = isXtoY ? 'SOL' : 'USDC';
  const outputToken = isXtoY ? 'USDC' : 'SOL';

  // Calculate the expected output amount based on constant product formula
  // In a real app, you would use actual reserves and account for fees
  useEffect(() => {
    if (inputAmount && !isNaN(parseFloat(inputAmount))) {
      // Simplified calculation for demo purposes
      // In a real app, you would use the actual constant product formula with fees
      const input = parseFloat(inputAmount);
      let output;
      
      if (isXtoY) {
        // X to Y (e.g., SOL to USDC)
        output = input * 100; // Simplified price ratio
      } else {
        // Y to X (e.g., USDC to SOL)
        output = input / 100; // Simplified price ratio
      }
      
      // Apply "fee" for demo purposes
      output = output * 0.997; // 0.3% fee
      
      setOutputAmount(output.toFixed(6));
    } else {
      setOutputAmount('');
    }
  }, [inputAmount, isXtoY]);

  const handleSwapDirectionToggle = () => {
    setIsXtoY(!isXtoY);
    setInputAmount('');
    setOutputAmount('');
  };

  const handleSwap = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!inputAmount || isNaN(parseFloat(inputAmount)) || parseFloat(inputAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would create and send a transaction to your program
      // Example:
      // const tx = new Transaction();
      // tx.add(program.instruction.swap(...));
      // const signature = await sendTransaction(tx, connection);
      // await connection.confirmTransaction(signature);
      
      // Simulate successful swap for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(`Successfully swapped ${inputAmount} ${inputToken} for ${outputAmount} ${outputToken}`);
      setInputAmount('');
      setOutputAmount('');
    } catch (err) {
      console.error('Swap error:', err);
      setError(`Swap failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate minimum output amount based on slippage
  const minOutputAmount = outputAmount ? 
    (parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(6) : '0';

  return (
    <div>
      <h2>Swap</h2>
      
      <div className="card">
        <div className="input-group">
          <label>From</label>
          <div className="flex items-center">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder={`Enter ${inputToken} amount`}
              disabled={isLoading}
            />
            <div style={{ marginLeft: '1rem', fontWeight: 'bold' }}>{inputToken}</div>
          </div>
        </div>
        
        <div className="flex justify-center my-4">
          <button 
            className="button-secondary"
            onClick={handleSwapDirectionToggle}
            disabled={isLoading}
          >
            ↑↓
          </button>
        </div>
        
        <div className="input-group">
          <label>To (estimated)</label>
          <div className="flex items-center">
            <input
              type="text"
              value={outputAmount}
              readOnly
              placeholder={`Estimated ${outputToken} amount`}
            />
            <div style={{ marginLeft: '1rem', fontWeight: 'bold' }}>{outputToken}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-secondary mb-2">
            <span>Minimum received (with {slippage}% slippage):</span>
            <span>{minOutputAmount} {outputToken}</span>
          </div>
          
          <div className="flex justify-between text-secondary mb-4">
            <span>Fee:</span>
            <span>0.3%</span>
          </div>
          
          <div className="flex gap-2 mb-2">
            <button 
              className={`button-secondary ${slippage === 0.5 ? 'active' : ''}`}
              onClick={() => setSlippage(0.5)}
            >
              0.5%
            </button>
            <button 
              className={`button-secondary ${slippage === 1 ? 'active' : ''}`}
              onClick={() => setSlippage(1)}
            >
              1%
            </button>
            <button 
              className={`button-secondary ${slippage === 2 ? 'active' : ''}`}
              onClick={() => setSlippage(2)}
            >
              2%
            </button>
          </div>
        </div>
        
        {error && <div className="text-error mb-4">{error}</div>}
        {success && <div className="text-success mb-4">{success}</div>}
        
        <button 
          className="button w-full"
          onClick={handleSwap}
          disabled={isLoading || !publicKey || !inputAmount}
        >
          {isLoading ? 'Processing...' : publicKey ? 'Swap' : 'Connect Wallet to Swap'}
        </button>
      </div>
    </div>
  );
};

export default SwapInterface;
