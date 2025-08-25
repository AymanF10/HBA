import React, { createContext, useContext, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import AmmProgram from './ammProgram';

// Create context
const AmmContext = createContext(null);

// Provider component
export const AmmProvider = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Create AMM program instance when connection or wallet changes
  const ammProgram = useMemo(() => {
    if (connection && wallet) {
      return new AmmProgram(connection, wallet);
    }
    return null;
  }, [connection, wallet]);

  return (
    <AmmContext.Provider value={ammProgram}>
      {children}
    </AmmContext.Provider>
  );
};

// Hook to use the AMM context
export const useAmm = () => {
  const context = useContext(AmmContext);
  if (context === undefined) {
    throw new Error('useAmm must be used within an AmmProvider');
  }
  return context;
};

export default AmmContext;
