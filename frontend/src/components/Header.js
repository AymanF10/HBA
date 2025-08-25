import React from 'react';

const Header = () => {
  return (
    <header className="card flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 style={{ margin: 0 }}>Hybrid AMM</h1>
        <span style={{ 
          backgroundColor: 'var(--primary-light)', 
          color: 'white', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.75rem' 
        }}>
          Devnet
        </span>
      </div>
    </header>
  );
};

export default Header;
