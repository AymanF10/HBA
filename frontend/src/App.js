import React, { useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import Header from './components/Header';
import WalletConnect from './components/WalletConnect';
import PoolInfo from './components/PoolInfo';
import SwapInterface from './components/SwapInterface';
import LiquidityInterface from './components/LiquidityInterface';
import AdminPanel from './components/AdminPanel';
import { AmmProvider } from './utils/AmmContext';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Set up network and wallet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  const [activeTab, setActiveTab] = useState('swap');
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
        <AmmProvider>
          <div className="container">
            <Header />
            <WalletConnect setIsAdmin={setIsAdmin} />
            
            <div className="card">
              <PoolInfo />
              
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === 'swap' ? 'active' : ''}`}
                  onClick={() => setActiveTab('swap')}
                >
                  Swap
                </div>
                <div 
                  className={`tab ${activeTab === 'liquidity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('liquidity')}
                >
                  Liquidity
                </div>
                {isAdmin && (
                  <div 
                    className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                  >
                    Admin
                  </div>
                )}
              </div>
              
              {activeTab === 'swap' && <SwapInterface />}
              {activeTab === 'liquidity' && <LiquidityInterface />}
              {activeTab === 'admin' && isAdmin && <AdminPanel />}
            </div>
          </div>
        </AmmProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
