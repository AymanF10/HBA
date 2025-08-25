import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';

const WalletConnect = ({ setIsAdmin }) => {
  const { publicKey } = useWallet();

  // For demo purposes, we'll consider a specific public key as admin
  // In a real app, you would check against the actual admin key from your program
  useEffect(() => {
    if (publicKey) {
      // This is just a placeholder - replace with your actual admin check logic
      const isAdminWallet = publicKey.toString() === 'ADMIN_PUBKEY_HERE';
      setIsAdmin(isAdminWallet);
    } else {
      setIsAdmin(false);
    }
  }, [publicKey, setIsAdmin]);

  return (
    <div className="card flex justify-between items-center">
      <div>
        {publicKey ? (
          <div>
            <span>Connected: </span>
            <span style={{ fontWeight: 'bold' }}>
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </span>
          </div>
        ) : (
          <span>Not connected</span>
        )}
      </div>
      <WalletMultiButton />
    </div>
  );
};

export default WalletConnect;
